import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { SPACING, FONT_SIZES, RADIUS } from '../../constants';

const INCOMING_JOBS = [
  { id: '1', client: 'Kwame Asante', title: 'Engine making knocking sound', type: 'STANDARD', distance: '2.3km', budget: 'GHS 150', time: '5 min ago' },
  { id: '2', client: 'Ama Boateng', title: 'Car won\'t start — battery issue', type: 'SOS', distance: '1.1km', budget: 'GHS 80', time: '2 min ago' },
];

export default function MechanicHomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSosAvailable, setIsSosAvailable] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#b45309', '#78350f']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{firstName} 🔧</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Availability toggles */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleDot, { backgroundColor: isAvailable ? '#22c55e' : '#6b7280' }]} />
                <View>
                  <Text style={styles.toggleLabel}>Available for Jobs</Text>
                  <Text style={styles.toggleSub}>Clients can book you</Text>
                </View>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={isAvailable ? '#16a34a' : '#ffffff'}
              />
            </View>

            <View style={styles.toggleDivider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleDot, { backgroundColor: isSosAvailable ? '#dc2626' : '#6b7280' }]} />
                <View>
                  <Text style={styles.toggleLabel}>Available for SOS</Text>
                  <Text style={styles.toggleSub}>Emergency requests only</Text>
                </View>
              </View>
              <Switch
                value={isSosAvailable}
                onValueChange={setIsSosAvailable}
                trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
                thumbColor={isSosAvailable ? '#dc2626' : '#ffffff'}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Today\'s Jobs', value: '3', icon: 'briefcase-outline' },
              { label: 'This Month', value: '24', icon: 'calendar-outline' },
              { label: 'Rating', value: '4.9', icon: 'star-outline' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Ionicons name={s.icon as any} size={16} color="#fde68a" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>

          {/* Incoming requests */}
          <Text style={styles.sectionTitle}>Incoming Requests</Text>
          {INCOMING_JOBS.map(job => (
            <View key={job.id} style={styles.requestCard}>
              {job.type === 'SOS' && (
                <View style={styles.sosBanner}>
                  <Ionicons name="warning" size={14} color="#dc2626" />
                  <Text style={styles.sosBannerText}>SOS EMERGENCY</Text>
                </View>
              )}
              <View style={styles.requestTop}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>{job.client[0]}</Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.clientName}>{job.client}</Text>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={styles.requestMeta}>
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{job.distance}</Text>
                    <View style={styles.metaDot} />
                    <Ionicons name="cash-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{job.budget}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{job.time}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.declineBtn}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn}>
                  <LinearGradient
                    colors={['#52b788', '#1b4332']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.acceptBtnGradient}
                  >
                    <Text style={styles.acceptBtnText}>Accept Job</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Earnings summary */}
          <Text style={styles.sectionTitle}>Earnings This Week</Text>
          <LinearGradient colors={['#1b4332', '#081c15']} style={styles.earningsCard}>
            <View style={styles.earningsTop}>
              <View>
                <Text style={styles.earningsLabel}>Total Earned</Text>
                <Text style={styles.earningsValue}>GHS 1,240</Text>
              </View>
              <View style={styles.earningsRight}>
                <Ionicons name="trending-up" size={32} color="#52b788" />
                <Text style={styles.earningsChange}>+18%</Text>
              </View>
            </View>
            <View style={styles.earningsMeta}>
              <Text style={styles.earningsMetaText}>12 jobs completed  •  GHS 1,488 gross</Text>
            </View>
          </LinearGradient>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  greeting: { fontSize: FONT_SIZES.md, color: '#fde68a' },
  userName: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: '#ffffff' },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  toggleCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  toggleDot: { width: 10, height: 10, borderRadius: 5 },
  toggleLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#ffffff' },
  toggleSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.6)' },
  toggleDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: SPACING.sm },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, padding: SPACING.md },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#ffffff' },
  statLabel: { fontSize: FONT_SIZES.xs, color: '#fde68a' },
  body: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1b1b1b', marginBottom: SPACING.md },
  requestCard: { backgroundColor: '#ffffff', borderRadius: RADIUS.md, marginBottom: SPACING.sm, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sosBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', padding: SPACING.sm, paddingHorizontal: SPACING.md },
  sosBannerText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#dc2626', letterSpacing: 1 },
  requestTop: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md },
  clientAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  clientAvatarText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#2d6a4f' },
  requestInfo: { flex: 1 },
  clientName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1b1b1b', marginBottom: 2 },
  jobTitle: { fontSize: FONT_SIZES.sm, color: '#374151', marginBottom: 6 },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6b7280' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#d1d5db' },
  requestActions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  declineBtn: { flex: 1, height: 44, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  declineBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#6b7280' },
  acceptBtn: { flex: 2, borderRadius: RADIUS.sm, overflow: 'hidden' },
  acceptBtnGradient: { height: 44, justifyContent: 'center', alignItems: 'center' },
  acceptBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#ffffff' },
  earningsCard: { borderRadius: RADIUS.md, padding: SPACING.lg, gap: SPACING.sm },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  earningsLabel: { fontSize: FONT_SIZES.sm, color: '#b7e4c7', marginBottom: 4 },
  earningsValue: { fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: '#ffffff' },
  earningsRight: { alignItems: 'center', gap: 4 },
  earningsChange: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#52b788' },
  earningsMeta: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: SPACING.sm },
  earningsMetaText: { fontSize: FONT_SIZES.xs, color: '#b7e4c7' },
});