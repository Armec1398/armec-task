import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'armec_tasks';
const CATEGORIES_KEY = 'armec_categories';
const SETTINGS_KEY = 'armec_settings';

export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const PRIORITY_LABEL = {
  high: 'زیاد',
  medium: 'متوسط',
  low: 'کم',
};

export const PRIORITY_COLOR = {
  high: '#FF8FA3',
  medium: '#FFD6A5',
  low: '#B5EAD7',
};

export const RECURRENCE = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM_DAYS: 'custom_days',
};

export const RECURRENCE_LABEL = {
  none: 'بدون تکرار',
  daily: 'هر روز',
  weekly: 'هر هفته',
  custom_days: 'هر چند روز',
};

export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function loadTasks() {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveTasks(tasks) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadCategories() {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    { id: 'cat_default', name: 'عمومی', color: '#A0C4FF' },
    { id: 'cat_work', name: 'کاری', color: '#FFADAD' },
    { id: 'cat_study', name: 'درسی', color: '#CAFFBF' },
  ];
  await saveCategories(defaults);
  return defaults;
}

export async function saveCategories(categories) {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { snoozeMinutes: 10 };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function exportAll() {
  const tasks = await loadTasks();
  const categories = await loadCategories();
  const settings = await loadSettings();
  return { version: 1, exportedAt: new Date().toISOString(), tasks, categories, settings };
}

export async function importAll(data) {
  if (!data || !Array.isArray(data.tasks)) throw new Error('فرمت فایل نامعتبر است');
  await saveTasks(data.tasks);
  if (Array.isArray(data.categories)) await saveCategories(data.categories);
  if (data.settings) await saveSettings(data.settings);
}
