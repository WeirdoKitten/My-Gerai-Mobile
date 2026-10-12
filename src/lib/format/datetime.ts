// Ditulis manual, bukan Intl: hasil Intl di Hermes tidak dijamin sama dengan web. Selalu WIB (UTC+7).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function toWib(value: Date | string) {
  const date = new Date(new Date(value).getTime() + WIB_OFFSET_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
    time: `${pad(date.getUTCHours())}.${pad(date.getUTCMinutes())}`,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** "9 Sep 2026, 14.30" (WIB), sama dengan formatDateTime web. */
export function formatDateTime(value: Date | string): string {
  const d = toWib(value);
  return `${d.day} ${MONTHS[d.month]} ${d.year}, ${d.time}`;
}

/** "Sabtu, 3 Okt 2026, 10.00" (WIB), sama dengan formatSchedule web. */
export function formatSchedule(value: Date | string): string {
  const d = toWib(value);
  return `${DAYS[d.weekday]}, ${d.day} ${MONTHS[d.month]} ${d.year}, ${d.time}`;
}

/** "Baru saja", "12 menit lalu", "Hari ini 14.30", atau tanggal lengkap. */
export function formatSince(value: Date | string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const then = toWib(value);
  const today = toWib(now);
  if (then.year === today.year && then.month === today.month && then.day === today.day) {
    return `Hari ini ${then.time}`;
  }
  return formatDateTime(value);
}

const SHORT_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Kunci hari laporan "2026-10-07" (tanggal WIB dari server) menjadi "Rab 7/10", sama dengan web. */
export function formatDayKey(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return dayKey;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${SHORT_DAYS[weekday]} ${day}/${month}`;
}

/** Rating 4.5 menjadi "4,5" (koma desimal), sama dengan formatRating web. */
export function formatRating(average: number): string {
  return average.toFixed(1).replace(".", ",");
}

/** "9 Sep 2026" (WIB), tanpa jam. */
export function formatDate(value: Date | string): string {
  const d = toWib(value);
  return `${d.day} ${MONTHS[d.month]} ${d.year}`;
}
