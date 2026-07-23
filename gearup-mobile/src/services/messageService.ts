import { supabase } from './supabaseClient';

export interface Message {
  id: string;
  job_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'job_card';
  metadata: JobCardMetadata | null;
  created_at: string;
  is_read: boolean;
}

export interface JobCardMetadata {
  jobId: number;
  title: string;
  description: string;
  jobType: string;
  location?: string;
  scheduledDate?: string | null;
  estimatedCost?: number | null;
  finalCost?: number | null;
  status: string;
  proposedCost?: number | null;
  proposedScheduledDate?: string | null;
  proposedNote?: string | null;
  proposedByMechanicId?: number | null;
  mechanicId?: number | null;
  isPaid?: boolean;
  biddingCost?: number | null;
  biddingNote?: string | null;
  biddingByUserId?: number | null;
}

const buildJobCardSummary = (meta: JobCardMetadata): string => {
  switch (meta.status) {
    case 'PENDING':
      return meta.proposedByMechanicId ? `🔧 Proposed changes: ${meta.title}` : `📋 New Job Request: ${meta.title}`;
    case 'ACCEPTED':
      return `✅ Job accepted: ${meta.title}`;
    case 'IN_PROGRESS':
      return `🔧 Job in progress: ${meta.title}`;
    case 'COMPLETED':
      return meta.isPaid ? `💰 Paid: ${meta.title}` : `✔️ Job completed: ${meta.title}`;
    case 'CANCELLED':
      return `❌ Job cancelled: ${meta.title}`;
    default:
      return `📋 Job update: ${meta.title}`;
  }
};

export const messageService = {
  sendMessage: async (jobId: number, senderId: number, receiverId: number, content: string): Promise<Message> => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ job_id: jobId, sender_id: senderId, receiver_id: receiverId, content, message_type: 'text' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Sends (or replaces) the single "job card" message for a given job within a specific
  // conversation thread (chatJobId — may differ from the real jobId if the thread was
  // reused). Deletes any prior job_card rows for that job so only the latest state shows.
  sendJobCard: async (chatJobId: number, senderId: number, receiverId: number, meta: JobCardMetadata): Promise<Message> => {
    await supabase
      .from('messages')
      .delete()
      .eq('job_id', chatJobId)
      .eq('message_type', 'job_card')
      .contains('metadata', { jobId: meta.jobId });

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        job_id: chatJobId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: buildJobCardSummary(meta),
        message_type: 'job_card',
        metadata: meta,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getMessages: async (jobId: number): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getConversations: async (userId: number): Promise<any[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Group by job_id and get latest message per conversation
    const conversations: Record<number, any> = {};
    (data || []).forEach(msg => {
      if (!conversations[msg.job_id]) {
        conversations[msg.job_id] = msg;
      }
    });

    return Object.values(conversations);
  },

  getConversationWithUser: async (myId: number, otherUserId: number): Promise<Message | null> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);
    return data && data.length > 0 ? data[0] : null;
  },

  deleteConversation: async (jobId: number): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('job_id', jobId);

    if (error) throw new Error(error.message);
  },

  markAsRead: async (jobId: number, receiverId: number): Promise<void> => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('job_id', jobId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);
  },

  subscribeToMessages: (jobId: number, onMessage: (message: Message) => void) => {
    const channel = supabase
      .channel(`messages:job_id=eq.${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          onMessage({ ...(payload.old as Message), _deleted: true } as any);
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribe: (channel: any) => {
    supabase.removeChannel(channel);
  },
};