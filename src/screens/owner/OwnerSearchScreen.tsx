import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const CATEGORIES = [
  { key: 'ALL', label: 'All', icon: 'apps-outline' },
  { key: 'ENGINE', label: 'Engine', icon: 'cog-outline' },
  { key: 'ELECTRICAL', label: 'Electrical', icon: 'flash-outline' },
  { key: 'TYRES', label: 'Tyres', icon: 'ellipse-outline' },
  { key: 'AC', label: 'AC', icon: 'snow-outline' },
  { key: 'BODYWORK', label: 'Body', icon: 'car-outline' },
  { key: 'BRAKES', label: 'Brakes', icon: 'stop-circle-outline' },
  { key: 'GENERAL', label: 'General', icon: 'construct-outline' },
];

const MOCK_MECHANICS = [
  { id: '1', name: 'Kofi Auto Works', specialization: 'Engine & Electrical', rating: 4.9, reviews: 124, distance: '1.2km', price: 'GHS 50–200', available: true },
  { id: '2', name: 'Mensah Tyres & Rims', specialization: 'Tyres & Brakes', rating: 4.7, reviews: 89, distance: '2.4km', price: 'GHS 80–300', available: true },
  { id: '3', name: 'Accra Motor Clinic', specialization: 'General Service', rating: 4.8, reviews: 201, distance: '3.1km', price: 'GHS 60–250', available: false },
  { id: '4', name: 'Kwame AC & Electrical', specialization: 'AC & Electrical', rating: 4.6, reviews: 67, distance: '4.5km', price: 'GHS 100–400', available: true },
  { id: '5', name: 'Delta Auto Repairs', specialization: 'Body Work & Paint', rating: 4.5, reviews: 43, distance: '5.2km', price: 'GHS 150–800', available: true },
];

export default function OwnerSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filtered = MOCK_MECHANICS.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.specialization.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#2d6a4f', '#1b4332']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Find a Mechanic</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanics or services..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catBtn, activeCategory === cat.key && styles.catBtnActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={activeCategory === cat.key ? '#ffffff' : '#2d6a4f'}
              />
              <Text style={[
                styles.catLabel,
                activeCategory === cat.key && styles.catLabelActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>{filtered.length} mechanics found</Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Ionicons name="swap-vertical-outline" size={16} color="#2d6a4f" />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Mechanic list */}
        <View style={styles.list}>
          {filtered.map(mechanic => (
            <TouchableOpacity
              key={mechanic.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <View style={styles.cardTop}>
                <LinearGradient
                  colors={['#52b788', '#1b4332']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{mechanic.name[0]}</Text>
                </LinearGradient>

                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.mechanicName}>{mechanic.name}</Text>
                    {mechanic.available ? (
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>Available</Text>
                      </View>
                    ) : (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableText}>Busy</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.specialization}>{mechanic.specialization}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.rating}>{mechanic.rating}</Text>
                    <Text style={styles.reviews}>({mechanic.reviews})</Text>
                    <View style={styles.dot} />
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text style={styles.distance}>{mechanic.distance}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.priceRow}>
                  <Ionicons name="cash-outline" size={14} color="#6b7280" />
                  <Text style={styles.price}>{mechanic.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8}>
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff', marginBottom: SPACING.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, height: 48, gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  categories: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: '#2d6a4f',
    backgroundColor: '#ffffff',
  },
  catBtnActive: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  catLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#2d6a4f' },
  catLabelActive: { color: '#ffffff' },
  resultsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  resultsText: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: FONT_SIZES.sm, color: '#2d6a4f', fontWeight: '600' },
  list: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  card: {
    backgroundColor: '#ffffff', borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardTop: { flexDirection: 'row', gap: SPACING.md },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#ffffff' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  mechanicName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b', flex: 1 },
  availableBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  availableText: { fontSize: FONT_SIZES.xs, color: '#1b4332', fontWeight: '600' },
  unavailableBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  unavailableText: { fontSize: FONT_SIZES.xs, color: '#b45309', fontWeight: '600' },
  specialization: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#1b1b1b' },
  reviews: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#d1d5db' },
  distance: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { fontSize: FONT_SIZES.sm, color: '#6b7280' },
  bookBtn: { backgroundColor: '#2d6a4f', paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.sm },
  bookBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#ffffff' },
});