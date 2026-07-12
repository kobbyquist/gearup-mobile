import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { jobService } from '../../services/jobService';
import { vehicleService } from '../../services/vehicleService';
import { paymentService } from '../../services/paymentService';
import { reviewService } from '../../services/reviewService';
import { locationService } from '../../services/locationService';
import { userService } from '../../services/userService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const JOB_TYPES = ['TOWING', 'BATTERY', 'TIRE_CHANGE', 'FUEL', 'ENGINE', 'GENERAL'];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function OwnerJobsScreen({ navigation }: any) {
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [requestType, setRequestType] = useState<'GENERAL' | 'DIRECT'>('GENERAL');
  const [mechanicPickerVisible, setMechanicPickerVisible] = useState(false);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [mechanicSearch, setMechanicSearch] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', description: '', vehicleId: '', type: 'GENERAL', location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    scheduledDate: null as Date | null,
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
            // no payment exists yet for this job
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

  const loadMechanics = async () => {
    setLoadingMechanics(true);
    try {
      const [mechanicsData, coords] = await Promise.all([
        userService.getAllMechanics(),
        locationService.getCurrentLocation(),
      ]);
      const withDistance = mechanicsData.map((m: any) => ({
        ...m,
        distance: coords && m.latitude && m.longitude
          ? calculateDistance(coords.latitude, coords.longitude, m.latitude, m.longitude)
          : null,
      }));
      const sorted = withDistance.sort((a: any, b: any) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return a.name.localeCompare(b.name);
      });
      setMechanics(sorted);
    } catch (e: any) {
      Alert.alert('Error', 'Could not load mechanics list');
    } finally {
      setLoadingMechanics(false);
    }
  };

  const openMechanicPicker = () => {
    setMechanicPickerVisible(true);
    if (mechanics.length === 0) {
      loadMechanics();
    }
  };

  const filteredMechanics = mechanics.filter(m =>
    !mechanicSearch.trim() ||
    m.name?.toLowerCase().includes(mechanicSearch.toLowerCase()) ||
    m.location?.toLowerCase().includes(mechanicSearch.toLowerCase())
  );

  const handleCreateJob = async () => {
    if (!form.title || !form.description || !form.vehicleId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (requestType === 'DIRECT' && !selectedMechanic) {
      Alert.alert('Error', 'Please choose a mechanic, or switch to "Any Mechanic"');
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
        scheduledDate: form.scheduledDate ? form.scheduledDate.toISOString() : undefined,
        requestType,
        preferredMechanicId: requestType === 'DIRECT' ? selectedMechanic.id : undefined,
      });
      setModalVisible(false);
      setForm({ title: '', description: '', vehicleId: '', type: 'GENERAL', location: '', latitude: null, longitude: null, scheduledDate: null });
      setRequestType('GENERAL');
      setSelectedMechanic(null);
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

  const formatScheduled = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const onDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed' || !selected) return;
      const merged = new Date(selected);
      if (form.scheduledDate) {
        merged.setHours(form.scheduledDate.getHours(), form.scheduledDate.getMinutes());
      }
      setForm(prev => ({ ...prev, scheduledDate: merged }));
      setShowTimePicker(true);
    } else {
      if (selected) {
        setForm(prev => ({ ...prev, scheduledDate: selected }));
      }
    }
  };

  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'dismissed' || !selected) return;
    setForm(prev => {
      const base = prev.scheduledDate ? new Date(prev.scheduledDate) : new Date();
      base.setHours(selected.getHours(), selected.getMinutes());
      return { ...prev, scheduledDate: base };
    });
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
              {job.scheduledDate && (
                <View style={styles.scheduledPill}>
                  <Ionicons name="calendar-outline" size={12} color="#7c3aed" />
                  <Text style={styles.scheduledPillText}>
                    Scheduled: {formatScheduled(new Date(job.scheduledDate))}
                  </Text>
                </View>
              )}
              {job.requestType === 'DIRECT' && (
                <View style={styles.directPill}>
                  <Ionicons name="person-outline" size={12} color="#2563eb" />
                  <Text style={styles.directPillText}>Requested a specific mechanic</Text>
                </View>
              )}
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
              {(job.status === 'ACCEPTED' || job.status === 'IN_PROGRESS') && job.mechanicId && (
                <TouchableOpacity
                  style={styles.messageBtn}
                  onPress={() => navigation.navigate('Chat', {
                    job,
                    otherUserId: job.mechanicId,
                    otherUserName: 'Mechanic',
                  })}>
                  <Ionicons name="chatbubble-outline" size={14} color="#2563eb" />
                  <Text style={styles.messageBtnText}>Message Mechanic</Text>
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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Job Request</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{ paddingBottom: 300 }}>

            <Text style={styles.label}>Who should see this request? *</Text>
            <View style={styles.requestTypeRow}>
              <TouchableOpacity
                style={[styles.requestTypeOption, requestType === 'GENERAL' && styles.requestTypeOptionActive]}
                onPress={() => { setRequestType('GENERAL'); setSelectedMechanic(null); }}>
                <Ionicons name="people-outline" size={18} color={requestType === 'GENERAL' ? '#fff' : '#1b4332'} />
                <Text style={[styles.requestTypeText, requestType === 'GENERAL' && styles.requestTypeTextActive]}>Any Mechanic</Text>
                <Text style={[styles.requestTypeSubtext, requestType === 'GENERAL' && styles.requestTypeTextActive]}>Sent to all nearby mechanics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.requestTypeOption, requestType === 'DIRECT' && styles.requestTypeOptionActive]}
                onPress={() => { setRequestType('DIRECT'); openMechanicPicker(); }}>
                <Ionicons name="person-outline" size={18} color={requestType === 'DIRECT' ? '#fff' : '#1b4332'} />
                <Text style={[styles.requestTypeText, requestType === 'DIRECT' && styles.requestTypeTextActive]}>Choose a Mechanic</Text>
                <Text style={[styles.requestTypeSubtext, requestType === 'DIRECT' && styles.requestTypeTextActive]}>Pick who gets your request</Text>
              </TouchableOpacity>
            </View>

            {requestType === 'DIRECT' && (
              <TouchableOpacity style={styles.selectedMechanicRow} onPress={openMechanicPicker}>
                {selectedMechanic ? (
                  <>
                    <View style={styles.selectedMechanicAvatar}>
                      <Text style={styles.selectedMechanicAvatarText}>{selectedMechanic.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectedMechanicName}>{selectedMechanic.name}</Text>
                      {selectedMechanic.location && <Text style={styles.selectedMechanicLocation}>{selectedMechanic.location}</Text>}
                    </View>
                    <Text style={styles.changeMechanicText}>Change</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search-outline" size={18} color="#1b4332" />
                    <Text style={styles.selectedMechanicPlaceholder}>Tap to choose a mechanic</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

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

            <Text style={styles.label}>Schedule (optional)</Text>
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => setShowDatePicker(true)}>
              <Ionicons
                name={form.scheduledDate ? 'calendar' : 'calendar-outline'}
                size={16}
                color={form.scheduledDate ? '#7c3aed' : '#1b4332'}
              />
              <Text style={[styles.scheduleBtnText, form.scheduledDate ? { color: '#7c3aed' } : {}]}>
                {form.scheduledDate ? formatScheduled(form.scheduledDate) : 'Pick a date & time (or leave for ASAP)'}
              </Text>
              {form.scheduledDate && (
                <TouchableOpacity onPress={() => setForm({ ...form, scheduledDate: null })}>
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={form.scheduledDate || new Date()}
                  mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  themeVariant="light"
                  textColor="#1b1b1b"
                  style={styles.picker}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => {
                      if (!form.scheduledDate) {
                        setForm(prev => ({ ...prev, scheduledDate: new Date() }));
                      }
                      setShowDatePicker(false);
                    }}>
                    <Text style={styles.pickerDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={form.scheduledDate || new Date()}
                mode="time"
                onChange={onTimeChange}
                display="default"
                themeVariant="light"
              />
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateJob}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>Create Job</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Mechanic Picker Modal */}
      <Modal visible={mechanicPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a Mechanic</Text>
            <TouchableOpacity onPress={() => setMechanicPickerVisible(false)}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          <View style={styles.mechanicSearchBar}>
            <Ionicons name="search-outline" size={18} color="#6b7280" />
            <TextInput
              style={styles.mechanicSearchInput}
              placeholder="Search by name or location..."
              value={mechanicSearch}
              onChangeText={setMechanicSearch}
              placeholderTextColor="#9ca3af"
            />
          </View>
          {loadingMechanics ? (
            <ActivityIndicator color="#1b4332" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.modalBody}>
              {filteredMechanics.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="construct-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>No mechanics found</Text>
                </View>
              ) : (
                filteredMechanics.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.mechanicPickCard}
                    onPress={() => {
                      setSelectedMechanic(m);
                      setMechanicPickerVisible(false);
                    }}>
                    <View style={styles.cardAvatar}>
                      <Text style={styles.cardAvatarText}>{m.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{m.name}</Text>
                      {m.location && (
                        <View style={styles.cardLocationRow}>
                          <Ionicons name="location-outline" size={12} color="#6b7280" />
                          <Text style={styles.cardLocation}>{m.location}</Text>
                        </View>
                      )}
                      {m.distance !== null && (
                        <Text style={styles.cardDistance}>
                          {m.distance < 1 ? `${Math.round(m.distance * 1000)}m away` : `${m.distance.toFixed(1)}km away`}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
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
  scheduledPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, marginBottom: 6 },
  scheduledPillText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },
  directPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, marginBottom: 6 },
  directPillText: { fontSize: 11, fontWeight: '600', color: '#2563eb' },
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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b1b1b' },
  modalBody: { padding: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  vehicleOption: { padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8, backgroundColor: '#fff' },
  vehicleOptionActive: { borderColor: '#1b4332', backgroundColor: '#f0fdf4' },
  vehicleOptionText: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  vehicleOptionTextActive: { color: '#1b4332', fontWeight: '600' },
  noVehicle: { fontSize: FONT_SIZES.sm, color: '#ef4444', fontStyle: 'italic' },
  typeScroll: { marginBottom: 4 },
  typeOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8, backgroundColor: '#fff' },
  typeOptionActive: { backgroundColor: '#1b4332', borderColor: '#1b4332' },
  typeText: { fontSize: FONT_SIZES.sm, color: '#6b7280', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#86efac' },
  locationBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332' },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#f5f3ff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#ddd6fe' },
  scheduleBtnText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 8, overflow: 'hidden' },
  picker: { height: 200, backgroundColor: '#fff' },
  pickerDoneBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pickerDoneBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b4332' },
  submitBtn: { marginTop: 24, borderRadius: RADIUS.md, overflow: 'hidden' },
  submitGradient: { padding: 16, alignItems: 'center' },
  submitText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#eff6ff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#bfdbfe' },
  messageBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2563eb' },
  requestTypeRow: { flexDirection: 'row', gap: 10 },
  requestTypeOption: { flex: 1, padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', gap: 4 },
  requestTypeOptionActive: { backgroundColor: '#1b4332', borderColor: '#1b4332' },
  requestTypeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b' },
  requestTypeSubtext: { fontSize: 11, color: '#6b7280' },
  requestTypeTextActive: { color: '#fff' },
  selectedMechanicRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, padding: 10, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb' },
  selectedMechanicAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1b4332', justifyContent: 'center', alignItems: 'center' },
  selectedMechanicAvatarText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  selectedMechanicName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b' },
  selectedMechanicLocation: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  selectedMechanicPlaceholder: { fontSize: FONT_SIZES.sm, color: '#1b4332', fontWeight: '600' },
  changeMechanicText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#2563eb' },
  mechanicSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 44, gap: 8, margin: SPACING.lg, marginBottom: 0, borderWidth: 1, borderColor: '#e5e7eb' },
  mechanicSearchInput: { flex: 1, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  mechanicPickCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: '#f3f4f6' },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1b4332', justifyContent: 'center', alignItems: 'center' },
  cardAvatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  cardName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b' },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardLocation: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  cardDistance: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#1b4332', marginTop: 2 },
});