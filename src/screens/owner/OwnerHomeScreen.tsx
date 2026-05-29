import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

export default function OwnerHomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Mock recent jobs — replace with real API data later
  const recentJobs = [
    {
      id: '1',
      title: 'Engine check & oil change',
      mechanic: 'Kofi Auto Works',
      status: 'COMPLETED',
      date: 'May 26, 2026',
      cost: 'GHS 180',
    },
    {
      id: '2',
      title: 'Tyre replacement — front left',
      mechanic: 'Mensah Tyres',
      status: 'IN_PROGRESS',
      date: 'May 28, 2026',
      cost: 'GHS 220',
    },
  ];

  const statusColor: Record<string, string> = {
    COMPLETED: '#1b4332',
    IN_PROGRESS: '#b45309',
    PENDING: '#1d4ed8',
    CANCELLED: '#dc2626',
  };

  const statusBg: Record<string, string> = {
    COMPLETED: '#f0fdf4',
    IN_PROGRESS: '#fffbeb',
    PENDING: '#eff6ff',
    CANCELLED: '#fef2f2',
  };

  const statusLabel: Record<string, string> = {
    COMPLETED: 'Completed',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={['#2d6a4f', '#1b4332']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top row */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={22} color="#ffffff" />
              {/* Notification dot */}
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* SOS Button */}
          <TouchableOpacity
            style={styles.sosBtn}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <View style={styles.sosBtnInner}>
              <Ionicons name="warning" size={28} color="#ffffff" />
              <View>
                <Text style={styles.sosBtnTitle}>SOS Emergency</Text>
                <Text style={styles.sosBtnSub}>
                  Tap to find nearest mechanic now
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Active Jobs', value: '1', icon: 'briefcase-outline' },
              { label: 'Vehicles', value: '2', icon: 'car-outline' },
              { label: 'Avg Rating', value: '4.8', icon: 'star-outline' },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Ionicons name={stat.icon as any} size={18} color="#b7e4c7" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* Search shortcut */}
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Ionicons name="search-outline" size={20} color="#6b7280" />
            <Text style={styles.searchText}>Find a mechanic near you...</Text>
            <View style={styles.searchFilterBtn}>
              <Ionicons name="options-outline" size={18} color="#2d6a4f" />
            </View>
          </TouchableOpacity>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { icon: 'search', label: 'Find\nMechanic', color: '#2d6a4f', bg: '#f0fdf4' },
              { icon: 'car', label: 'My\nVehicles', color: '#1d4ed8', bg: '#eff6ff' },
              { icon: 'time', label: 'Service\nHistory', color: '#b45309', bg: '#fffbeb' },
              { icon: 'construct', label: 'Spare\nParts', color: '#7c3aed', bg: '#f5f3ff' },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickAction, { backgroundColor: action.bg }]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={action.icon as any}
                  size={26}
                  color={action.color}
                />
                <Text style={[styles.quickActionLabel, { color: action.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Jobs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentJobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <View style={styles.jobCardLeft}>
                <View style={styles.jobIcon}>
                  <Ionicons name="construct-outline" size={20} color="#2d6a4f" />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobMechanic}>{job.mechanic}</Text>
                  <Text style={styles.jobDate}>{job.date}</Text>
                </View>
              </View>
              <View style={styles.jobCardRight}>
                <View
                  style={[
                    styles.jobStatus,
                    { backgroundColor: statusBg[job.status] },
                  ]}
                >
                  <Text
                    style={[
                      styles.jobStatusText,
                      { color: statusColor[job.status] },
                    ]}
                  >
                    {statusLabel[job.status]}
                  </Text>
                </View>
                <Text style={styles.jobCost}>{job.cost}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Nearby mechanics teaser */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mechanics</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {[
            { name: 'Kofi Auto Works', rating: '4.9', distance: '1.2km', specialization: 'Engine & Electrical' },
            { name: 'Mensah Tyres & Rims', rating: '4.7', distance: '2.4km', specialization: 'Tyres & Brakes' },
            { name: 'Accra Motor Clinic', rating: '4.8', distance: '3.1km', specialization: 'General Service' },
          ].map((mechanic, i) => (
            <TouchableOpacity
              key={i}
              style={styles.mechanicCard}
              activeOpacity={0.8}
            >
              {/* Avatar */}
              <LinearGradient
                colors={['#52b788', '#1b4332']}
                style={styles.mechanicAvatar}
              >
                <Text style={styles.mechanicAvatarText}>
                  {mechanic.name[0]}
                </Text>
              </LinearGradient>

              <View style={styles.mechanicInfo}>
                <Text style={styles.mechanicName}>{mechanic.name}</Text>
                <Text style={styles.mechanicSpec}>{mechanic.specialization}</Text>
                <View style={styles.mechanicMeta}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={styles.mechanicRating}>{mechanic.rating}</Text>
                  <View style={styles.metaDot} />
                  <Ionicons name="location-outline" size={12} color="#6b7280" />
                  <Text style={styles.mechanicDistance}>{mechanic.distance}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Bottom padding for tab bar */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: '#b7e4c7',
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#ffffff',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f87171',
    borderWidth: 1.5,
    borderColor: '#1b4332',
  },

  // SOS
  sosBtn: {
    backgroundColor: '#dc2626',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sosBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  sosBtnTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#ffffff',
  },
  sosBtnSub: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#b7e4c7',
  },

  // Body
  body: {
    padding: SPACING.lg,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#9ca3af',
  },
  searchFilterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: '#2d6a4f',
    fontWeight: '600',
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Job cards
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  jobCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#1b1b1b',
    marginBottom: 2,
  },
  jobMechanic: {
    fontSize: FONT_SIZES.xs,
    color: '#6b7280',
    marginBottom: 2,
  },
  jobDate: {
    fontSize: FONT_SIZES.xs,
    color: '#9ca3af',
  },
  jobCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  jobStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  jobStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  jobCost: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#1b1b1b',
  },

  // Mechanic cards
  mechanicCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mechanicAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#1b1b1b',
    marginBottom: 2,
  },
  mechanicSpec: {
    fontSize: FONT_SIZES.xs,
    color: '#6b7280',
    marginBottom: 4,
  },
  mechanicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mechanicRating: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#1b1b1b',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  mechanicDistance: {
    fontSize: FONT_SIZES.xs,
    color: '#6b7280',
  },
  bookBtn: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#2d6a4f',
  },
  bookBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2d6a4f',
  },
});