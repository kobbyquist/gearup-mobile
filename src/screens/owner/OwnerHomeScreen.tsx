import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../../services/jobService';
import { vehicleService } from '../../services/vehicleService';
import { paymentService } from '../../services/paymentService';
import { reviewService } from '../../services/reviewService';
import { locationService } from '../../services/locationService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const JOB_TYPES = ['TOWING', 'BATTERY', 'TIRE_CHANGE', 'FUEL', 'ENGINE', 'GENERAL'];

export default function OwnerJobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [paidJobs, setPaidJobs] = useState<number[]>([]);
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', vehicleId: '', type: 'GENERAL', location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const fetchData = async () => {
    try {
      const [jobsData, vehiclesData] = await Promise.all([
        jobService.getMyJobsAsOwner(),
        vehicleService.getMyVehicles()
      ]);
      const sorted = [...jobsData].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);
      setVehicles(vehiclesData);

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
            // no payment exists yet for this job — that's fine
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

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleCreateJob = async () => {
    if (!form.title || !form.description || !form.vehicleId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      await jobService.createJob({
        title: form.title,
        description: form.description,
        vehicleId: parseInt(form.vehicleId),
        type: form.type,
        location: form.location,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      });
      setModalVisible(false);
      setForm({ title: '', description: '', vehicleId: '', type: 'GENERAL', location: '', latitude: null, longitude: null });
      fetchData();
      Alert.alert('Success', 'Job created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    Alert.alert('Cancel Job', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          try {
            await jobService.cancelJob(jobId);
            fetchData();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const handlePayment = (job: any) => {
    Alert.alert(
      'Make Payment',
      `Pay GHS ${job.finalCost || 0} for this job?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mobile Money', onPress: async () => {
            try {
              const payment = await paymentService.createPayment({
                jobId: job.id,
                payeeId: job.mechanicId,
                amount: job.finalCost || 0,
                method: 'MOBILE_MONEY',
              });
              await paymentService.completePayment(payment.id);
              setPaidJobs(prev => [...prev, job.id]);
              fetchData();
              setCurrentJob(job);
              setRatingModal(true);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        },
        {
          text: 'Cash', onPress: async () => {
            try {
              const payment = await paymentService.createPayment({
                jobId: job.id,
                payeeId: job.mechanicId,
                amount: job.finalCost || 0,
                method: 'CASH',
              });
              await paymentService.completePayment(payment.id);
              setPaidJobs(prev => [...prev, job.id]);
              fetchData();
              setCurrentJob(job);
              setRatingModal(true);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0) {
      Alert.alert('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        jobId: currentJob.id,
        revieweeId: currentJob.mechanicId,
        rating: selectedRating,
        comment: ratingComment,
      });
      setRatingModal(false);
      setSelectedRating(0);
      setRatingComment('');
      setCurrentJob(null);
      Alert.alert('Thank you!', 'Your review has been submitted. ⭐');
    } catch (e: any) {
      setRatingModal(false);
      setSelectedRating(0);
      setRatingComment('');
      setCurrentJob(null);
      if (e.message?.toLowerCase().includes('already reviewed') || e.message?.includes('Unexpected end of input')) {
        // Already reviewed — close quietly
      } else {
        Alert.alert('Error', e.message);
      }
    } finally {
      setSubmittingReview(false);
    }
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
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(tab => (
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
          <ActivityIndicator color="#1b4332" style={{ marginTop: 40 }} />
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
                {job.latitude && (
                  <View style={styles.gpsPill}>
                    <Ionicons name="navigate" size={10} color="#10b981" />
                    <Text style={styles.gpsText}>GPS</Text>
                  </View>
                )}
              </View>
              {job.finalCost && (
                <Text style={styles.costText}>Final: GHS {job.finalCost}</Text>
              )}
              {job.status === 'PENDING' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelJob(job.id)}>
                  <Text style={styles.cancelText}>Cancel Job</Text>
                </TouchableOpacity>
              )}
              {job.status === 'COMPLETED' && !paidJobs.includes(job.id) && (
                <TouchableOpacity style={styles.payBtn} onPress={() => handlePayment(job)}>
                  <Text style={styles.payBtnText}>💳 Pay GHS {job.finalCost || 0}</Text>
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
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Rating Modal */}
      <Modal visible={ratingModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.ratingOverlay}>
            <View style={styles.ratingCard}>
              <View style={styles.ratingIconContainer}>
                <Text style={styles.ratingEmoji}>⭐</Text>
              </View>
              <Text style={styles.ratingTitle}>Rate your Mechanic</Text>
              <Text style={styles.ratingSubtitle}>How was your experience?</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                    <Ionicons
                      name={star <= selectedRating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= selectedRating ? '#f59e0b' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {selectedRating > 0 && (
                <Text style={styles.ratingLabel}>
                  {selectedRating === 1 ? 'Poor' : selectedRating === 2 ? 'Fair' : selectedRating === 3 ? 'Good' : selectedRating === 4 ? 'Very Good' : 'Excellent!'}
                </Text>
              )}

              <TextInput
                style={styles.commentInput}
                placeholder="Leave a comment (optional)"
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />

              <TouchableOpacity style={styles.submitRatingBtn} onPress={handleSubmitReview} disabled={submittingReview}>
                <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitRatingGradient}>
                  {submittingReview ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitRatingText}>Submit Review</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipBtn} onPress={() => {
                setRatingModal(false);
                setSelectedRating(0);
                setRatingComment('');
                setCurrentJob(null);
              }}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Job Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Job Request</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Car won't start" value={form.title} onChangeText={t => setForm({ ...form, title: t })} />

            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the problem..." value={form.description} onChangeText={t => setForm({ ...form, description: t })} multiline numberOfLines={3} />

            <Text style={styles.label}>Vehicle *</Text>
            {vehicles.length > 0 ? (
              vehicles.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleOption, form.vehicleId === String(v.id) && styles.vehicleOptionActive]}
                  onPress={() => setForm({ ...form, vehicleId: String(v.id) })}>
                  <Text style={[styles.vehicleOptionText, form.vehicleId === String(v.id) && styles.vehicleOptionTextActive]}>
                    {v.make} {v.model} ({v.year}) — {v.licensePlate}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noVehicle}>No vehicles added yet. Add a vehicle in Profile first.</Text>
            )}

            <Text style={styles.label}>Job Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {JOB_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, form.type === type && styles.typeOptionActive]}
                  onPress={() => setForm({ ...form, type })}>
                  <Text style={[styles.typeText, form.type === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KNUST Campus"
              value={form.location}
              onChangeText={t => setForm({ ...form, location: t })}
            />
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={async () => {
                const coords = await locationService.getCurrentLocation();
                if (coords) {
                  setForm({ ...form, latitude: coords.latitude, longitude: coords.longitude });
                  Alert.alert('Location Attached', 'Your GPS location has been added to this job request.');
                }
              }}>
              <Ionicons
                name={form.latitude ? 'navigate' : 'navigate-outline'}
                size={16}
                color={form.latitude ? '#10b981' : '#1b4332'}
              />
              <Text style={[styles.locationBtnText, form.latitude ? { color: '#10b981' } : {}]}>
                {form.latitude ? '✓ GPS location attached' : 'Attach my GPS location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateJob}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>Create Job</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  tabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: '#fff', maxHeight: 52 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, marginRight: 8, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#1b4332' },
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
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  gpsPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#f0fdf4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  gpsText: { fontSize: 10, fontWeight: '600', color: '#10b981' },
  costText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332', marginTop: 6 },
  cancelBtn: { marginTop: 10, padding: 8, backgroundColor: '#fef2f2', borderRadius: RADIUS.sm, alignItems: 'center' },
  cancelText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#dc2626' },
  payBtn: { marginTop: 10, padding: 10, backgroundColor: '#1b4332', borderRadius: RADIUS.md, alignItems: 'center' },
  payBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, padding: 8, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, justifyContent: 'center' },
  paidText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  fab: { position: 'absolute', right: SPACING.lg, bottom: 24, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
  ratingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  ratingCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.xl, paddingBottom: 40, alignItems: 'center' },
  ratingIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  ratingEmoji: { fontSize: 32 },
  ratingTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b1b1b', marginBottom: 4 },
  ratingSubtitle: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: SPACING.lg },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  ratingLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#f59e0b', marginBottom: SPACING.md },
  commentInput: { width: '100%', backgroundColor: '#f9fafb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: FONT_SIZES.md, color: '#1b1b1b', textAlignVertical: 'top', minHeight: 80, marginBottom: SPACING.lg },
  submitRatingBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md },
  submitRatingGradient: { padding: 16, alignItems: 'center' },
  submitRatingText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  skipBtn: { padding: 8 },
  skipText: { fontSize: FONT_SIZES.sm, color: '#9ca3af' },
  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, backgroundColor: '#fff',