import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      Alert.alert('Login Failed', result.payload as string);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={40} color="#fbbf24" />
          <Text style={styles.logoText}>GearUp</Text>
          <Text style={styles.tagline}>Your mechanic, wherever you are.</Text>
        </View>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#1b4332', '#2d6a4f']} style={styles.loginGradient}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logoContainer: { alignItems: 'center', gap: 8 },
  logoText: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 14, color: '#86efac' },
  form: { flex: 1, padding: 24, paddingTop: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1b1b1b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, height: 48 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#1b1b1b' },
  loginBtn: { marginTop: 8, borderRadius: 10, overflow: 'hidden' },
  loginGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#6b7280' },
  registerHighlight: { color: '#1b4332', fontWeight: '700' },
});