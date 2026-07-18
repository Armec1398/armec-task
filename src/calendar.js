import jalaliMoment from 'jalali-moment';

jalaliMoment.locale('fa', {
  weekdays: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'],
});
jalaliMoment.updateLocale('fa', { weekdaysShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جم', 'شن'] });

export function toJalali(date) {
  const m = jalaliMoment(date);
  return {
    year: m.jYear(),
    month: m.jMonth() + 1,
    day: m.jDate(),
    str: m.format('jYYYY/jMM/jDD'),
    weekday: m.format('dddd'),
  };
}

export function jalaliNow() {
  return toJalali(new Date());
}

export const WEEKDAY_LABELS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export function startOfMonthGrid(year, month) {
  const first = jalaliMoment(`${year}/${month}/1`, 'jYYYY/jM/jD');
  const weekday = (first.day() + 1) % 7;
  const cells = [];
  const totalDays = first.daysInMonth();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevTotal = jalaliMoment(`${prevYear}/${prevMonth}/1`, 'jYYYY/jM/jD').daysInMonth();
  for (let i = weekday - 1; i >= 0; i--) {
    cells.push({ day: prevTotal - i, month: prevMonth, year: prevYear, other: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, month, year, other: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const nd = last.day + 1;
    const nm = last.month;
    const ny = last.year;
    cells.push({ day: nd, month: nm, year: ny, other: true });
  }
  return cells;
}

export function formatTime(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateTime(date) {
  const d = new Date(date);
  const j = toJalali(d);
  return `${j.str} - ${formatTime(d)}`;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function timeLeft(deadline) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'گذشته';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ساعت و ${mins % 60} دقیقه`;
  const days = Math.floor(hours / 24);
  return `${days} روز و ${hours % 24} ساعت`;
}
