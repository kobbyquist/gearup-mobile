import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Kofi Auto Works', lastMessage: 'The oil change is done, you can pick up anytime.', time: '10:32 AM', unread: 2, online: true },
  { id: '2', name: 'Mensah Tyres', lastMessage: 'I have the front tyre in stock. When can you come?', time: 'Yesterday', unread: 0, online: false },
  { id: '3', name: 'Accra Motor Clinic', lastMessage: 'Thank you for your business!', time: 'May 20', unread: 0, online: true },
];

export default function OwnerMessagesScreen() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2d6a4f', '#1b4332']} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        ) : filtered.map(conv => (
          <TouchableOpacity key={conv.id} style={styles.row} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={['#52b788', '#1b4332']} style={styles.avatar}>
                <Text style={styles.avatarText}>{conv.name[0]}</Text>
              </LinearGradient>
              {conv.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.rowInfo}>
              <View style={styles.rowTop}>
                <Text style={styles.convName}>{conv.name}</Text>
                <Text style={styles.time}>{conv.time}</Text>
              </View>
              <View style={styles.rowBottom}>
                <Text style={styles.lastMsg} numberOfLines={1}>{conv.lastMessage}</Text>
                {conv.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread}</Text>
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
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff', marginBottom: SPACING.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 44, gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: '#9ca3af' },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: SPACING.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#ffffff' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#ffffff',
  },
  rowInfo: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  time: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  rowBottom: { flexDirection: 'row', alignItems: 'center' },
  lastMsg: { flex: 1, fontSize: FONT_SIZES.sm, color: '#6b7280' },
  unreadBadge: {
    backgroundColor: '#2d6a4f', width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
});