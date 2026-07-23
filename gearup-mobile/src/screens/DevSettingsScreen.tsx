import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, StatusBar, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getBaseIP, saveBaseIP } from '../services/api';
import { SPACING, FONT_SIZES, RADIUS } from '../constants';

export default function DevSettingsScreen({ navigation }: any) {
  const [ip, setIp] = useState('');
  const [savedIp, setSavedIp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBaseIP().then(current => {
      setIp(current);
      setSavedIp(current);
    });
  }, []);

  const handleSave = async () => {
    if (!ip.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip.trim())) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address (e.g. 172.20.10.4)');
      return;
    }
    setSaving(true);
    try {
      await saveBaseIP(ip.trim());
      setSavedIp(ip.trim());
      Alert.alert('Saved!', `Backend IP updated to ${ip.trim()}\n\nRestart the app for changes to take full effect.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save IP');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b1b1b', '#374151']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Dev Settings</Text>
          <Text style={styles.headerSubtitle}>Backend configuration</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={20} color="#1b4332" />
            <Text style={styles.cardTitle}>Backend IP Address</Text>
          </View>
          <Text style={styles.cardDesc}>
            Set this to your PC's current IPv4 address when using a phone hotspot.
            Run <Text style={styles.code}>ipconfig</Text> on your PC and look for the WiFi IPv4 address.
          </Text>

          <Text style={styles.label}>Current saved IP</Text>
          <View style={styles.savedIpRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.savedIpText}>{savedIp}</Text>
          </View>

          <Text style={styles.label}>New IP Address</Text>
          <TextInput
            style={styles.input}
            value={ip}
            onChangeText={setIp}
            placeholder="e.g. 172.20.10.4"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.saveBtnGradient}>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save & Apply'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
            <Text style={styles.cardTitle}>Service Ports</Text>
          </View>
          {[
            { name: 'Auth Service', port: 8081 },
            { name: 'User Service', port: 8082 },
            { name: 'Vehicle Service', port: 8083 },
            { name: 'Job Service', port: 8084 },
            { name: 'Payment Service', port: 8085 },
            { name: 'Review Service', port: 8086 },
            { name: 'Parts Service', port: 8087 },
          ].map(service => (
            <View key={service.port} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePort}>{savedIp}:{service.port}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: FONT_SIZES.xs, color: '#9ca3af', marginTop: 2 },
  content: { flex: 1, padding: SPACING.lg },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1b1b1b' },
  cardDesc: { fontSize: FONT_SIZES.sm, color: '#6b7280', marginBottom: SPACING.md, lineHeight: 20 },
  code: { fontFamily: 'monospace', backgroundColor: '#f3f4f6', color: '#1b1b1b' },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  savedIpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', padding: 10, borderRadius: RADIUS.sm, marginBottom: 4 },
  savedIpText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: '#10b981', fontFamily: 'monospace' },
  input: { backgroundColor: '#f9fafb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: FONT_SIZES.md, color: '#1b1b1b', fontFamily: 'monospace' },
  saveBtn: { marginTop: SPACING.lg, borderRadius: RADIUS.md, overflow: 'hidden' },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  serviceName: { fontSize: FONT_SIZES.sm, color: '#374151', fontWeight: '500' },
  servicePort: { fontSize: FONT_SIZES.xs, color: '#6b7280', fontFamily: 'monospace' },
});