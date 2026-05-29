import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const MOCK_CONVS = [
  { id: '1', name: 'Kwame Asante', last: 'I\'m on my way, should be there in 10 minutes.', time: '10:45 AM', unread: 0, online: true },
  { id: '2', name: 'Ama Boateng', last: 'Thank you so much! Car is working perfectly now.', time: 'Yesterday', unread: 0, online: false },
  { id: '3', name: 'Kojo Mensah', last: 'Can you fit me in on Thursday morning?', time: 'May 25', unread: 1, online: false },
];

export default function MechanicMessagesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        {MOCK_CONVS.map(conv => (
          <TouchableOpacity key={conv.id} style={styles.row} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={['#fbbf24', '#78350f']} style={styles.avatar}>
                <Text style={styles.avatarText}>{conv.name[0]}</Text>
              </LinearGradient>
              {conv.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.info}>
              <View style={styles.top}>
                <Text style={styles.name}>{conv.name}</Text>
                <Text style={styles.time}>{conv.time}</Text>
              </View>
              <View style={styles.bottom}>
                <Text style={styles.lastMsg} numberOfLines={1}>{conv.last}</Text>
                {conv.unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conv.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  row: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: SPACING.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#ffffff' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#ffffff' },
  info: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  time: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  bottom: { flexDirection: 'row', alignItems: 'center' },
  lastMsg: { flex: 1, fontSize: FONT_SIZES.sm, color: '#6b7280' },
  badge: { backgroundColor: '#b45309', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
});