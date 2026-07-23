import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { partsService } from '../../services/partsService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];
const CATEGORIES = ['Engine', 'Battery', 'Tires', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Other'];

const emptyForm = {
  name: '', description: '', price: '', brand: '',
  carMake: '', carModel: '', condition: 'New', category: 'Engine',
  imageUrl: '' as string | null,
};

export default function MechanicPartsScreen() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchParts = async () => {
    try {
      const data = await partsService.getMyListings();
      setParts(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchParts(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchParts(); };

  const openAddModal = () => {
    setEditingPartId(null);
    setForm(emptyForm);
    setLocalImageUri(null);
    setModalVisible(true);
  };

  const openEditModal = (part: any) => {
    setEditingPartId(part.id);
    setForm({
      name: part.name || '',
      description: part.description || '',
      price: part.price ? String(part.price) : '',
      brand: part.brand || '',
      carMake: part.carMake || '',
      carModel: part.carModel || '',
      condition: part.condition || 'New',
      category: 'Engine',
      imageUrl: part.imageUrl || '',
    });
    setLocalImageUri(part.imageUrl || null);
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to add a picture of this part.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setLocalImageUri(uri);
    setUploadingImage(true);
    try {
      const imageUrl = await partsService.uploadImage(uri);
      setForm(prev => ({ ...prev, imageUrl }));
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message || 'Could not upload image. Please try again.');
      setLocalImageUri(form.imageUrl || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.price) {
      Alert.alert('Error', 'Name, description and price are required');
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      brand: form.brand,
      carMake: form.carMake,
      carModel: form.carModel,
      condition: form.condition,
      imageUrl: form.imageUrl || undefined,
    };
    try {
      if (editingPartId) {
        await partsService.updateListing(editingPartId, payload);
        Alert.alert('Success', 'Listing updated!');
      } else {
        await partsService.createListing(payload as any);
        Alert.alert('Success', 'Part listed successfully!');
      }
      setModalVisible(false);
      setForm(emptyForm);
      setLocalImageUri(null);
      setEditingPartId(null);
      fetchParts();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleMarkSold = (partId: number) => {
    Alert.alert('Mark as Sold', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Sold', onPress: async () => {
          try {
            await partsService.markAsSold(partId);
            fetchParts();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const handleDelete = (partId: number) => {
    Alert.alert('Delete Listing', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await partsService.deleteListing(partId);
            fetchParts();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10b981';
      case 'SOLD': return '#6b7280';
      case 'RESERVED': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
        <Text style={styles.headerTitle}>My Parts Listings</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}>
        {loading ? (
          <ActivityIndicator color="#b45309" style={{ marginTop: 40 }} />
        ) : parts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No listings yet</Text>
            <Text style={styles.emptySubText}>Tap + to list a spare part</Text>
            <TouchableOpacity style={styles.addFirstBtn} onPress={openAddModal}>
              <Text style={styles.addFirstBtnText}>Add First Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          parts.map(part => (
            <TouchableOpacity key={part.id} style={styles.partCard} activeOpacity={0.85} onPress={() => openEditModal(part)}>
              <View style={styles.partCardRow}>
                {part.imageUrl ? (
                  <Image source={{ uri: part.imageUrl }} style={styles.partThumb} />
                ) : (
                  <View style={styles.partThumbPlaceholder}>
                    <Ionicons name="image-outline" size={24} color="#d1d5db" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.partHeader}>
                    <Text style={styles.partName} numberOfLines={1}>{part.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(part.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(part.status) }]}>{part.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.partDesc} numberOfLines={2}>{part.description}</Text>
                  <Text style={styles.partPrice}>GHS {part.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
              <View style={styles.partMeta}>
                {part.brand && <Text style={styles.metaChip}>{part.brand}</Text>}
                {part.carMake && <Text style={styles.metaChip}>{part.carMake} {part.carModel}</Text>}
                {part.condition && <Text style={styles.metaChip}>{part.condition}</Text>}
              </View>
              {part.status === 'AVAILABLE' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn} onPress={(e) => { e.stopPropagation(); openEditModal(part); }}>
                    <Ionicons name="pencil-outline" size={14} color="#b45309" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.soldBtn} onPress={(e) => { e.stopPropagation(); handleMarkSold(part.id); }}>
                    <Text style={styles.soldBtnText}>Mark Sold</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={(e) => { e.stopPropagation(); handleDelete(part.id); }}>
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <LinearGradient colors={['#b45309', '#78350f']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add/Edit Part Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPartId ? 'Edit Listing' : 'List a Part'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setEditingPartId(null); }}>
                <Ionicons name="close" size={24} color="#1b1b1b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">

              <Text style={styles.label}>Photo</Text>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage} disabled={uploadingImage}>
                {localImageUri ? (
                  <Image source={{ uri: localImageUri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={28} color="#b45309" />
                    <Text style={styles.imagePickerText}>Add a photo</Text>
                  </View>
                )}
                {uploadingImage && (
                  <View style={styles.imageUploadingOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                {localImageUri && !uploadingImage && (
                  <View style={styles.imageCheckBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  </View>
                )}
              </TouchableOpacity>
              {localImageUri && (
                <TouchableOpacity onPress={handlePickImage} disabled={uploadingImage}>
                  <Text style={styles.changePhotoText}>Change photo</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>Part Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Toyota Corolla Alternator" value={form.name} onChangeText={t => setForm({ ...form, name: t })} />

              <Text style={styles.label}>Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the part..." value={form.description} onChangeText={t => setForm({ ...form, description: t })} multiline numberOfLines={3} />

              <Text style={styles.label}>Price (GHS) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 450"
                value={form.price}
                onChangeText={t => {
                  const cleaned = t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                  setForm({ ...form, price: cleaned });
                }}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Brand</Text>
              <TextInput style={styles.input} placeholder="e.g. Denso" value={form.brand} onChangeText={t => setForm({ ...form, brand: t })} />

              <Text style={styles.label}>Car Make</Text>
              <TextInput style={styles.input} placeholder="e.g. Toyota" value={form.carMake} onChangeText={t => setForm({ ...form, carMake: t })} />

              <Text style={styles.label}>Car Model</Text>
              <TextInput style={styles.input} placeholder="e.g. Corolla" value={form.carModel} onChangeText={t => setForm({ ...form, carModel: t })} />

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.conditionChip, form.category === cat && styles.conditionChipActive]}
                    onPress={() => setForm({ ...form, category: cat })}>
                    <Text style={[styles.conditionText, form.category === cat && styles.conditionTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Condition</Text>
              <View style={styles.conditionRow}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.conditionChip, form.condition === c && styles.conditionChipActive]}
                    onPress={() => setForm({ ...form, condition: c })}>
                    <Text style={[styles.conditionText, form.condition === c && styles.conditionTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploadingImage}>
                <LinearGradient colors={['#b45309', '#78350f']} style={styles.submitGradient}>
                  <Text style={styles.submitText}>
                    {uploadingImage ? 'Uploading image...' : editingPartId ? 'Save Changes' : 'List Part'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  fab: { position: 'absolute', right: SPACING.lg, bottom: 24, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1, padding: SPACING.lg },
  partCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  partCardRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: 8, alignItems: 'center' },
  partThumb: { width: 64, height: 64, borderRadius: RADIUS.md },
  partThumbPlaceholder: { width: 64, height: 64, borderRadius: RADIUS.md, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  partHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  partName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  partDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 4 },
  partPrice: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#b45309' },
  partMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  metaChip: { fontSize: FONT_SIZES.xs, color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fffbeb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fde68a' },
  editBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#b45309' },
  soldBtn: { flex: 1, padding: 8, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, alignItems: 'center' },
  soldBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#10b981' },
  deleteBtn: { width: 36, height: 36, backgroundColor: '#fef2f2', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af' },
  emptySubText: { fontSize: FONT_SIZES.sm, color: '#d1d5db' },
  addFirstBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#b45309', borderRadius: RADIUS.md },
  addFirstBtnText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#fff' },
  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b1b1b' },
  modalBody: { padding: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipScroll: { marginBottom: 4 },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', marginRight: 6, marginBottom: 6 },
  conditionChipActive: { backgroundColor: '#b45309', borderColor: '#b45309' },
  conditionText: { fontSize: FONT_SIZES.sm, color: '#6b7280', fontWeight: '600' },
  conditionTextActive: { color: '#fff' },
  submitBtn: { marginTop: 24, borderRadius: RADIUS.md, overflow: 'hidden' },
  submitGradient: { padding: 16, alignItems: 'center' },
  submitText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  imagePickerBtn: { width: 120, height: 120, borderRadius: RADIUS.md, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePickerPlaceholder: { alignItems: 'center', gap: 6 },
  imagePickerText: { fontSize: FONT_SIZES.xs, color: '#b45309', fontWeight: '600' },
  imagePreview: { width: '100%', height: '100%' },
  imageUploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  imageCheckBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 10 },
  changePhotoText: { fontSize: FONT_SIZES.sm, color: '#b45309', fontWeight: '600', marginTop: 8 },
});