import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

const TABS = [
  { key: 'home', label: 'خانه', icon: 'home-outline' },
  { key: 'tasks', label: 'تسک‌ها', icon: 'list-outline' },
  { key: 'calendar', label: 'تقویم', icon: 'calendar-outline' },
  { key: 'categories', label: 'دسته‌ها', icon: 'folder-outline' },
  { key: 'report', label: 'گزارش', icon: 'bar-chart-outline' },
];

export default function CustomTabs({ children }) {
  const [active, setActive] = useState('home');
  const screens = {};
  React.Children.forEach(children, (child) => {
    if (child && child.props && child.props.name) screens[child.props.name] = child.props.component;
  });
  const ActiveScreen = screens[active];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {ActiveScreen ? React.createElement(ActiveScreen) : null}
      </View>
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setActive(t.key)}>
            <Ionicons name={t.icon} size={22} color={active === t.key ? theme.primaryDark : theme.textLight} />
            <Text style={[styles.tabLabel, { color: active === t.key ? theme.primaryDark : theme.textLight }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

CustomTabs.Screen = ({ name, component }) => null;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },
});
