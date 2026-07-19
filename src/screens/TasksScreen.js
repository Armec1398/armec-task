import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Switch,
  StyleSheet, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  loadTasks, saveTasks, loadCategories, PRIORITY, PRIORITY_LABEL,
  PRIORITY_COLOR, RECURRENCE, RECURRENCE_LABEL, createId,
} from '../storage';
import { formatDateTime, timeLeft, formatTime } from '../calendar';
import { theme as _theme, priorityBg } from '../theme';
import { scheduleAllAlarms, requestPermission, scheduleSnooze } from '../notifications';
import { useTheme } from '../ThemeContext';

export default function TasksScreen() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState(PRIORITY.MEDIUM);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState(RECURRENCE.NONE);
  const [recurrenceDays, setRecurrenceDays] = useState('3');
  const [filter, setFilter] = useState('all');

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const t = await loadTasks();
    const c = await loadCategories();
    setTasks(t);
    setCategories(c);
    if (!category && c[0]) setCategory(c[0].id);
  }

  function openAdd() {
    setEditing(null);
    setTitle(''); setNote(''); setPriority(PRIORITY.MEDIUM);
    setRecurrence(RECURRENCE.NONE); setRecurrenceDays('3');
    const d = new Date();
    setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    if (categories[0]) setCategory(categories[0].id);
    setModalVisible(true);
  }

  function openEdit(task) {
    setEditing(task);
    setTitle(task.title); setNote(task.note || '');
    setPriority(task.priority); setCategory(task.categoryId);
    setRecurrence(task.recurrence); setRecurrenceDays(String(task.recurrenceDays || 3));
    const d = new Date(task.deadline);
    setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    setModalVisible(true);
  }

  async function save() {
    if (!title.trim()) { Alert.alert('خطا', 'عنوان تسک را وارد کن'); return; }
    const [y, m, d] = date.split('-').map(Number);
    const [h, mi] = time.split(':').map(Number);
    const deadline = new Date(y, m - 1, d, h, mi).getTime();
    if (editing) {
      const updated = tasks.map((t) =>
        t.id === editing.id ? { ...t, title, note, categoryId: category, priority, deadline, recurrence, recurrenceDays: Number(recurrenceDays) } : t
      );
      setTasks(updated); await saveTasks(updated);
    } else {
      const nt = {
        id: createId(), title, note, categoryId: category, priority,
        deadline, recurrence, recurrenceDays: Number(recurrenceDays),
        done: false, doneAt: null, createdAt: Date.now(),
      };
      const updated = [nt, ...tasks];
      setTasks(updated); await saveTasks(updated);
    }
    setModalVisible(false);
    await requestPermission();
    await scheduleAllAlarms();
  }

  async function toggleDone(task) {
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : null } : t
    );
    setTasks(updated); await saveTasks(updated);
    await scheduleAllAlarms();
  }

  async function remove(task) {
    Alert.alert('حذف', 'آیا مطمئنی؟', [
      { text: 'لغو', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          const updated = tasks.filter((t) => t.id !== task.id);
          setTasks(updated); await saveTasks(updated);
          await scheduleAllAlarms();
        },
      },
    ]);
  }

  async function snooze(task) {
    const mins = 10;
    await scheduleSnooze(task.id, mins);
    Alert.alert('اسنوز', `آلارم ${mins} دقیقه دیگر یادآوری می‌شود.`);
  }

  const shown = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return t.categoryId === filter;
  }).sort((a, b) => a.deadline - b.deadline);

  function catOf(id) { return categories.find((c) => c.id === id); }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {[{ id: 'all', name: 'همه', color: theme.primary }, { id: 'active', name: 'فعال', color: theme.accent }, { id: 'done', name: 'انجام‌شده', color: theme.success }].concat(categories).map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, { backgroundColor: filter === f.id ? f.color : theme.surface, borderColor: f.color }]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={{ color: filter === f.id ? '#fff' : theme.text, fontWeight: '600' }}>{f.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={shown}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const c = catOf(item.categoryId);
          const overdue = !item.done && item.deadline < Date.now();
          return (
            <View style={[styles.card, { borderLeftColor: c ? c.color : theme.primary }]}>
              <TouchableOpacity style={styles.check} onPress={() => toggleDone(item)}>
                <Ionicons name={item.done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={item.done ? theme.success : theme.textLight} />
              </TouchableOpacity>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, item.done && styles.doneText]}>{item.title}</Text>
                {item.note ? <Text style={styles.cardNote}>{item.note}</Text> : null}
                <View style={styles.cardMeta}>
                  <View style={[styles.pill, { backgroundColor: priorityBg[item.priority] }]}>
                    <Text style={styles.pillText}>{PRIORITY_LABEL[item.priority]}</Text>
                  </View>
                  {c ? <View style={[styles.pill, { backgroundColor: c.color }]}><Text style={styles.pillText}>{c.name}</Text></View> : null}
                  {item.recurrence !== RECURRENCE.NONE ? <View style={[styles.pill, { backgroundColor: theme.pastel.purple }]}><Text style={styles.pillText}>{RECURRENCE_LABEL[item.recurrence]}</Text></View> : null}
                </View>
                <Text style={[styles.deadline, overdue && styles.overdue]}>
                  {formatDateTime(item.deadline)} • {timeLeft(item.deadline)}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => snooze(item)}><Ionicons name="alarm-outline" size={20} color={theme.primaryDark} /></TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(item)}><Ionicons name="create-outline" size={20} color={theme.textLight} /></TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item)}><Ionicons name="trash-outline" size={20} color={theme.danger} /></TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>تسکی نیست. دکمه + بزن.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'ویرایش تسک' : 'تسک جدید'}</Text>
            <TextInput style={styles.input} placeholder="عنوان تسک" placeholderTextColor={theme.textLight} value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, styles.noteInput]} placeholder="توضیح / موضوع (مثلا متن محتوا)" placeholderTextColor={theme.textLight} value={note} onChangeText={setNote} multiline />
            <Text style={styles.label}>دسته‌بندی</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((c) => (
                <TouchableOpacity key={c.id} style={[styles.catChip, { backgroundColor: category === c.id ? c.color : theme.surface, borderColor: c.color }]} onPress={() => setCategory(c.id)}>
                  <Text style={{ color: category === c.id ? '#fff' : theme.text }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>اولویت</Text>
            <View style={styles.row}>
              {[PRIORITY.HIGH, PRIORITY.MEDIUM, PRIORITY.LOW].map((p) => (
                <TouchableOpacity key={p} style={[styles.priChip, { backgroundColor: priority === p ? PRIORITY_COLOR[p] : theme.surface, borderColor: PRIORITY_COLOR[p] }]} onPress={() => setPriority(p)}>
                  <Text style={{ color: priority === p ? '#fff' : theme.text }}>{PRIORITY_LABEL[p]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>تاریخ (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="1404-01-01" value={date} onChangeText={setDate} />
            <Text style={styles.label}>ساعت (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="14:30" value={time} onChangeText={setTime} />
            <Text style={styles.label}>تکرار</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[RECURRENCE.NONE, RECURRENCE.DAILY, RECURRENCE.WEEKLY, RECURRENCE.CUSTOM_DAYS].map((r) => (
                <TouchableOpacity key={r} style={[styles.catChip, { backgroundColor: recurrence === r ? theme.primary : theme.surface, borderColor: theme.primary }]} onPress={() => setRecurrence(r)}>
                  <Text style={{ color: recurrence === r ? '#fff' : theme.text }}>{RECURRENCE_LABEL[r]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {recurrence === RECURRENCE.CUSTOM_DAYS ? (
              <View>
                <Text style={styles.label}>هر چند روز (مثلا 3)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={recurrenceDays} onChangeText={setRecurrenceDays} />
              </View>
            ) : null}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.danger }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primaryDark }]} onPress={save}>
                <Text style={styles.btnText}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  filters: { maxHeight: 56, paddingVertical: 10, paddingHorizontal: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  list: { padding: 14, paddingBottom: 100 },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', borderLeftWidth: 5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  check: { paddingTop: 2, marginRight: 10 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  doneText: { textDecorationLine: 'line-through', color: theme.textLight },
  cardNote: { fontSize: 13, color: theme.textLight, marginTop: 2 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginRight: 6, marginBottom: 4 },
  pillText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  deadline: { fontSize: 12, color: theme.textLight, marginTop: 6 },
  overdue: { color: theme.danger, fontWeight: '700' },
  actions: { justifyContent: 'space-around', paddingLeft: 6 },
  fab: { position: 'absolute', bottom: 24, left: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: theme.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  empty: { textAlign: 'center', color: theme.textLight, marginTop: 40 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modal: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 12, textAlign: 'center' },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, marginBottom: 10, color: theme.text, borderWidth: 1, borderColor: theme.border },
  noteInput: { height: 70, textAlignVertical: 'top' },
  label: { fontSize: 13, color: theme.textLight, marginBottom: 4, marginTop: 6 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 8, borderWidth: 1 },
  priChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginRight: 8, borderWidth: 1 },
  row: { flexDirection: 'row' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { flex: 1, padding: 14, borderRadius: 14, marginHorizontal: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
