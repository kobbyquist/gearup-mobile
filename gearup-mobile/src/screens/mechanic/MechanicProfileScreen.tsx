import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Modal, Switch, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { reviewService } from '../../services/reviewService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';
import { locationService } from '../../services/locationService';

const formatTime = (time: string | null) => {
  if (!time) return '--:--';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${suffix}`;
};

const timeStringToDate = (time: string | null): Date => {
  const d = new Date();
  if (time) {
    const [h, m] = time.split(':');
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  } else {
    d.setHours(9, 0, 0, 0);
  }
  return d;
};

const dateToTimeString = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}:00`;
};

export default function MechanicProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', location: '', latitude: null as number | null, longitude: null as number | null });
  const [acceptingBookings, setAcceptingBookings] = useState(false);
  const [availabilityStart, setAvailabilityStart] = useState<string | null>(null);
  const [availabilityEnd, setAvailabilityEnd] = useState<string | null>(null);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchData = async () => {
    try {
      const [profileData, ratingData, reviewsData] = await Promise.all([
        userService.getMyProfile(),
        reviewService.getAverageRating(user?.userId),
        reviewService.getReviewsForUser(user?.userId),
      ]);
      setProfile(profileData);
      setAvgRating(ratingData?.averageRating || 0);
      setReviews(reviewsData);
      setEditForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        latitude: profileData.latitude || null,
        longitude: profileData.longitude || null,
      });
      setAcceptingBookings(!!profileData.acceptingBookings);
      setAvailabilityStart(profileData.availabilityStart || null);
      setAvailabilityEnd(profileData.availabilityEnd || null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateProfile = async () => {
    try {
      await userService.updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location,
        latitude: editForm.latitude ?? undefined,
        longitude: editForm.longitude ?? undefined,
      });
      setEditModal(false);
      fetchData();
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const saveAvailability = async (updates: { acceptingBookings?: boolean; availabilityStart?: string | null; availabilityEnd?: string | null }) => {
    setSavingAvailability(true);
    try {
      await userService.updateProfile({
        acceptingBookings: updates.acceptingBookings !== undefined ? updates.acceptingBookings : acceptingBookings,
        availabilityStart: updates.availabilityStart !== undefined ? (updates.availabilityStart ?? undefined) : (availabilityStart ?? undefined),
        availabilityEnd: updates.availabilityEnd !== undefined ? (updates.availabilityEnd ?? undefined) : (availabilityEnd ?? undefined),
      } as any);
    } catch (e: any) {
      Alert.alert('Error', 'Could not update availability. Please try again.');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleToggleBookings = async (value: boolean) => {
    setAcceptingBookings(value);
    if (value && (!availabilityStart || !availabilityEnd)) {
      // default to 8am-5pm if never set before
      const start = availabilityStart || '08:00:00';
      const end = availabilityEnd || '17:00:00';
      setAvailabilityStart(start);
      setAvailabilityEnd(end);
      await saveAvailability({ acceptingBookings: value, availabilityStart: start, availabilityEnd: end });
    } else {
      await saveAvailability({ acceptingBookings: value });
    }
  };

  const handleStartTimeChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    const timeStr = dateToTimeString(selected);
    setAvailabilityStart(timeStr);
    if (Platform.OS === 'android') saveAvailability({ availabilityStart: timeStr });
  };

  const handleEndTimeChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    const timeStr = dateToTimeString(selected);
    setAvailabilityEnd(timeStr);
    if (Platform.OS === 'android') saveAvailability({ availabilityEnd: timeStr });
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#b45309" />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {profile?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#fde68a" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#b45309" />
            <Text style={styles.verifiedText}>Verified Mechanic</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
            <Ionicons name="pencil-outline" size={16} color="#b45309" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.phone}</Text>
            <Text style={styles.statLabel}>Phone</Text>
          </View>
        </View>

        {/* Booking Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Availability</Text>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.availabilityLabel}>Available for bookings</Text>
                <Text style={styles.availabilitySubtext}>
                  {acceptingBookings ? "Owners can book you within your hours" : "You won't appear as bookable"}
                </Text>
              </View>
              <Switch
                value={acceptingBookings}
                onValueChange={handleToggleBookings}
                trackColor={{ false: '#e5e7eb', true: '#fbbf24' }}
                thumbColor={acceptingBookings ? '#b45309' : '#f4f3f4'}
                disabled={savingAvailability}
              />
            </View>

            {acceptingBookings && (
              <View style={styles.hoursRow}>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="time-outline" size={16} color="#b45309" />
                  <View>
                    <Text style={styles.timeBtnLabel}>From</Text>
                    <Text style={styles.timeBtnValue}>{formatTime(availabilityStart)}</Text>
                  </View>
                </TouchableOpacity>
                <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                <TouchableOpacity style={styles.timeBtn} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="time-outline" size={16} color="#b45309" />
                  <View>
                    <Text style={styles.timeBtnLabel}>To</Text>
                    <Text style={styles.timeBtnValue}>{formatTime(availabilityEnd)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {showStartPicker && (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={timeStringToDate(availabilityStart)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartTimeChange}
                  themeVariant="light"
                  textColor="#1b1b1b"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => {
                      setShowStartPicker(false);
                      saveAvailability({ availabilityStart });
                    }}>
                    <Text style={styles.pickerDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {showEndPicker && (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={timeStringToDate(availabilityEnd)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndTimeChange}
                  themeVariant="light"
                  textColor="#1b1b1b"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => {
                      setShowEndPicker(false);
                      saveAvailability({ availabilityEnd });
                    }}>
                    <Text style={styles.pickerDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>No reviews yet</Text>
            </View>
          ) : (
            reviews.slice(0, 5).map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#f59e0b"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('Wallet')}>
          <View style={styles.walletBtnLeft}>
            <Ionicons name="wallet-outline" size={20} color="#b45309" />
            <Text style={styles.walletBtnText}>Wallet</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.devBtn}
          onPress={() => navigation.navigate('DevSettings')}>
          <Text style={styles.devBtnText}>⚙️ Dev Settings</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditModal(false)}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={editForm.name} onChangeText={t => setEditForm({ ...editForm, name: t })} />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={editForm.phone} onChangeText={t => setEditForm({ ...editForm, phone: t })} keyboardType="phone-pad" />
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, styles.textArea]} value={editForm.bio} onChangeText={t => setEditForm({ ...editForm, bio: t })} multiline numberOfLines={3} placeholder="Tell car owners about your experience..." />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={editForm.location} onChangeText={t => setEditForm({ ...editForm, location: t })} placeholder="e.g. Kumasi, Ghana" />
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={async () => {
                const coords = await locationService.getCurrentLocation();
                if (coords) {
                  setEditForm({ ...editForm, latitude: coords.latitude, longitude: coords.longitude });
                  Alert.alert('Location Set', `GPS coordinates saved: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
                }
              }}>
              <Ionicons
                name={editForm.latitude ? 'navigate' : 'navigate-outline'}
                size={16}
                color={editForm.latitude ? '#10b981' : '#b45309'}
              />
              <Text style={[styles.gpsBtnText, editForm.latitude ? { color: '#10b981' } : {}]}>
                {editForm.latitude ? '✓ GPS location set' : 'Set my GPS location (for map visibility)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProfile}>
              <LinearGradient colors={['#b45309', '#78350f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>Save Changes</Text>
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
  header: { paddingTop: 60, paddingBottom: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#78350f' },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#fff' },
  email: { fontSize: FONT_SIZES.sm, color: '#fde68a' },
  bio: { fontSize: FONT_SIZES.sm, color: '#fef3c7', textAlign: 'center', paddingHorizontal: SPACING.xl },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FONT_SIZES.sm, color: '#fde68a' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  verifiedText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  editBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
  statsRow: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.md },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#b45309' },
  statLabel: { fontSize: FONT_SIZES.xs, color: '#6b7280', marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b1b1b', marginBottom: SPACING.md },
  availabilityCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  availabilityToggleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  availabilityLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b' },
  availabilitySubtext: { fontSize: FONT_SIZES.xs, color: '#9ca3af', marginTop: 2 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fde68a', flex: 1 },
  timeBtnLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
  timeBtnValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#b45309' },
  pickerWrap: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', marginTop: SPACING.md, overflow: 'hidden' },
  pickerDoneBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pickerDoneBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#b45309' },
  reviewCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stars: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  reviewComment: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: FONT_SIZES.md, color: '#9ca3af' },
  walletBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: SPACING.lg, marginTop: SPACING.md, padding: SPACING.md, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#f3f4f6' },
  walletBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletBtnText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, margin: SPACING.lg, padding: SPACING.md, backgroundColor: '#fef2f2', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#dc2626' },
  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b1b1b' },
  modalBody: { padding: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { marginTop: 24, borderRadius: RADIUS.md, overflow: 'hidden' },
  submitGradient: { padding: 16, alignItems: 'center' },
  submitText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  devBtn: { alignItems: 'center', padding: SPACING.md },
  devBtnText: { fontSize: FONT_SIZES.xs, color: '#9ca3af' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#fffbeb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fde68a' },
  gpsBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
});