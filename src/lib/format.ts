import type { Semester, Session } from "./types";

const stampFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function torontoStamp(at: Date) {
  const p = Object.fromEntries(stampFormat.formatToParts(at).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

export function isOver(s: Session, now: string) {
  const endDate = s.end <= s.start ? addDays(s.date, 1) : s.date;
  return `${endDate} ${s.end}` <= now;
}

export function isLive(s: Session, now: string) {
  return `${s.date} ${s.start}` <= now && !isOver(s, now);
}

function utc(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

export function addDays(date: string, days: number) {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekStart(date: string) {
  return addDays(date, -((utc(date).getUTCDay() + 6) % 7));
}

export function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return utc(date).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
}

export function relativeDay(date: string, today: string) {
  const diff = (utc(date).getTime() - utc(today).getTime()) / 86_400_000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return formatDate(date, { weekday: "long" });
  return formatDate(date, { weekday: "short", month: "short", day: "numeric" });
}

function clock(time: string) {
  const [h, m] = time.split(":").map(Number);
  return { text: `${h % 12 || 12}:${String(m).padStart(2, "0")}`, meridiem: h < 12 ? "AM" : "PM" };
}

export function formatTime(time: string) {
  const t = clock(time);
  return `${t.text} ${t.meridiem}`;
}

export function formatRange(start: string, end: string) {
  const a = clock(start);
  const b = clock(end);
  return a.meridiem === b.meridiem
    ? `${a.text}–${b.text} ${b.meridiem}`
    : `${a.text} ${a.meridiem}–${b.text} ${b.meridiem}`;
}

export function pendingNote(semesters: Semester[]) {
  const names = semesters.filter((s) => !s.hasOfferings).map((s) => s.name);
  return names.length ? `${names.join(" & ")} schedule not published yet` : null;
}

export function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return [...groups];
}
