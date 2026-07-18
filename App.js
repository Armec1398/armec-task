import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './src/ThemeContext';
import { theme } from './src/theme';

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Ionicons name="home-outline" size={40} color={theme.primaryDark} />
        <Text style={styles.text}>تست فقط Ionicons</Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  text: { fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 10 },
});
