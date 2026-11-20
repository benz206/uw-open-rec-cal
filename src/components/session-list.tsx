"use client";

import { CalendarClock } from "lucide-react";
import { addDays, formatDate, formatRange, groupBy, isLive, isOver, pendingNote, weekStart } from "@/lib/format";
import type { Semester, Session } from "@/lib/types";
import { useTorontoNow } from "@/lib/use-now";

function weekLabel(start: string, today: string) {
  const thisWeek = weekStart(today);
  if (start === thisWeek) return "This week";
  if (start === addDays(thisWeek, 7)) return "Next week";
  return `Week of ${formatDate(start, { month: "short", day: "numeric" })}`;
}

export function SessionList({
  sessions,
  semesters,
  fallbackNow,
}: {
  sessions: Session[];
  semesters: Semester[];
  fallbackNow: string;
}) {
  const now = useTorontoNow(fallbackNow);
  const today = now.slice(0, 10);
  const visible = sessions.filter((s) => !isOver(s, now));
  const pending = pendingNote(semesters);

  return (
    <section aria-labelledby="sessions-heading" className="grid gap-8">
      <h2 id="sessions-heading" className="font-display text-2xl font-semibold tracking-tight">
        Upcoming sessions
      </h2>

      {visible.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
          <CalendarClock aria-hidden className="size-8 text-muted" />
          <p className="font-medium">{pending ?? "No upcoming sessions"}</p>
          <p className="max-w-sm text-sm text-muted">
            Subscribe now and new sessions will appear in your calendar automatically once they’re posted.
          </p>
        </div>
      )}

      {groupBy(visible, (s) => weekStart(s.date)).map(([week, items]) => (
        <section key={week} aria-label={weekLabel(week, today)} className="grid gap-3">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h3 className="text-sm font-semibold tracking-[0.14em] uppercase">{weekLabel(week, today)}</h3>
            <p className="text-xs text-muted">{[...new Set(items.map((s) => s.semester))].join(" · ")}</p>
          </div>
          <ul className="grid gap-2">
            {groupBy(items, (s) => s.date).map(([date, day]) => (
              <li
                key={date}
                className={`grid grid-cols-[3.5rem_1fr] gap-3 rounded-2xl border p-3 sm:grid-cols-[4.5rem_1fr] sm:p-4 ${
                  date === today ? "border-volt-text/40 bg-volt/8" : "border-line bg-surface/70"
                }`}
              >
                <p className="flex flex-col items-center justify-center leading-none">
                  <span className={`text-xs font-semibold uppercase ${date === today ? "text-volt-text" : "text-muted"}`}>
                    {date === today ? "Today" : formatDate(date, { weekday: "short" })}
                  </span>
                  <span className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {formatDate(date, { day: "numeric" })}
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted">{formatDate(date, { month: "short" })}</span>
                </p>
                <ul className="grid content-center gap-1.5">
                  {day.map((s) => (
                    <SessionRow key={s.id} session={s} live={isLive(s, now)} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {visible.length > 0 && pending && (
        <p className="text-sm text-muted">{pending} — it’ll show up in your calendar automatically once posted.</p>
      )}
    </section>
  );
}

function SessionRow({ session, live }: { session: Session; live: boolean }) {
  const cancelled = session.status === "cancelled";
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <time
        dateTime={`${session.date}T${session.start}`}
        className={`font-medium tabular-nums ${cancelled ? "text-muted line-through decoration-coral/70" : ""}`}
      >
        {formatRange(session.start, session.end)}
      </time>
      <span className={`text-sm text-muted ${cancelled ? "line-through" : ""}`}>{session.location}</span>
      {live && !cancelled && <Badge className="bg-volt text-on-volt">Now</Badge>}
      {session.status === "changed" && <Badge className="bg-amber/15 text-amber ring-1 ring-amber/30">Changed</Badge>}
      {cancelled && <Badge className="bg-coral/15 text-coral ring-1 ring-coral/30">Cancelled</Badge>}
    </li>
  );
}

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${className}`}>
      {children}
    </span>
  );
}
