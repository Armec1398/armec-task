import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { loadTasks, loadCategories, exportAll, importAll } from '../storage';
import { formatDateTime } from '../calendar';
import { theme as _theme } from '../theme';
import { PRIORITY_LABEL, RECURRENCE_LABEL } from '../storage';
import { useTheme } from '../ThemeContext';

export default function ReportScreen() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { refresh(); }, []);
  async function refresh() { setTasks(await loadTasks()); setCategories(await loadCategories()); }
  function catName(id) { const c = categories.find((x) => x.id === id); return c ? c.name : '-'; }

  async function exportExcel() {
    setBusy(true);
    try {
      const done = tasks.filter((t) => t.done);
      const rows = done.map((t) => ({
        'عنوان': t.title,
        'موضوع/توضیح': t.note || '',
        'دسته': catName(t.categoryId),
        'اولویت': PRIORITY_LABEL[t.priority],
        'ددلاین': formatDateTime(t.deadline),
        'تکرار': RECURRENCE_LABEL[t.recurrence],
        'زمان انجام': t.doneAt ? formatDateTime(t.doneAt) : '',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'گزارش');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const path = `${FileSystem.documentDirectory}armec_report_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(path, wbout, { encoding: FileSystem.EncodingType.Base64 });
      Alert.alert('آماده شد', `فایل اکسل ذخیره شد:\n${path}`);
    } catch (e) {
      Alert.alert('خطا', String(e.message || e));
    } finally { setBusy(false); }
  }

  async function exportData() {
    setBusy(true);
    try {
      const data = await exportAll();
      const path = `${FileSystem.documentDirectory}armec_backup_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(data), { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('بکاپ', `فایل بکاپ ذخیره شد:\n${path}`);
    } catch (e) { Alert.alert('خطا', String(e.message || e)); } finally { setBusy(false); }
  }

  async function importData() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
      if (res.canceled || !res.assets || !res.assets.length) return;
      const content = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      await importAll(JSON.parse(content));
      await refresh();
      Alert.alert('موفق', 'داده‌ها بازیابی شدند.');
    } catch (e) {
      if (e && e.message && e.message.includes('cancel')) return;
      Alert.alert('خطا', 'فایل معتبر نیست.');
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const activeCount = tasks.length - doneCount;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statRow}>
        <View style={[styles.stat, { backgroundColor: theme.pastel.green }]}>
          <Text style={styles.statNum}>{doneCount}</Text><Text style={styles.statLbl}>انجام‌شده</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: theme.pastel.peach }]}>
          <Text style={styles.statNum}>{activeCount}</Text><Text style={styles.statLbl}>فعال</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: theme.pastel.blue }]}>
          <Text style={styles.statNum}>{tasks.length}</Text><Text style={styles.statLbl}>کل</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>انجام‌شده‌ها (به تفکیک دسته)</Text>
      {categories.map((c) => {
        const list = tasks.filter((t) => t.done && t.categoryId === c.id);
        if (list.length === 0) return null;
        return (
          <View key={c.id} style={styles.catBlock}>
            <View style={styles.catHead}><View style={[styles.swatch, { backgroundColor: c.color }]} /><Text style={styles.catName}>{c.name} ({list.length})</Text></View>
            {list.map((t) => (
              <View key={t.id} style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={styles.doneTitle}>{t.title}</Text>
                <Text style={styles.doneTime}>{t.doneAt ? formatDateTime(t.doneAt) : ''}</Text>
              </View>
            ))}
          </View>
        );
      })}

      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primaryDark }]} onPress={exportExcel} disabled={busy}>
        <Ionicons name="download-outline" size={20} color="#fff" /><Text style={styles.actionText}>خروجی اکسل (انجام‌شده‌ها)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.pastel.purple }]} onPress={exportData} disabled={busy}>
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" /><Text style={styles.actionText}>خروجی بکاپ (JSON)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.pastel.mint }]} onPress={importData} disabled={busy}>
        <Ionicons name="cloud-download-outline" size={20} color="#fff" /><Text style={styles.actionText}>وارد کردن بکاپ (JSON)</Text>
      </TouchableOpacity>

      {busy ? <ActivityIndicator style={{ marginTop: 16 }} color={theme.primaryDark} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: { flex: 1, marginHorizontal: 4, borderRadius: 16, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '800', color: theme.text },
  statLbl: { fontSize: 12, color: theme.textLight },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 10 },
  catBlock: { backgroundColor: theme.surface, borderRadius: 14, padding: 12, marginBottom: 10 },
  catHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  swatch: { width: 16, height: 16, borderRadius: 4, marginRight: 8 },
  catName: { fontSize: 15, fontWeight: '700', color: theme.text },
  doneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  doneTitle: { fontSize: 14, color: theme.text, flex: 1, marginLeft: 8 },
  doneTime: { fontSize: 11, color: theme.textLight },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, marginBottom: 10 },
  actionText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 15 },
});
