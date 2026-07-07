import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { messageService } from '../../services/messageService';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function OwnerMessagesScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  const loadConversations = async () => {
    try {
      const myId = user?.userId;
      const [msgs, jobs] = await Promise.all([
        messageService.getConversations(myId),
        jobService.getMyJobsAsOwner(),
      ]);

      const enriched = await Promise.all(
        msgs.map(async (msg: any) => {
          const isPartOrder = msg.job_id < 0;
          // Conversations are reused across a mechanic's jobs — if the job that
          // originally started this thread was since deleted, fall back to a
          // generic label instead of hiding the conversation entirely.
          const job = isPartOrder
            ? { id: msg.job_id, title: 'Part Purchase', isPartOrder: true }
            : jobs.find((j: any) => j.id === msg.job_id) || { id: msg.job_id, title: 'Previous Job' };
          const otherUserId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
          let otherUserName = 'Mechanic';
          try {
            const profile = await userService.getUserById(otherUserId);
            otherUserName = profile.name;
          } catch {}
          return { ...msg, job, otherUserId, otherUserName };
        })
      );
      setConversations(enriched);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadConversations(); };

  const requestDelete = (convo: any) => {
    swipeableRefs.current[convo.id]?.close();
    setDeleteTarget(convo);
  };

  const confirmDelete = async () => {
    const convo = deleteTarget;
    setDeleteTarget(null);
    if (!convo) return;
    try {
      await messageService.deleteConversation(convo.job_id);
      setConversations(prev => prev.filter(c => c.job_id !== convo.job_id));
    } catch (e: any) {
      Alert.alert('Error', 'Could not delete conversation. Please try again.');
    }
  };
const getPreviewText = (convo: any): string => {
    const isMine = convo.sender_id === user?.userId;
    let text: string;
    if (convo.message_type === 'image') text = '📷 Photo';
    else if (convo.message_type === 'audio') text = '🎤 Voice message';
    else text = convo.content;
    return isMine ? `You: ${text}` : text;
  };
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-GB', { weekday: 'short' });
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const renderRightActions = (convo: any, progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={() => requestDelete(convo)} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', gap: 4 }}>
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#1b4332" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>
                Messages with mechanics will appear here after a job is accepted
              </Text>
            </View>
          ) : (
            conversations.map(convo => (
              <Swipeable
                key={convo.id}
                ref={(ref) => { swipeableRefs.current[convo.id] = ref; }}
                renderRightActions={(progress) => renderRightActions(convo, progress)}
                overshootRight={false}>
                <TouchableOpacity
                  style={styles.convoCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Chat', {
                    job: convo.job,
                    otherUserId: convo.otherUserId,
                    otherUserName: convo.otherUserName,
                  })}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.avatar}>
                      <Text style={styles.avatarText}>{convo.otherUserName?.[0]?.toUpperCase()}</Text>
                    </LinearGradient>
                    {!convo.is_read && convo.sender_id !== user?.userId && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  <View style={styles.convoInfo}>
                    <View style={styles.convoHeader}>
                      <Text style={styles.convoName}>{convo.otherUserName}</Text>
                      <Text style={styles.convoTime}>{formatTime(convo.created_at)}</Text>
                    </View>
                    <Text style={styles.convoJob} numberOfLines={1}>{convo.job?.title}</Text>
                    <View style={styles.convoMessageRow}>
                      {convo.sender_id === user?.userId && (
                        <Text style={styles.convoReceipt}>{convo.is_read ? '✓✓' : '✓'}</Text>
                      )}
                      <Text style={styles.convoMessage} numberOfLines={1}>{getPreviewText(convo)}</Text>
                    </View>
                  </View>
                  {!convo.is_read && convo.sender_id !== user?.userId && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>1</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Swipeable>
            ))
          )}

          {/* Start new conversation hint */}
          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={16} color="#9ca3af" />
            <Text style={styles.hintText}>
              Open a job and tap "Message Mechanic" to start a conversation
            </Text>
          </View>
        </ScrollView>
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        icon="trash-outline"
        title="Delete Conversation"
        message={`Delete your conversation with ${deleteTarget?.otherUserName}? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  convoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: SPACING.md, marginHorizontal: SPACING.lg, marginTop: SPACING.md, borderRadius: RADIUS.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  avatarContainer: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' },
  convoInfo: { flex: 1 },
  convoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  convoName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b' },
  convoTime: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  convoJob: { fontSize: FONT_SIZES.xs, color: '#1b4332', fontWeight: '600', marginBottom: 2 },
convoMessageRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  convoReceipt: { fontSize: FONT_SIZES.sm, color: '#1b4332', fontWeight: '600' },
  convoMessage: { fontSize: FONT_SIZES.sm, color: '#6b7280', flexShrink: 1 },
  unreadBadge: { backgroundColor: '#1b4332', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  unreadCount: { fontSize: 11, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: SPACING.xl, gap: 8 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af' },
  emptySubText: { fontSize: FONT_SIZES.sm, color: '#d1d5db', textAlign: 'center', lineHeight: 20 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: SPACING.lg, paddingTop: SPACING.md },
  hintText: { fontSize: FONT_SIZES.xs, color: '#9ca3af', flex: 1, lineHeight: 18 },
  deleteAction: { backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center', width: 80, marginTop: SPACING.md, marginRight: SPACING.lg, borderRadius: RADIUS.md },
  deleteActionText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff' },
});