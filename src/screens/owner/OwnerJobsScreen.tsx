import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

const MOCK_JOBS = [
  { id: '1', title: 'Engine check & oil change', mechanic: 'Kofi Auto Works', status: 'COMPLETED', date: 'May 26, 2026', cost: 'GHS 180', type: 'STANDARD' },
  { id: '2', title: 'Tyre replacement — front left', mechanic: 'Mensah Tyres', status: 'IN_PROGRESS', date: 'May 28, 2026', cost: 'GHS 220', type: 'STANDARD' },
  { id: '3', title: 'Roadside battery jump', mechanic: 'Accra Motor Clinic', status: 'COMPLETED', date: 'May 20, 2026', cost: 'GHS 80', type: 'SOS' },
  { id: '4', title: 'AC regas & service', mechanic: 'Kwame AC Works', status: 'PENDING', date: 'May 29, 2026', cost: 'GHS 350', type: 'STANDARD' },
];

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: '#1b4332', IN_PROGRESS: '#b45309',
  PENDING: '#1d4ed8', CANCELLED: '#dc2626',
};
const STATUS_BG: Record<string, string> = {
  COMPLETED: '#f0fdf4', IN_PROGRESS: '#fffbeb',
  PENDING: '#eff6ff', CANCELLED: '#fef2f2',
};
const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Completed', IN_PROGRESS: 'In Progress',
  PENDING: 'Pending', CANCELLED: 'Cancelled',
};

export default function OwnerJobsScreen() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = MOCK_JOBS.filter(j => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['PENDING', 'IN_PROGRESS'].includes(j.status);
    if (activeTab === 'Completed') return j.status === 'COMPLETED';
    if (activeTab === 'Cancelled') return j.status === 'CANCELLED';
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2d6a4f', '#1b4332']} style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        ) : filtered.map(job => (
          <TouchableOpacity key={job.id} style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <View style={styles.jobIcon}>
                <Ionicons
                  name={job.type === 'SOS' ? 'warning-outline' : 'construct-outline'}
                  size={20}
                  color={job.type === 'SOS' ? '#dc2626' : '#2d6a4f'}
                />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMechanic}>{job.mechanic}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[job.status] }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[job.status] }]}>
                  {STATUS_LABEL[job.status]}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              {job.type === 'SOS' && (
                <View style={styles.sosBadge}>
                  <Text style={styles.sosBadgeText}>SOS</Text>
                </View>
              )}
              <Text style={styles.date}>{job.date}</Text>
              <Text style={styles.cost}>{job.cost}</Text>
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
  tabTextActive: { color: '#1b4332' },
  list: { padding: SPACING.lg, gap: SPACING.sm },
  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: '#9ca3af' },
  card: {
    backgroundColor: '#ffffff', borderRadius: RADIUS.md, padding: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, gap: SPACING.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  jobIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b1b1b', marginBottom: 2 },
  jobMechanic: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  sosBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  sosBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#dc2626' },
  date: { flex: 1, fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  cost: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b' },
});