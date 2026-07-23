import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
            <Ionicons
              name={icons[route.name] as any}
              size={size}
              color={color}
            />
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