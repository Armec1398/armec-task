import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadTasks, loadCategories } from '../storage';
import { startOfMonthGrid, toJalali, formatTime, WEEKDAY_LABELS, addDays } from '../calendar';
import { theme as _theme, priorityBg } from '../theme';
import { RECURRENCE } from '../storage';
import { useTheme } from '../ThemeContext';

function dayKey(y, m, d) { return `${y}-${m}-${d}`; }

export default function CalendarScreen() {
  const { theme } = useTheme();
  const today = toJalali(new Date());
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);

  const refresh = useCallback(async () => {
    const t = await loadTasks();
    const c = await loadCategories();
    setTasks(t); setCategories(c);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const grid = startOfMonthGrid(year, month);
  const monthName = ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][month];

  function tasksForDay(y, m, d) {
    const key = dayKey(y, m, d);
    return tasks.filter((t) => {
      if (t.done) return false;
      const occ = getOccurrences(t, y, m, d);
      return occ.has(key);
    });
  }

  function getOccurrences(task, y, m, d) {
    const set = new Set();
    const start = new Date(task.deadline);
    const sj = toJalali(start);
    if (task.recurrence === RECURRENCE.NONE) {
      set.add(dayKey(sj.year, sj.month, sj.day));
    } else if (task.recurrence === RECURRENCE.DAILY) {
      for (let i = 0; i <= 60; i++) {
        const dt = addDays(start, i);
        const j = toJalali(dt);
        set.add(dayKey(j.year, j.month, j.day));
      }
    } else if (task.recurrence === RECURRENCE.WEEKLY) {
      for (let i = 0; i <= 60; i += 7) {
        const dt = addDays(start, i);
        const j = toJalali(dt);
        set.add(dayKey(j.year, j.month, j.day));
      }
    } else if (task.recurrence === RECURRENCE.CUSTOM_DAYS) {
      const step = task.recurrenceDays || 1;
      for (let i = 0; i <= 180; i += step) {
        const dt = addDays(start, i);
        const j = toJalali(dt);
        set.add(dayKey(j.year, j.month, j.day));
      }
    }
    return set;
  }

  function onSelect(cell) {
    setSelected(cell);
    const list = tasksForDay(cell.year, cell.month, cell.day);
    setDayTasks(list.sort((a, b) => a.deadline - b.deadline));
  }

  function changeMonth(delta) {
    let nm = month + delta;
    let ny = year;
    if (nm < 1) { nm = 12; ny--; }
    if (nm > 12) { nm = 1; ny++; }
    setYear(ny); setMonth(nm);
  }

  function catOf(id) { return categories.find((c) => c.id === id); }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}><Ionicons name="chevron-forward" size={26} color={theme.primaryDark} /></TouchableOpacity>
        <Text style={styles.monthText}>{monthName} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}><Ionicons name="chevron-back" size={26} color={theme.primaryDark} /></TouchableOpacity>
      </View>
      <View style={styles.weekdays}>
        {WEEKDAY_LABELS.map((w) => <Text key={w} style={styles.wd}>{w}</Text>)}
      </View>
      <View style={styles.grid}>
        {grid.map((cell, i) => {
          const ts = tasksForDay(cell.year, cell.month, cell.day);
          const isToday = !cell.other && cell.day === today.day && cell.month === today.month && cell.year === today.year;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.cell, cell.other && styles.otherCell, isToday && styles.todayCell]}
              onPress={() => onSelect(cell)}
            >
              <Text style={[styles.cellDay, cell.other && styles.otherText]}>{cell.day}</Text>
              <View style={styles.dotRow}>
                {ts.slice(0, 3).map((t, k) => {
                  const c = catOf(t.categoryId);
                  return <View key={k} style={[styles.dot, { backgroundColor: c ? c.color : theme.primary }]} />;
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selected ? `${selected.day} ${monthName} ${selected.year}` : ''}
            </Text>
            <FlatList
              data={dayTasks}
              keyExtractor={(t) => t.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const c = catOf(item.categoryId);
                return (
                  <View style={[styles.taskRow, { borderLeftColor: c ? c.color : theme.primary }]}>
                    <View style={[styles.pill, { backgroundColor: priorityBg[item.priority] }]}><Text style={styles.pillText}>{formatTime(item.deadline)}</Text></View>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    {item.note ? <Text style={styles.taskNote}>{item.note}</Text> : null}
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.empty}>تسکی برای این روز نیست.</Text>}
            />
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primaryDark }]} onPress={() => setSelected(null)}>
              <Text style={styles.btnText}>بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  monthText: { fontSize: 20, fontWeight: '800', color: theme.text },
  weekdays: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 },
  wd: { flex: 1, textAlign: 'center', color: theme.textLight, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  cell: { width: '14.28%', aspectRatio: 1, padding: 4, alignItems: 'center', justifyContent: 'center' },
  otherCell: { opacity: 0.35 },
  todayCell: { backgroundColor: theme.pastel.blue, borderRadius: 10 },
  cellDay: { fontSize: 15, color: theme.text, fontWeight: '600' },
  otherText: { color: theme.textLight },
  dotRow: { flexDirection: 'row', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginHorizontal: 1 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modal: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 12 },
  list: { paddingBottom: 10 },
  taskRow: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 8 },
  pillText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  taskTitle: { fontSize: 15, fontWeight: '700', color: theme.text, flex: 1 },
  taskNote: { fontSize: 12, color: theme.textLight },
  empty: { textAlign: 'center', color: theme.textLight, marginTop: 20 },
  btn: { padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
