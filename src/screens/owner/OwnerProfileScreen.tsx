import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const MENU_ITEMS = [
  { icon: 'car-outline', label: 'My Vehicles', color: '#1d4ed8', bg: '#eff6ff' },
  { icon: 'time-outline', label: 'Service History', color: '#b45309', bg: '#fffbeb' },
  { icon: 'card-outline', label: 'Payment Methods', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#0891b2', bg: '#ecfeff' },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: '#059669', bg: '#ecfdf5' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#6b7280', bg: '#f9fafb' },
  { icon: 'star-outline', label: 'Rate GearUp', color: '#f59e0b', bg: '#fffbeb' },
];

export default function OwnerProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#2d6a4f', '#1b4332']} style={styles.header}>
          <LinearGradient colors={['#52b788', '#1b4332']} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="car-outline" size={14} color="#1b4332" />
            <Text style={styles.roleText}>Car Owner</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.stats}>
          {[
            { value: '8', label: 'Total Jobs' },
            { value: '2', label: 'Vehicles' },
            { value: '4.8', label: 'Avg Rating' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuRow} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>GearUp v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: '#ffffff' },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#ffffff' },
  phone: { fontSize: FONT_SIZES.sm, color: '#b7e4c7' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#d8f3dc', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  roleText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#1b4332' },
  stats: { flexDirection: 'row', backgroundColor: '#ffffff', margin: SPACING.lg, borderRadius: RADIUS.md, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#1b4332' },
  statLabel: { fontSize: FONT_SIZES.xs, color: '#6b7280', marginTop: 2 },
  menu: { backgroundColor: '#ffffff', marginHorizontal: SPACING.lg, borderRadius: RADIUS.md, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, color: '#1b1b1b' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, margin: SPACING.lg, padding: SPACING.md, backgroundColor: '#fef2f2', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#dc2626' },
  version: { textAlign: 'center', fontSize: FONT_SIZES.xs, color: '#9ca3af' },
});