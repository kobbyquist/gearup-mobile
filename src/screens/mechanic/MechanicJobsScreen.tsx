import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import { paymentService } from '../../services/paymentService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function MechanicJobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [paidJobs, setPaidJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchJobs = async () => {
    try {
      const data = await jobService.getMyJobsAsMechanic();
      const sorted = [...data].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);

      const completedJobs = sorted.filter((j: any) => j.status === 'COMPLETED');
      const paidIds: number[] = [];
      await Promise.all(
        completedJobs.map(async (job: any) => {
          try {
            const payment = await paymentService.getPaymentByJob(job.id);
            if (payment && payment.status === 'COMPLETED') {
              paidIds.push(job.id);
            }
          } catch {
            // no payment exists yet for this job — leave it unpaid
          }
        })
      );
      setPaidJobs(paidIds);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchJobs(); };

  const handleEditPrice = (job: any) => {
    Alert.prompt(
      'Edit Final Price',
      `Current: GHS ${job.finalCost || 0}\nEnter new price (GHS)`,
      async (newCost) => {
        const parsed = parseFloat(newCost as string);
        if (!newCost || isNaN(parsed) || parsed <= 0) {
          Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
          return;
        }
        try {
          await jobService.updateFinalCost(job.id, parsed);
          fetchJobs();
          Alert.alert('Success', 'Price updated!');
        } catch (e: any) {
          Alert.alert('Error', e.message);
        }
      }
    );
  };

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
              <Text style={styles.dateText}>
                {new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(job.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
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
                      const parsed = parseFloat(cost as string);
                      if (!cost || isNaN(parsed) || parsed <= 0) {
                        Alert.alert('Invalid Amount', 'Please enter a valid positive number for the cost.');
                        return;
                      }
                      try {
                        await jobService.completeJob(job.id, parsed);
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
              {job.status === 'COMPLETED' && !paidJobs.includes(job.id) && (
                <TouchableOpacity style={styles.editPriceBtn} onPress={() => handleEditPrice(job)}>
                  <Ionicons name="pencil-outline" size={14} color="#b45309" />
                  <Text style={styles.editPriceBtnText}>Edit Price</Text>
                </TouchableOpacity>
              )}
              {job.status === 'COMPLETED' && paidJobs.includes(job.id) && (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.paidText}>Paid</Text>
                </View>
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
  tabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: '#fff', maxHeight: 52 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, marginRight: 8, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#b45309' },
  tabText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  list: { flex: 1, padding: SPACING.lg },
  jobCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  dateText: { fontSize: FONT_SIZES.xs, color: '#9ca3af', marginBottom: 4 },
  jobDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 8 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  costText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332', marginTop: 6 },
  startBtn: { marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: RADIUS.md, alignItems: 'center' },
  startBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2563eb' },
  completeBtn: { marginTop: 8, padding: 10, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, alignItems: 'center' },
  completeBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  editPriceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#fffbeb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fde68a' },
  editPriceBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, padding: 8, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, justifyContent: 'center' },
  paidText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
});