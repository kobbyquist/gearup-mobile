import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadStoredUser } from '../store/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import OwnerTabNavigator from './OwnerTabNavigator';
import MechanicTabNavigator from './MechanicTabNavigator';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadStoredUser());
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1b4332" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : user.role === 'OWNER' ? (
          <Stack.Screen name="OwnerTabs" component={OwnerTabNavigator} />
        ) : (
          <Stack.Screen name="MechanicTabs" component={MechanicTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}