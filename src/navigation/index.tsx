import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadStoredUser } from '../store/slices/authSlice';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import OwnerTabNavigator from './OwnerTabNavigator';
import MechanicTabNavigator from './MechanicTabNavigator';

const Stack = createNativeStackNavigator();
const SPLASH_DURATION = 1800;

export default function Navigation() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(loadStoredUser());
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
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