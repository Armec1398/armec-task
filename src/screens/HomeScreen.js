import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadTasks, loadCategories, PRIORITY_LABEL, RECURRENCE } from '../storage';
import { formatDateTime, timeLeft } from '../calendar';
import { theme, priorityBg } from '../theme';
import { getNextUpcomingTask, requestPermission, scheduleAllAlarms } from '../notifications';

export default function HomeScreen() {
  const [next, setNext] = useState(null);
  const [cats, setCats] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const t = await loadTasks();
    setCats(await loadCategories());
    setActiveCount(t.filter((x) => !x.done).length);
    const n = await getNextUpcomingTask();
    setNext(n);
  }

  async function enableAlarms() {
    await requestPermission();
    await scheduleAllAlarms();
  }

  function catOf(id) { return cats.find((c) => c.id === id); }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>آرمک تسک</Text>
        <Text style={styles.heroSub}>مدیریت تسک‌های روزانه و هفتگی</Text>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextLabel}>نزدیک‌ترین ددلاین</Text>
        {next ? (
          <View>
            <Text style={styles.nextTitle}>{next.title}</Text>
            <View style={styles.nextMeta}>
              <View style={[styles.pill, { backgroundColor: priorityBg[next.priority] }]}><Text style={styles.pillText}>{PRIORITY_LABEL[next.priority]}</Text></View>
              {catOf(next.categoryId) ? <View style={[styles.pill, { backgroundColor: catOf(next.categoryId).color }]}><Text style={styles.pillText}>{catOf(next.categoryId).name}</Text></View> : null}
            </View>
            <Text style={styles.nextTime}>{formatDateTime(next.deadline)}</Text>
            <Text style={styles.nextLeft}>{timeLeft(next.deadline)} مانده</Text>
          </View>
        ) : (
          <Text style={styles.emptyNext}>تسک فعالی با ددلاین نیست 🎉</Text>
        )}
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNum}>{activeCount}</Text>
        <Text style={styles.statLbl}>تسک فعال</Text>
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primaryDark }]} onPress={enableAlarms}>
        <Ionicons name="notifications-outline" size={20} color="#fff" />
        <Text style={styles.btnText}>فعال‌سازی آلارم‌ها</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 20 },
  hero: { alignItems: 'center', marginVertical: 20 },
  heroTitle: { fontSize: 30, fontWeight: '900', color: theme.primaryDark },
  heroSub: { fontSize: 14, color: theme.textLight, marginTop: 4 },
  nextCard: { backgroundColor: theme.surface, borderRadius: 18, padding: 18, marginBottom: 14, elevation: 2 },
  nextLabel: { fontSize: 13, color: theme.textLight, marginBottom: 6 },
  nextTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
  nextMeta: { flexDirection: 'row', marginTop: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginRight: 6 },
  pillText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  nextTime: { fontSize: 13, color: theme.textLight, marginTop: 8 },
  nextLeft: { fontSize: 15, fontWeight: '700', color: theme.accent, marginTop: 2 },
  emptyNext: { fontSize: 15, color: theme.textLight, marginTop: 8 },
  statCard: { backgroundColor: theme.pastel.green, borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 14 },
  statNum: { fontSize: 28, fontWeight: '800', color: theme.text },
  statLbl: { fontSize: 13, color: theme.textLight },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});
