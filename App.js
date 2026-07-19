import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';
import * as Calendar from './src/calendar';

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.text}>تست import calendar (jalali-moment)</Text>
        <Text style={styles.sub}>{typeof Calendar.toJalali}</Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#A0C4FF', padding: 20 },
  text: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 14, color: '#fff', marginTop: 10 },
});
