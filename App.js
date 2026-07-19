import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';
import { theme } from './src/theme';

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.text}>تست بدون هیچ notification</Text>
        <Text style={styles.sub}>اگه این باز شد یعنی notifications مشکل‌سازه</Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 20 },
  text: { fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' },
  sub: { fontSize: 14, color: theme.textLight, marginTop: 10 },
});
