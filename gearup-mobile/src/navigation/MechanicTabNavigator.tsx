import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useUnreadMessagesCount } from '../hooks/useUnreadMessagesCount';
import { COLORS } from '../constants';
import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import MechanicJobsScreen from '../screens/mechanic/MechanicJobsScreen';
import MechanicMessagesScreen from '../screens/mechanic/MechanicMessagesScreen';
import MechanicProfileScreen from '../screens/mechanic/MechanicProfileScreen';
import MechanicPartsScreen from '../screens/mechanic/MechanicPartsScreen';
import MechanicMapScreen from '../screens/mechanic/MechanicMapScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MechanicTabs() {
  const { user } = useSelector((state: RootState) => state.auth);
  const unreadCount = useUnreadMessagesCount(user?.userId);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#b45309',
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 6,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Parts: focused ? 'construct' : 'construct-outline',
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <View>
              <Ionicons
                name={icons[route.name] as any}
                size={size}
                color={color}
              />
              {route.name === 'Messages' && unreadCount > 0 && <View style={mechanicTabStyles.tabDot} />}
            </View>
          );
        },
      })}>
      <Tab.Screen name="Home" component={MechanicHomeScreen} />
      <Tab.Screen name="Jobs" component={MechanicJobsScreen} />
      <Tab.Screen name="Parts" component={MechanicPartsScreen} />
      <Tab.Screen name="Messages" component={MechanicMessagesScreen} />
      <Tab.Screen name="Profile" component={MechanicProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MechanicTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MechanicTabs" component={MechanicTabs} />
      <Stack.Screen name="MechanicMap" component={MechanicMapScreen} />
    </Stack.Navigator>
  );
}

const mechanicTabStyles = StyleSheet.create({
  tabDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});