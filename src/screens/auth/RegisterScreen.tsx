import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../constants';
import api from '../../services/api';

type Role = 'CAR_OWNER' | 'MECHANIC';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('CAR_OWNER');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setIsLoading(true);
      // Mock for now — real API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('OtpVerification', { phone: phone.trim() });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1b4332" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#52b788', '#1b4332']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Ionicons name="construct" size={36} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.appName}>GearUp</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>

          {/* Role selector */}
          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'CAR_OWNER' && styles.roleBtnActive]}
              onPress={() => setRole('CAR_OWNER')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="car-outline"
                size={20}
                color={role === 'CAR_OWNER' ? '#ffffff' : '#2d6a4f'}
              />
              <Text style={[
                styles.roleBtnText,
                role === 'CAR_OWNER' && styles.roleBtnTextActive
              ]}>
                Car Owner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, role === 'MECHANIC' && styles.roleBtnActive]}
              onPress={() => setRole('MECHANIC')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="construct-outline"
                size={20}
                color={role === 'MECHANIC' ? '#ffffff' : '#2d6a4f'}
              />
              <Text style={[
                styles.roleBtnText,
                role === 'MECHANIC' && styles.roleBtnTextActive
              ]}>
                Mechanic
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Kwame Mensah"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={18} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 0244123456"
                placeholderTextColor="#6b7280"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
            style={[styles.btnWrapper, isLoading && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={['#52b788', '#2d6a4f', '#1b4332']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btn}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms note */}
          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>Sign in instead</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: 60,
  },

  // Back button
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#1b4332',
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: '#6b7280',
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Role selector
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#2d6a4f',
    backgroundColor: '#ffffff',
  },
  roleBtnActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  roleBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },

  // Inputs
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#1b1b1b',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: RADIUS.md,
    backgroundColor: '#f9fafb',
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#1b1b1b',
  },
  eyeBtn: {
    padding: 4,
  },

  // Button
  btnWrapper: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Terms
  terms: {
    fontSize: FONT_SIZES.xs,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2d6a4f',
    fontWeight: '600',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: '#6b7280',
  },

  // Outline button
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#2d6a4f',
    borderRadius: RADIUS.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#2d6a4f',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});