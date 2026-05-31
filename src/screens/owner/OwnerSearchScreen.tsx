import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { partsService } from '../../services/partsService';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const CATEGORIES = [
  { label: 'All', icon: 'grid-outline', value: '' },
  { label: 'Engine', icon: 'settings-outline', value: 'ENGINE' },
  { label: 'Battery', icon: 'battery-charging-outline', value: 'BATTERY' },
  { label: 'Tires', icon: 'ellipse-outline', value: 'TIRE_CHANGE' },
  { label: 'Towing', icon: 'car-outline', value: 'TOWING' },
  { label: 'Fuel', icon: 'flash-outline', value: 'FUEL' },
];

export default function OwnerSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState<any[]>([]);
  const [filteredParts, setFilteredParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchParts = async () => {
    try {
      const data = await partsService.getAvailableParts();
      setParts(data);
      setFilteredParts(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParts(); }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await partsService.searchByName(query);
        setFilteredParts(results);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    } else if (query.length === 0) {
      setFilteredParts(parts);
    }
  };

  const handleCarMakeSearch = async (carMake: string) => {
    try {
      const results = await partsService.searchByCarMake(carMake);
      setFilteredParts(results);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <Text style={styles.headerTitle}>Find Parts & Services</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parts by name..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setFilteredParts(parts); }}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
            onPress={() => {
              setSelectedCategory(cat.value);
              if (cat.value === '') {
                setFilteredParts(parts);
              } else {
                handleCarMakeSearch(cat.value);
              }
            }}>
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.value ? '#fff' : '#6b7280'}
            />
            <Text style={[styles.categoryText, selectedCategory === cat.value && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        <Text style={styles.resultsCount}>{filteredParts.length} parts available</Text>
        {loading ? (
          <ActivityIndicator color="#1b4332" style={{ marginTop: 40 }} />
        ) : filteredParts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No parts found</Text>
            <Text style={styles.emptySubText}>Try a different search term</Text>
          </View>
        ) : (
          filteredParts.map(part => (
            <View key={part.id} style={styles.partCard}>
              <View style={styles.partHeader}>
                <View style={styles.partIcon}>
                  <Ionicons name="construct-outline" size={24} color="#1b4332" />
                </View>
                <View style={styles.partInfo}>
                  <Text style={styles.partName}>{part.name}</Text>
                  {part.brand && <Text style={styles.partBrand}>{part.brand}</Text>}
                </View>
                <Text style={styles.partPrice}>GHS {part.price}</Text>
              </View>
              <Text style={styles.partDesc} numberOfLines={2}>{part.description}</Text>
              <View style={styles.partMeta}>
                {part.carMake && (
                  <View style={styles.metaChip}>
                    <Ionicons name="car-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{part.carMake} {part.carModel}</Text>
                  </View>
                )}
                {part.condition && (
                  <View style={styles.metaChip}>
                    <Ionicons name="information-circle-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{part.condition}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Alert.alert('Contact Seller', 'Feature coming soon — direct messaging will be available in the next update.')}>
                <Text style={styles.contactBtnText}>Contact Seller</Text>
              </TouchableOpacity>
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
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, gap: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  categories: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: '#fff', maxHeight: 52 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: '#f3f4f6', marginRight: 8 },
  categoryChipActive: { backgroundColor: '#1b4332' },
  categoryText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#6b7280' },
  categoryTextActive: { color: '#fff' },
  list: { flex: 1, padding: SPACING.lg },
  resultsCount: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: SPACING.md },
  partCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  partHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  partIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  partInfo: { flex: 1 },
  partName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#1b1b1b' },
  partBrand: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  partPrice: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b4332' },
  partDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 8 },
  partMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  contactBtn: { padding: 10, backgroundColor: '#f0fdf4', borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: '#86efac' },
  contactBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#9ca3af', marginTop: 12 },
  emptySubText: { fontSize: FONT_SIZES.sm, color: '#d1d5db', marginTop: 4 },
});