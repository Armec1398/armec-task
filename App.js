import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import ReportScreen from './src/screens/ReportScreen';

import { theme } from './src/theme';
import { ThemeProvider } from './src/ThemeContext';
import { requestPermission, scheduleAllAlarms, scheduleSnooze } from './src/notifications';
import { loadSettings } from './src/storage';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    init();
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data && data.taskId && data.snooze) {
        scheduleSnooze(data.taskId, data.snooze);
      }
    });
    return () => sub.remove();
  }, []);

  async function init() {
    await requestPermission();
    await scheduleAllAlarms();
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.text, fontWeight: '800' },
          headerTintColor: theme.primaryDark,
          tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
          tabBarActiveTintColor: theme.primaryDark,
          tabBarInactiveTintColor: theme.textLight,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              خانه: 'home-outline',
              تسک‌ها: 'list-outline',
              تقویم: 'calendar-outline',
              دسته‌ها: 'folder-outline',
              گزارش: 'bar-chart-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="خانه" component={HomeScreen} />
        <Tab.Screen name="تسک‌ها" component={TasksScreen} />
        <Tab.Screen name="تقویم" component={CalendarScreen} />
        <Tab.Screen name="دسته‌ها" component={CategoriesScreen} />
        <Tab.Screen name="گزارش" component={ReportScreen} />
      </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
