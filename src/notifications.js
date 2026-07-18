import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-notifications';
import { loadTasks, loadSettings, RECURRENCE } from './storage';
import { addDays } from './calendar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { sound: true, alert: true, badge: true },
    android: { sound: true, alert: true, badge: true },
  });
  return status;
}

function getNextOccurrence(task, from = new Date()) {
  if (task.recurrence === RECURRENCE.DAILY) {
    let d = new Date(task.deadline);
    while (d.getTime() <= from.getTime()) d = addDays(d, 1);
    return d;
  }
  if (task.recurrence === RECURRENCE.WEEKLY) {
    let d = new Date(task.deadline);
    while (d.getTime() <= from.getTime()) d = addDays(d, 7);
    return d;
  }
  if (task.recurrence === RECURRENCE.CUSTOM_DAYS) {
    const step = task.recurrenceDays || 1;
    let d = new Date(task.deadline);
    while (d.getTime() <= from.getTime()) d = addDays(d, step);
    return d;
  }
  return new Date(task.deadline);
}

export async function scheduleAllAlarms() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const tasks = await loadTasks();
  const settings = await loadSettings();
  const snooze = settings.snoozeMinutes || 10;
  const active = tasks.filter((t) => !t.done);
  for (const task of active) {
    const occ = getNextOccurrence(task);
    if (occ.getTime() <= Date.now()) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ددلاین تسک: ' + task.title,
          body: `موضوع: ${task.title}\n${task.note ? 'توضیح: ' + task.note + '\n' : ''}ددلاین رسید! (اسنوز ${snooze} دقیقه)`,
          sound: true,
          data: { taskId: task.id, snooze },
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: { date: occ },
      });
    } catch (e) {}
  }
}

export async function scheduleSnooze(taskId, minutes) {
  const tasks = await loadTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  const fireAt = new Date(Date.now() + minutes * 60000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ یادآوری (اسنوز): ' + task.title,
      body: `ددلاین تسک «${task.title}» رسید. لطفا انجامش بده!`,
      sound: true,
      data: { taskId, snooze: minutes },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: { date: fireAt },
  });
}

export function getNextUpcomingTask() {
  return loadTasks().then((tasks) => {
    const active = tasks
      .filter((t) => !t.done)
      .map((t) => ({ ...t, occ: getNextOccurrence(t) }))
      .filter((t) => t.occ.getTime() > Date.now())
      .sort((a, b) => a.occ - b.occ);
    return active[0] || null;
  });
}

export async function notifyDone(task) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ انجام شد',
      body: `تسک «${task.title}» علامت زده شد.`,
    },
    trigger: null,
  });
}
