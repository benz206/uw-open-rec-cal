import raw from "@/data/schedule.json";
import { addDays, span, torontoStamp } from "./format";
import type { Program, ScheduleData } from "./types";

export const schedule = raw as ScheduleData;

export const builtAt = torontoStamp(new Date(schedule.generatedAt));

export function getProgram(slug: string) {
  return schedule.programs.find((p) => p.slug === slug);
}

export function locationsOf(program: Program) {
  return [...new Set(program.sessions.map((s) => s.location).filter(Boolean))];
}

export function hourRange(): [number, number] {
  const spans = schedule.programs.flatMap((p) => p.sessions.map(span));
  return [Math.floor(Math.min(...spans.map((s) => s[0]))), Math.ceil(Math.max(...spans.map((s) => s[1])))];
}

export function upcoming(program: Program, days?: number) {
  const from = builtAt.slice(0, 10);
  const future = program.sessions
    .filter((s) => s.date >= addDays(from, -1))
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  if (!days) return future;
  const limit = addDays(from, days);
  return future.filter((s, i) => i === 0 || s.date < limit);
}
