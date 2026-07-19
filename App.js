import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import ReportScreen from './src/screens/ReportScreen';
import { ThemeProvider } from './src/ThemeContext';
import { requestPermission, scheduleAllAlarms, scheduleSnooze } from './src/notifications';
import CustomTabs from './src/CustomTabs';
import ErrorBoundary from './src/ErrorBoundary';

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
    try {
      await requestPermission();
      await scheduleAllAlarms();
    } catch (e) {
      console.log('init error:', e);
    }
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CustomTabs>
          <CustomTabs.Screen name="home" component={HomeScreen} />
          <CustomTabs.Screen name="tasks" component={TasksScreen} />
          <CustomTabs.Screen name="calendar" component={CalendarScreen} />
          <CustomTabs.Screen name="categories" component={CategoriesScreen} />
          <CustomTabs.Screen name="report" component={ReportScreen} />
        </CustomTabs>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
