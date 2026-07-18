import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadCategories, saveCategories, createId } from '../storage';
import { theme } from '../theme';

const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#A0C4FF', '#BDB2FF', '#9BF6FF', '#FFC6FF'];

export default function CategoriesScreen() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editing, setEditing] = useState(null);

  useEffect(() => { refresh(); }, []);
  async function refresh() { setCats(await loadCategories()); }

  function openAdd() { setEditing(null); setName(''); setColor(COLORS[0]); setModal(true); }
  function openEdit(c) { setEditing(c); setName(c.name); setColor(c.color); setModal(true); }

  async function save() {
    if (!name.trim()) { Alert.alert('خطا', 'نام دسته را وارد کن'); return; }
    let updated;
    if (editing) {
      updated = cats.map((c) => c.id === editing.id ? { ...c, name, color } : c);
    } else {
      updated = [...cats, { id: createId(), name, color }];
    }
    setCats(updated); await saveCategories(updated);
    setModal(false);
  }

  async function remove(c) {
    Alert.alert('حذف', 'دسته حذف شود؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { const u = cats.filter((x) => x.id !== c.id); setCats(u); await saveCategories(u); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cats}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderLeftColor: item.color }]}>
            <View style={[styles.swatch, { backgroundColor: item.color }]} />
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity onPress={() => openEdit(item)}><Ionicons name="create-outline" size={20} color={theme.textLight} /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)}><Ionicons name="trash-outline" size={20} color={theme.danger} /></TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={openAdd}><Ionicons name="add" size={30} color="#fff" /></TouchableOpacity>

      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'ویرایش دسته' : 'دسته جدید'}</Text>
            <TextInput style={styles.input} placeholder="نام دسته" placeholderTextColor={theme.textLight} value={name} onChangeText={setName} />
            <Text style={styles.label}>رنگ</Text>
            <View style={styles.colors}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: theme.text }]} onPress={() => setColor(c)} />
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.danger }]} onPress={() => setModal(false)}><Text style={styles.btnText}>لغو</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primaryDark }]} onPress={save}><Text style={styles.btnText}>ذخیره</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  list: { padding: 14, paddingBottom: 100 },
  row: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5 },
  swatch: { width: 22, height: 22, borderRadius: 6, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '700', color: theme.text, flex: 1 },
  fab: { position: 'absolute', bottom: 24, left: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: theme.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modal: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 12 },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, marginBottom: 10, color: theme.text, borderWidth: 1, borderColor: theme.border },
  label: { fontSize: 13, color: theme.textLight, marginBottom: 6, marginTop: 4 },
  colors: { flexDirection: 'row', flexWrap: 'wrap' },
  colorDot: { width: 40, height: 40, borderRadius: 20, margin: 6 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { flex: 1, padding: 14, borderRadius: 14, marginHorizontal: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
