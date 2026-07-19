import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { theme } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>تست فقط import expo-notifications</Text>
      <Text style={styles.sub}>{typeof Notifications.scheduleNotificationAsync}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 20 },
  text: { fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' },
  sub: { fontSize: 14, color: theme.textLight, marginTop: 10 },
});
