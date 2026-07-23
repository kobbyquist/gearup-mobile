import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Modal, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { vehicleService } from '../../services/vehicleService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';
import { useFocusEffect } from '@react-navigation/native';

const VEHICLE_ICONS: Record<string, any> = {
  CAR: 'car-sport',
  TRUCK: 'bus',
  SUV: 'car-sport',
  MOTORCYCLE: 'bicycle',
  VAN: 'bus',
};

const VEHICLE_TYPES = ['CAR', 'SUV', 'TRUCK', 'VAN', 'MOTORCYCLE'];

const emptyVehicleForm = {
  make: '', model: '', year: '', licensePlate: '', color: '', type: 'CAR',
  lastServicedDate: null as Date | null,
  mileage: '',
  insuranceExpiry: null as Date | null,
  roadworthyExpiry: null as Date | null,
  notes: '',
};

const formatDate = (date: Date | null | string) => {
  if (!date) return 'Not set';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const dateToISO = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isExpiringSoon = (dateStr: string | null | undefined) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const daysLeft = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysLeft < 30;
};

const isExpired = (dateStr: string | null | undefined) => {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < new Date().getTime();
};

export default function OwnerProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', location: '' });
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [activeDateField, setActiveDateField] = useState<'lastServicedDate' | 'insuranceExpiry' | 'roadworthyExpiry' | null>(null);

  const fetchData = async () => {
    try {
      const [profileData, vehiclesData] = await Promise.all([
        userService.getMyProfile(),
        vehicleService.getMyVehicles(),
      ]);
      setProfile(profileData);
      setVehicles(vehiclesData);
      setEditForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useFocusEffect(
    React.useCallback(() => {
      const vehicleId = navigation.getState()?.routes?.find((r: any) => r.name === 'Profile')?.params?.openVehicleId;
      if (vehicleId && vehicles.length > 0) {
        const v = vehicles.find((veh: any) => veh.id === vehicleId);
        if (v) {
          setSelectedVehicle(v);
          setDetailModal(true);
          navigation.setParams({ openVehicleId: undefined });
        }
      }
    }, [vehicles])
  );

  const handleUpdateProfile = async () => {
    try {
      await userService.updateProfile(editForm);
      setEditModal(false);
      fetchData();
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const openAddVehicle = () => {
    setEditingVehicleId(null);
    setVehicleForm(emptyVehicleForm);
    setVehicleModal(true);
  };

  const openEditVehicle = (v: any) => {
    setEditingVehicleId(v.id);
    setVehicleForm({
      make: v.make || '',
      model: v.model || '',
      year: v.year ? String(v.year) : '',
      licensePlate: v.licensePlate || '',
      color: v.color || '',
      type: v.type || 'CAR',
      lastServicedDate: v.lastServicedDate ? new Date(v.lastServicedDate) : null,
      mileage: v.mileage ? String(v.mileage) : '',
      insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry) : null,
      roadworthyExpiry: v.roadworthyExpiry ? new Date(v.roadworthyExpiry) : null,
      notes: v.notes || '',
    });
    setDetailModal(false);
    setVehicleModal(true);
  };

  const handleSubmitVehicle = async () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.year || !vehicleForm.licensePlate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const payload = {
      make: vehicleForm.make,
      model: vehicleForm.model,
      year: parseInt(vehicleForm.year),
      licensePlate: vehicleForm.licensePlate,
      color: vehicleForm.color,
      type: vehicleForm.type,
      lastServicedDate: dateToISO(vehicleForm.lastServicedDate),
      mileage: vehicleForm.mileage ? parseInt(vehicleForm.mileage) : undefined,
      insuranceExpiry: dateToISO(vehicleForm.insuranceExpiry),
      roadworthyExpiry: dateToISO(vehicleForm.roadworthyExpiry),
      notes: vehicleForm.notes,
    };
    try {
      if (editingVehicleId) {
        await vehicleService.updateVehicle(editingVehicleId, payload);
        Alert.alert('Success', 'Vehicle updated!');
      } else {
        await vehicleService.addVehicle(payload as any);
        Alert.alert('Success', 'Vehicle added!');
      }
      setVehicleModal(false);
      setVehicleForm(emptyVehicleForm);
      setEditingVehicleId(null);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await vehicleService.deleteVehicle(vehicleId);
            setDetailModal(false);
            fetchData();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const onDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') setActiveDateField(null);
    if (event.type === 'dismissed' || !selected || !activeDateField) return;
    setVehicleForm(prev => ({ ...prev, [activeDateField]: selected }));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#1b4332" />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {profile?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#86efac" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
            <Ionicons name="pencil-outline" size={16} color="#1b4332" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity onPress={openAddVehicle}>
              <Ionicons name="add-circle-outline" size={24} color="#1b4332" />
            </TouchableOpacity>
          </View>
          {vehicles.length === 0 ? (
            <TouchableOpacity style={styles.addVehicleCard} onPress={openAddVehicle}>
              <Ionicons name="car-outline" size={32} color="#d1d5db" />
              <Text style={styles.addVehicleText}>Add your first vehicle</Text>
            </TouchableOpacity>
          ) : (
            vehicles.map(v => (
              <TouchableOpacity
                key={v.id}
                style={styles.vehicleCard}
                onPress={() => { setSelectedVehicle(v); setDetailModal(true); }}>
                <View style={styles.vehicleIcon}>
                  <Ionicons name={VEHICLE_ICONS[v.type] || 'car'} size={24} color="#1b4332" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{v.make} {v.model}</Text>
                  <Text style={styles.vehicleDetails}>{v.year} · {v.licensePlate} {v.color ? `· ${v.color}` : ''}</Text>
                  {(isExpired(v.insuranceExpiry) || isExpired(v.roadworthyExpiry)) && (
                    <View style={styles.warnPill}>
                      <Ionicons name="alert-circle" size={10} color="#dc2626" />
                      <Text style={styles.warnPillText}>Document expired</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('Wallet')}>
          <View style={styles.walletBtnLeft}>
            <Ionicons name="wallet-outline" size={20} color="#1b4332" />
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
            <TextInput style={[styles.input, styles.textArea]} value={editForm.bio} onChangeText={t => setEditForm({ ...editForm, bio: t })} multiline numberOfLines={3} />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={editForm.location} onChangeText={t => setEditForm({ ...editForm, location: t })} placeholder="e.g. Kumasi, Ghana" />
            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProfile}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Add/Edit Vehicle Modal */}
      <Modal visible={vehicleModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
            <TouchableOpacity onPress={() => { setVehicleModal(false); setEditingVehicleId(null); }}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Make *</Text>
            <TextInput style={styles.input} placeholder="e.g. Toyota" value={vehicleForm.make} onChangeText={t => setVehicleForm({ ...vehicleForm, make: t })} />
            <Text style={styles.label}>Model *</Text>
            <TextInput style={styles.input} placeholder="e.g. Corolla" value={vehicleForm.model} onChangeText={t => setVehicleForm({ ...vehicleForm, model: t })} />
            <Text style={styles.label}>Year *</Text>
            <TextInput style={styles.input} placeholder="e.g. 2020" value={vehicleForm.year} onChangeText={t => setVehicleForm({ ...vehicleForm, year: t })} keyboardType="numeric" />
            <Text style={styles.label}>License Plate *</Text>
            <TextInput style={styles.input} placeholder="e.g. GR-1234-20" value={vehicleForm.licensePlate} onChangeText={t => setVehicleForm({ ...vehicleForm, licensePlate: t })} />
            <Text style={styles.label}>Color</Text>
            <TextInput style={styles.input} placeholder="e.g. Black" value={vehicleForm.color} onChangeText={t => setVehicleForm({ ...vehicleForm, color: t })} />

            <Text style={styles.label}>Vehicle Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {VEHICLE_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, vehicleForm.type === type && styles.typeOptionActive]}
                  onPress={() => setVehicleForm({ ...vehicleForm, type })}>
                  <Text style={[styles.typeText, vehicleForm.type === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Mileage / Odometer (km)</Text>
            <TextInput style={styles.input} placeholder="e.g. 45000" value={vehicleForm.mileage} onChangeText={t => setVehicleForm({ ...vehicleForm, mileage: t })} keyboardType="numeric" />

            <Text style={styles.label}>Last Serviced</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setActiveDateField('lastServicedDate')}>
              <Ionicons name="build-outline" size={16} color="#1b4332" />
              <Text style={styles.dateBtnText}>{formatDate(vehicleForm.lastServicedDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Insurance Expiry</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setActiveDateField('insuranceExpiry')}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#1b4332" />
              <Text style={styles.dateBtnText}>{formatDate(vehicleForm.insuranceExpiry)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Roadworthy / Inspection Expiry</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setActiveDateField('roadworthyExpiry')}>
              <Ionicons name="checkmark-done-outline" size={16} color="#1b4332" />
              <Text style={styles.dateBtnText}>{formatDate(vehicleForm.roadworthyExpiry)}</Text>
            </TouchableOpacity>

            {activeDateField && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={vehicleForm[activeDateField] || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  themeVariant="light"
                  textColor="#1b1b1b"
                  style={styles.picker}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setActiveDateField(null)}>
                    <Text style={styles.pickerDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Anything important about this vehicle..."
              value={vehicleForm.notes}
              onChangeText={t => setVehicleForm({ ...vehicleForm, notes: t })}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitVehicle}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>{editingVehicleId ? 'Save Changes' : 'Add Vehicle'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Vehicle Detail Modal (read-only) */}
      <Modal visible={detailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vehicle Details</Text>
            <TouchableOpacity onPress={() => setDetailModal(false)}>
              <Ionicons name="close" size={24} color="#1b1b1b" />
            </TouchableOpacity>
          </View>
          {selectedVehicle && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailHeroIcon}>
                <Ionicons name={VEHICLE_ICONS[selectedVehicle.type] || 'car'} size={48} color="#1b4332" />
              </View>
              <Text style={styles.detailTitle}>{selectedVehicle.make} {selectedVehicle.model}</Text>
              <Text style={styles.detailSubtitle}>{selectedVehicle.year} · {selectedVehicle.licensePlate}</Text>

              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Color</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.color || 'Not set'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.type}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mileage</Text>
                  <Text style={styles.detailValue}>{selectedVehicle.mileage ? `${selectedVehicle.mileage.toLocaleString()} km` : 'Not set'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Serviced</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedVehicle.lastServicedDate)}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Insurance Expiry</Text>
                  <Text style={[
                    styles.detailValue,
                    isExpired(selectedVehicle.insuranceExpiry) && styles.detailValueDanger,
                    !isExpired(selectedVehicle.insuranceExpiry) && isExpiringSoon(selectedVehicle.insuranceExpiry) && styles.detailValueWarn,
                  ]}>
                    {formatDate(selectedVehicle.insuranceExpiry)}
                  </Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Roadworthy Expiry</Text>
                  <Text style={[
                    styles.detailValue,
                    isExpired(selectedVehicle.roadworthyExpiry) && styles.detailValueDanger,
                    !isExpired(selectedVehicle.roadworthyExpiry) && isExpiringSoon(selectedVehicle.roadworthyExpiry) && styles.detailValueWarn,
                  ]}>
                    {formatDate(selectedVehicle.roadworthyExpiry)}
                  </Text>
                </View>
              </View>

              {selectedVehicle.notes ? (
                <View style={styles.notesCard}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{selectedVehicle.notes}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.editVehicleBtn} onPress={() => openEditVehicle(selectedVehicle)}>
                <Ionicons name="pencil-outline" size={16} color="#1b4332" />
                <Text style={styles.editVehicleBtnText}>Edit Vehicle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteVehicleBtn} onPress={() => handleDeleteVehicle(selectedVehicle.id)}>
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text style={styles.deleteVehicleBtnText}>Delete Vehicle</Text>
              </TouchableOpacity>
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
  header: { paddingTop: 60, paddingBottom: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#1b4332' },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#fff' },
  email: { fontSize: FONT_SIZES.sm, color: '#86efac' },
  bio: { fontSize: FONT_SIZES.sm, color: '#d1fae5', textAlign: 'center', paddingHorizontal: SPACING.xl },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FONT_SIZES.sm, color: '#86efac' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  editBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332' },
  section: { padding: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b1b1b' },
  addVehicleCard: { alignItems: 'center', padding: SPACING.xl, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', gap: 8 },
  addVehicleText: { fontSize: FONT_SIZES.sm, color: '#9ca3af' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  vehicleIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  vehicleDetails: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginTop: 2 },
  warnPill: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  warnPillText: { fontSize: 10, fontWeight: '600', color: '#dc2626' },
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
  typeOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8, backgroundColor: '#fff' },
  typeOptionActive: { backgroundColor: '#1b4332', borderColor: '#1b4332' },
  typeText: { fontSize: FONT_SIZES.sm, color: '#6b7280', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12 },
  dateBtnText: { fontSize: FONT_SIZES.md, color: '#1b1b1b', fontWeight: '600' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 8, overflow: 'hidden' },
  picker: { height: 200, backgroundColor: '#fff' },
  pickerDoneBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pickerDoneBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b4332' },
  detailHeroIcon: { alignSelf: 'center', width: 90, height: 90, borderRadius: 45, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: SPACING.md },
  detailTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b1b1b', textAlign: 'center' },
  detailSubtitle: { fontSize: FONT_SIZES.sm, color: '#6b7280', textAlign: 'center', marginBottom: SPACING.lg },
  detailCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: '#f3f4f6' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailLabel: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  detailValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b' },
  detailValueWarn: { color: '#b45309' },
  detailValueDanger: { color: '#dc2626' },
  detailDivider: { height: 1, backgroundColor: '#f3f4f6' },
  notesCard: { backgroundColor: '#fffbeb', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md, borderWidth: 1, borderColor: '#fde68a' },
  notesLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#b45309', marginBottom: 4 },
  notesText: { fontSize: FONT_SIZES.sm, color: '#1b1b1b' },
  editVehicleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: SPACING.lg, padding: 14, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#86efac' },
  editVehicleBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b4332' },
  deleteVehicleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: SPACING.md, padding: 14, backgroundColor: '#fef2f2', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fecaca' },
  deleteVehicleBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#dc2626' },
});