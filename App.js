import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Text style={styles.text}>آرمک تسک - بعد ThemeProvider</Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#A0C4FF' },
  text: { fontSize: 20, fontWeight: '800', color: '#fff' },
});
