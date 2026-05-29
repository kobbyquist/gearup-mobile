import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const TABS = ['All', 'Active', 'Completed'];
const MOCK_JOBS = [
  { id: '1', client: 'Kwame Asante', title: 'Engine check & oil change', status: 'IN_PROGRESS', date: 'Today', amount: 'GHS 180', type: 'STANDARD' },
  { id: '2', client: 'Ama Boateng', title: 'Battery replacement', status: 'COMPLETED', date: 'May 27', amount: 'GHS 120', type: 'SOS' },
  { id: '3', client: 'Kojo Mensah', title: 'Full service — Toyota Corolla', status: 'COMPLETED', date: 'May 25', amount: 'GHS 350', type: 'STANDARD' },
];

const STATUS_COLOR: Record<string, string> = { COMPLETED: '#1b4332', IN_PROGRESS: '#b45309', PENDING: '#1d4ed8' };
const STATUS_BG: Record<string, string> = { COMPLETED: '#f0fdf4', IN_PROGRESS: '#fffbeb', PENDING: '#eff6ff' };
const STATUS_LABEL: Record<string, string> = { COMPLETED: 'Completed', IN_PROGRESS: 'In Progress', PENDING: 'Pending' };

export default function MechanicJobsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = MOCK_JOBS.filter(j => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return j.status === 'IN_PROGRESS';
    if (activeTab === 'Completed') return j.status === 'COMPLETED';
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(job => (
          <TouchableOpacity key={job.id} style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{job.client[0]}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.clientName}>{job.client}</Text>
                <Text style={styles.jobTitle}>{job.title}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_BG[job.status] }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[job.status] }]}>{STATUS_LABEL[job.status]}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              {job.type === 'SOS' && <View style={styles.sosBadge}><Text style={styles.sosText}>SOS</Text></View>}
              <Text style={styles.date}>{job.date}</Text>
              <Text style={styles.amount}>{job.amount}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff', marginBottom: SPACING.md },
  tabs: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  tab: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: '#ffffff' },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: '#78350f' },
  list: { padding: SPACING.lg, gap: SPACING.sm },
  card: { backgroundColor: '#ffffff', borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#b45309' },
  info: { flex: 1 },
  clientName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b', marginBottom: 2 },
  jobTitle: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  sosBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  sosText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#dc2626' },
  date: { flex: 1, fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  amount: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b' },
});