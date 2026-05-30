import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'MECHANIC'>('OWNER');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const result = await dispatch(registerUser({ name, email, phone, password, role }));
    if (registerUser.rejected.match(result)) {
      Alert.alert('Registration Failed', result.payload as string);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <Ionicons name="construct" size={36} color="#fbbf24" />
        <Text style={styles.logoText}>GearUp</Text>
        <Text style={styles.tagline}>Join the community</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Role Selector */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'OWNER' && styles.roleActive]}
            onPress={() => setRole('OWNER')}>
            <Ionicons name="car-outline" size={20} color={role === 'OWNER' ? '#fff' : '#6b7280'} />
            <Text style={[styles.roleText, role === 'OWNER' && styles.roleTextActive]}>Car Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'MECHANIC' && styles.roleActive]}
            onPress={() => setRole('MECHANIC')}>
            <Ionicons name="construct-outline" size={20} color={role === 'MECHANIC' ? '#fff' : '#6b7280'} />
            <Text style={[styles.roleText, role === 'MECHANIC' && styles.roleTextActive]}>Mechanic</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="024XXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#9ca3af" />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
          <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.registerGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerText}>Create Account</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: 30, alignItems: 'center', gap: 6 },
  logoText: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 13, color: '#86efac' },
  form: { padding: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1b1b1b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  roleActive: { backgroundColor: '#1b4332', borderColor: '#1b4332' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  roleTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, height: 48 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#1b1b1b' },
  registerBtn: { marginTop: 8, borderRadius: 10, overflow: 'hidden' },
  registerGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { fontSize: 14, color: '#6b7280' },
  loginHighlight: { color: '#1b4332', fontWeight: '700' },
});