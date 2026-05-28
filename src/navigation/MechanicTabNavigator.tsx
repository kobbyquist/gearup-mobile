import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import MechanicJobsScreen from '../screens/mechanic/MechanicJobsScreen';
import MechanicMessagesScreen from '../screens/mechanic/MechanicMessagesScreen';
import MechanicProfileScreen from '../screens/mechanic/MechanicProfileScreen';

const Tab = createBottomTabNavigator();

export default function MechanicTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
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
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <Ionicons
              name={icons[route.name] as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={MechanicHomeScreen} />
      <Tab.Screen name="Jobs" component={MechanicJobsScreen} />
      <Tab.Screen name="Messages" component={MechanicMessagesScreen} />
      <Tab.Screen name="Profile" component={MechanicProfileScreen} />
    </Tab.Navigator>
  );
}