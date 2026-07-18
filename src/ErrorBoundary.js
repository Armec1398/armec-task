import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.log('ERROR BOUNDARY:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>خطا در اجرای اپ:</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.err}>{String(this.state.error && this.state.error.stack || this.state.error)}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 18, fontWeight: '800', color: '#d00', marginBottom: 10 },
  scroll: { flex: 1 },
  err: { fontSize: 12, color: '#333', fontFamily: 'monospace' },
});
