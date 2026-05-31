import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Kwame Mensah', role: 'Mechanic', lastMessage: 'I am on my way to your location', time: '2m ago', unread: 2, avatar: 'K' },
  { id: 2, name: 'Kofi Asante', role: 'Mechanic', lastMessage: 'The repair will cost GHS 350', time: '1h ago', unread: 0, avatar: 'K' },
  { id: 3, name: 'Ama Boateng', role: 'Mechanic', lastMessage: 'Job completed successfully!', time: '2h ago', unread: 0, avatar: 'A' },
];

export default function OwnerMessagesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {MOCK_CONVERSATIONS.map(convo => (
          <TouchableOpacity key={convo.id} style={styles.convoCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.avatar}>
                <Text style={styles.avatarText}>{convo.avatar}</Text>
              </LinearGradient>
              {convo.unread > 0 && (
                <View style={styles.unreadDot} />
              )}
            </View>
            <View style={styles.convoInfo}>
              <View style={styles.convoHeader}>
                <Text style={styles.convoName}>{convo.name}</Text>
                <Text style={styles.convoTime}>{convo.time}</Text>
              </View>
              <Text style={styles.convoRole}>{convo.role}</Text>
              <Text style={styles.convoMessage} numberOfLines={1}>{convo.lastMessage}</Text>
            </View>
            {convo.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{convo.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoon}>
          <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
          <Text style={styles.comingSoonTitle}>Real-time messaging coming soon</Text>
          <Text style={styles.comingSoonText}>Full in-app chat with mechanics will be available in the next update.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff', flex: 1 },
  badge: { backgroundColor: '#dc2626', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff' },
  list: { flex: 1, padding: SPACING.lg },
  convoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  avatarContainer: { position: 'relative', marginRight: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  convoInfo: { flex: 1 },
  convoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convoName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  convoTime: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  convoRole: { fontSize: FONT_SIZES.xs, color: '#1b4332', fontWeight: '600', marginBottom: 2 },
  convoMessage: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  unreadBadge: { backgroundColor: '#1b4332', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  unreadCount: { fontSize: 10, fontWeight: '700', color: '#fff' },
  comingSoon: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.lg, gap: SPACING.md },
  comingSoonTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#9ca3af', textAlign: 'center' },
  comingSoonText: { fontSize: FONT_SIZES.sm, color: '#d1d5db', textAlign: 'center' },
});