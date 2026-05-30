import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function MechanicJobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchJobs = async () => {
    try {
      const data = await jobService.getMyJobsAsMechanic();
      setJobs(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchJobs(); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'ACCEPTED': return '#3b82f6';
      case 'IN_PROGRESS': return '#8b5cf6';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredJobs = activeTab === 'ALL' ? jobs : jobs.filter(j => j.status === activeTab);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {['ALL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}>
        {loading ? (
          <ActivityIndicator color="#b45309" style={{ marginTop: 40 }} />
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{job.status}</Text>
                </View>
              </View>
              <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
              <View style={styles.jobMeta}>
                <Ionicons name="construct-outline" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{job.type}</Text>
                {job.location && <>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={styles.metaText}>{job.location}</Text>
                </>}
              </View>
              {job.finalCost && (
                <Text style={styles.costText}>Final: GHS {job.finalCost}</Text>
              )}
              {job.status === 'ACCEPTED' && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={async () => {
                    try {
                      await jobService.startJob(job.id);
                      fetchJobs();
                    } catch (e: any) {
                      Alert.alert('Error', e.message);
                    }
                  }}>
                  <Text style={styles.startBtnText}>Start Job</Text>
                </TouchableOpacity>
              )}
              {job.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => {
                    Alert.prompt('Complete Job', 'Enter final cost (GHS)', async (cost) => {
                      try {
                        await jobService.completeJob(job.id, parseFloat(cost));
                        fetchJobs();
                        Alert.alert('Success', 'Job completed!');
                      } catch (e: any) {
                        Alert.alert('Error', e.message);
                      }
                    });
                  }}>
                  <Text style={styles.completeBtnText}>Complete Job</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  tabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: '#fff', maxHeight: 50 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, marginRight: 8, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#b45309' },
  tabText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  list: { flex: 1, padding: SPACING.lg },
  jobCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  jobDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 8 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  costText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332', marginTop: 6 },
  startBtn: { marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: RADIUS.md, alignItems: 'center' },
  startBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2563eb' },
  completeBtn: { marginTop: 8, padding: 10, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, alignItems: 'center' },
  completeBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
});