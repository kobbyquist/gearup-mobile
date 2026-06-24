import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { jobService } from '../../services/jobService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function OwnerHomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 const fetchJobs = async () => {
    try {
      const data = await jobService.getMyJobsAsOwner();
      const sorted = [...data].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>What do you need help with today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => Alert.alert('SOS', 'Emergency request sent! A mechanic will contact you shortly.')}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.sosText}>SOS Emergency</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Jobs')}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.actionGradient}>
                <Ionicons name="add-circle-outline" size={24} color="#fbbf24" />
                <Text style={styles.actionText}>New Job</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Search')}>
              <LinearGradient colors={['#1e3a5f', '#2563eb']} style={styles.actionGradient}>
                <Ionicons name="search-outline" size={24} color="#93c5fd" />
                <Text style={styles.actionText}>Find Mechanic</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#4c1d95', '#7c3aed']} style={styles.actionGradient}>
                <Ionicons name="car-outline" size={24} color="#c4b5fd" />
                <Text style={styles.actionText}>My Vehicles</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          {loading ? (
            <ActivityIndicator color="#1b4332" style={{ marginTop: 20 }} />
          ) : jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No jobs yet</Text>
              <Text style={styles.emptySubText}>Create your first job request</Text>
            </View>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <TouchableOpacity key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>{job.status}</Text>
                  </View>
                </View>
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
                <View style={styles.jobFooter}>
                  <Ionicons name="construct-outline" size={14} color="#6b7280" />
                  <Text style={styles.jobMeta}>{job.type}</Text>
                  {job.location && (
                    <>
                      <Ionicons name="location-outline" size={14} color="#6b7280" style={{ marginLeft: 8 }} />
                      <Text style={styles.jobMeta}>{job.location}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
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
  subGreeting: { fontSize: FONT_SIZES.sm, color: '#86efac', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b4332' },
  sosButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dc2626', borderRadius: RADIUS.md, padding: SPACING.md },
  sosText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#ffffff' },
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b1b1b', marginBottom: SPACING.md },
  quickActions: { flexDirection: 'row', gap: SPACING.md },
  actionCard: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  actionGradient: { padding: SPACING.md, alignItems: 'center', gap: 6 },
  actionText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#ffffff', textAlign: 'center' },
  jobCard: { backgroundColor: '#ffffff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  jobDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 8 },
  jobFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMeta: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
  emptySubText: { fontSize: FONT_SIZES.sm, color: '#d1d5db', marginTop: 4 },
});