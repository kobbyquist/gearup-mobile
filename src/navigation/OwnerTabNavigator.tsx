import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

// Placeholder screens — we'll build these next
import OwnerHomeScreen from '../screens/owner/OwnerHomeScreen';
import OwnerSearchScreen from '../screens/owner/OwnerSearchScreen';
import OwnerJobsScreen from '../screens/owner/OwnerJobsScreen';
import OwnerMessagesScreen from '../screens/owner/OwnerMessagesScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';

const Tab = createBottomTabNavigator();

export default function OwnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
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
            Search: focused ? 'search' : 'search-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={OwnerHomeScreen} />
      <Tab.Screen name="Search" component={OwnerSearchScreen} />
      <Tab.Screen name="Jobs" component={OwnerJobsScreen} />
      <Tab.Screen name="Messages" component={OwnerMessagesScreen} />
      <Tab.Screen name="Profile" component={OwnerProfileScreen} />
    </Tab.Navigator>
  );
}