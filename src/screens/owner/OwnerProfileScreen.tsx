import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { vehicleService } from '../../services/vehicleService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function OwnerProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [vehicleModal, setVehicleModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', location: '' });
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', licensePlate: '', color: '', type: 'CAR' });

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
      console.log('Error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const handleAddVehicle = async () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.year || !vehicleForm.licensePlate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      await vehicleService.addVehicle({
        ...vehicleForm,
        year: parseInt(vehicleForm.year),
      });
      setVehicleModal(false);
      setVehicleForm({ make: '', model: '', year: '', licensePlate: '', color: '', type: 'CAR' });
      fetchData();
      Alert.alert('Success', 'Vehicle added!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
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
            <TouchableOpacity onPress={() => setVehicleModal(true)}>
              <Ionicons name="add-circle-outline" size={24} color="#1b4332" />
            </TouchableOpacity>
          </View>
          {vehicles.length === 0 ? (
            <TouchableOpacity style={styles.addVehicleCard} onPress={() => setVehicleModal(true)}>
              <Ionicons name="car-outline" size={32} color="#d1d5db" />
              <Text style={styles.addVehicleText}>Add your first vehicle</Text>
            </TouchableOpacity>
          ) : (
            vehicles.map(v => (
              <View key={v.id} style={styles.vehicleCard}>
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car" size={24} color="#1b4332" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{v.make} {v.model}</Text>
                  <Text style={styles.vehicleDetails}>{v.year} · {v.licensePlate} {v.color ? `· ${v.color}` : ''}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
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

      {/* Add Vehicle Modal */}
      <Modal visible={vehicleModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            <TouchableOpacity onPress={() => setVehicleModal(false)}>
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
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddVehicle}>
              <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.submitGradient}>
                <Text style={styles.submitText}>Add Vehicle</Text>
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
});