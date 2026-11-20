"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { addDays, formatDate, formatRange, formatTime, hoursOf, isLive, isOver, pendingNote, span } from "@/lib/format";
import type { Program, Session } from "@/lib/types";
import { useTorontoNow } from "@/lib/use-now";

const columns = "md:grid-cols-[15rem_1fr]";

function hourLabel(h: number) {
  const hour = h % 24;
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

function summarize(program: Program, day: Session[], now: string, isToday: boolean) {
  const live = isToday ? day.find((s) => s.status !== "cancelled" && isLive(s, now)) : undefined;
  if (live) return { text: `Open now until ${formatTime(live.end)}`, tone: "font-medium text-court" };
  const open = day.filter((s) => s.status !== "cancelled" && !(isToday && isOver(s, now)));
  const ranges = [...new Set(open.map((s) => formatRange(s.start, s.end)))];
  if (ranges.length > 2) return { text: `${ranges.slice(0, 2).join(", ")} and ${ranges.length - 2} more`, tone: "text-muted" };
  if (ranges.length) return { text: ranges.join(", "), tone: "text-muted" };
  if (day.some((s) => s.status !== "cancelled")) return { text: "Done for today", tone: "text-muted" };
  if (day.length) return { text: "Cancelled", tone: "text-red" };
  if (program.sessions.some((s) => !isOver(s, now))) return { text: "No sessions", tone: "text-muted" };
  return { text: pendingNote(program.semesters) ?? "No sessions posted", tone: "text-muted" };
}

export function DayBoard({
  programs,
  fallbackNow,
  hours: [first, last],
}: {
  programs: Program[];
  fallbackNow: string;
  hours: [number, number];
}) {
  const now = useTorontoNow(fallbackNow);
  const today = now.slice(0, 10);
  const [offset, setOffset] = useState(0);
  const date = addDays(today, offset);
  const frac = (h: number) => (Math.min(Math.max(h, first), last) - first) / (last - first);
  const nowHours = hoursOf(now.slice(11));
  const showNow = offset === 0 && nowHours >= first && nowHours <= last;
  const ticks = Array.from({ length: Math.ceil((last - first) / 3) }, (_, i) => first + i * 3);

  return (
    <section aria-labelledby="day-heading" className="pt-10 sm:pt-16">
      <h1 id="day-heading" className="wide text-[2.5rem] leading-[0.95] font-extrabold tracking-tight sm:text-6xl">
        {formatDate(date, { weekday: "long", month: "long", day: "numeric" })}
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-muted">
        Drop-in times for all {programs.length} UW Open Rec programs. Pick a program to see its full schedule and add
        it to your calendar.
      </p>

      <div role="group" aria-label="Choose a day" className="mt-8 grid grid-cols-7 gap-1 sm:flex sm:gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(today, i);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={i === offset}
              onClick={() => setOffset(i)}
              className={`flex flex-col items-center rounded-md border py-1.5 sm:w-16 ${
                i === offset ? "border-ink bg-ink text-page" : "border-rule hover:border-ink"
              }`}
            >
              <span className="text-xs">{i === 0 ? "Today" : formatDate(d, { weekday: "short" })}</span>
              <span className="text-lg font-bold tabular-nums">{formatDate(d, { day: "numeric" })}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <div aria-hidden className={`grid gap-x-6 border-b border-rule pb-2 ${columns}`}>
          <span className="hidden md:block" />
          <span className="relative h-9 text-xs text-muted tabular-nums">
            {showNow && (
              <span
                className="absolute top-0 -translate-x-1/2 font-semibold whitespace-nowrap text-red"
                style={{ left: `${frac(nowHours) * 100}%` }}
              >
                {formatTime(now.slice(11))}
              </span>
            )}
            {ticks.map((h, i) => (
              <span
                key={h}
                className={`absolute bottom-0 whitespace-nowrap ${i ? "-translate-x-1/2" : ""}`}
                style={{ left: `${frac(h) * 100}%` }}
              >
                {hourLabel(h)}
              </span>
            ))}
          </span>
        </div>

        <ul className="divide-y divide-faint">
          {programs.map((program) => {
            const day = program.sessions
              .filter((s) => s.date === date)
              .sort((a, b) => Number(isOver(b, now)) - Number(isOver(a, now)));
            const summary = summarize(program, day, now, offset === 0);
            return (
              <li key={program.slug}>
                <Link href={`/p/${program.slug}/`} className={`group grid gap-x-6 gap-y-2 py-3 md:items-center ${columns}`}>
                  <span className="min-w-0">
                    <span className="block font-semibold underline-offset-2 group-hover:underline">{program.name}</span>
                    <span className={`block text-sm tabular-nums ${summary.tone}`}>{summary.text}</span>
                  </span>
                  <span
                    aria-hidden
                    className="track relative h-7 rounded-sm"
                    style={{ "--hours": last - first } as CSSProperties}
                  >
                    {day.map((s) => {
                      const [start, end] = span(s);
                      const done = offset === 0 && isOver(s, now);
                      return (
                        <span
                          key={s.id}
                          className={`absolute inset-y-1 rounded-[2px] ${
                            s.status === "cancelled" ? "border border-dashed border-red" : done ? "bg-rule" : "bg-court"
                          }`}
                          style={{ left: `${frac(start) * 100}%`, width: `${(frac(end) - frac(start)) * 100}%` }}
                        />
                      );
                    })}
                    {showNow && (
                      <span
                        className="absolute -top-1.5 -bottom-3 -ml-px w-0.5 bg-red md:-top-3"
                        style={{ left: `${frac(nowHours) * 100}%` }}
                      />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
