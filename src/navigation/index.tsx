// ─────────────────────────────────────────
// GEARUP — Root Navigator
// ─────────────────────────────────────────
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants';

// Auth Screens (placeholders for now)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';

// Tab Navigators
import OwnerTabNavigator from './OwnerTabNavigator';
import MechanicTabNavigator from './MechanicTabNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OtpVerification" component={OtpScreen} />
          </>
        ) : user?.role === 'CAR_OWNER' ? (
          // Car owner app
          <Stack.Screen name="OwnerTabs" component={OwnerTabNavigator} />
        ) : (
          // Mechanic app
          <Stack.Screen name="MechanicTabs" component={MechanicTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}