// This is the Mechanic home screen
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { jobService } from '../../services/jobService';
import { paymentService } from '../../services/paymentService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function MechanicHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [paidJobs, setPaidJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchJobs = async () => {
    try {
      const [available, mine] = await Promise.all([
        jobService.getAvailableJobs(),
        jobService.getMyJobsAsMechanic(),
      ]);
      const sortByDate = (arr: any[]) => [...arr].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedAvailable = sortByDate(available);
      const sortedMine = sortByDate(mine);
      setAvailableJobs(sortedAvailable);
      setMyJobs(sortedMine);

      const completedJobs = sortedMine.filter((j: any) => j.status === 'COMPLETED');
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

  const handleAcceptJob = async (jobId: number) => {
    try {
      await jobService.acceptJob(jobId);
      fetchJobs();
      Alert.alert('Success', 'Job accepted! Head to the location.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

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
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 🔧</Text>
            <Text style={styles.subGreeting}>Ready to help car owners?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.availabilityRow}>
          <Text style={styles.availabilityText}>
            {isAvailable ? '🟢 Available for jobs' : '🔴 Not available'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#6b7280', true: '#86efac' }}
            thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myJobs.filter(j => j.status === 'COMPLETED').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myJobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{availableJobs.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        {/* Active Jobs */}
        {myJobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Jobs</Text>
            {myJobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').map(job => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{job.status}</Text>
                  </View>
                </View>
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
                {job.location && (
                  <View style={styles.jobMeta}>
                    <Ionicons name="location-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{job.location}</Text>
                  </View>
                )}
                {job.latitude && (
                  <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => navigation.getParent()?.navigate('MechanicMap', { job })}>
                    <Ionicons name="map-outline" size={14} color="#2563eb" />
                    <Text style={styles.mapBtnText}>View Owner Location</Text>
                  </TouchableOpacity>
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
              </View>
            ))}
          </View>
        )}

        {/* Awaiting Payment */}
        {myJobs.filter(j => j.status === 'COMPLETED' && !paidJobs.includes(j.id)).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awaiting Payment</Text>
            {myJobs.filter(j => j.status === 'COMPLETED' && !paidJobs.includes(j.id)).map(job => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{job.status}</Text>
                  </View>
                </View>
                <Text style={styles.costText}>Final: GHS {job.finalCost || 0}</Text>
                <TouchableOpacity style={styles.editPriceBtn} onPress={() => handleEditPrice(job)}>
                  <Ionicons name="pencil-outline" size={14} color="#b45309" />
                  <Text style={styles.editPriceBtnText}>Edit Price</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Jobs Nearby</Text>
          {loading ? (
            <ActivityIndicator color="#b45309" style={{ marginTop: 20 }} />
          ) : availableJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No available jobs</Text>
              <Text style={styles.emptySubText}>Pull down to refresh</Text>
            </View>
          ) : (
            availableJobs.map(job => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobType}>{job.type}</Text>
                </View>
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
                {job.location && (
                  <View style={styles.jobMeta}>
                    <Ionicons name="location-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{job.location}</Text>
                  </View>
                )}
                {job.estimatedCost && (
                  <Text style={styles.costText}>Est. GHS {job.estimatedCost}</Text>
                )}
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptJob(job.id)}>
                  <LinearGradient colors={['#b45309', '#78350f']} style={styles.acceptGradient}>
                    <Text style={styles.acceptText}>Accept Job</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  subGreeting: { fontSize: FONT_SIZES.sm, color: '#fde68a', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#78350f' },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, padding: SPACING.md },
  availabilityText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  statsRow: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.md },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: '#b45309' },
  statLabel: { fontSize: FONT_SIZES.xs, color: '#6b7280', marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b1b1b', marginBottom: SPACING.md },
  jobCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b', flex: 1 },
  jobType: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#b45309', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  jobDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 8 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  costText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332', marginBottom: 8 },
  acceptBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8 },
  acceptGradient: { padding: 12, alignItems: 'center' },
  acceptText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  startBtn: { marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: RADIUS.md, alignItems: 'center' },
  startBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2563eb' },
  completeBtn: { marginTop: 8, padding: 10, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, alignItems: 'center' },
  completeBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#bfdbfe' },
  mapBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2563eb' },
  editPriceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, padding: 10, backgroundColor: '#fffbeb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fde68a' },
  editPriceBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
  emptySubText: { fontSize: FONT_SIZES.sm, color: '#d1d5db', marginTop: 4 },
});