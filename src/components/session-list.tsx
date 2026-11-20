"use client";

import { addDays, formatDate, formatRange, groupBy, isLive, isOver, pendingNote, weekStart } from "@/lib/format";
import type { Semester, Session } from "@/lib/types";
import { useTorontoNow } from "@/lib/use-now";

function weekLabel(start: string, today: string) {
  const thisWeek = weekStart(today);
  if (start === thisWeek) return "This week";
  if (start === addDays(thisWeek, 7)) return "Next week";
  return `Week of ${formatDate(start, { month: "long", day: "numeric" })}`;
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
    <section aria-labelledby="sessions-heading" className="grid gap-6">
      <h2 id="sessions-heading" className="text-lg font-semibold">
        Upcoming sessions
      </h2>

      {visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
          <p className="font-medium">{pending ?? "No upcoming sessions"}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Subscribe now and new sessions will show up in your calendar once they’re posted.
          </p>
        </div>
      )}

      {groupBy(visible, (s) => weekStart(s.date)).map(([week, items]) => (
        <section key={week} aria-label={weekLabel(week, today)} className="grid gap-2">
          <h3 className="text-sm font-medium text-muted">{weekLabel(week, today)}</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
            {groupBy(items, (s) => s.date).map(([date, day]) => (
              <li key={date} className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <p className={`text-sm ${date === today ? "font-semibold text-accent" : "text-muted"}`}>
                  {date === today ? "Today" : formatDate(date, { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <ul className="grid gap-1.5">
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
        <p className="text-sm text-muted">{pending}. It will show up in your calendar automatically once posted.</p>
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
        className={`text-sm font-medium tabular-nums ${cancelled ? "text-muted line-through" : ""}`}
      >
        {formatRange(session.start, session.end)}
      </time>
      <span className={`text-sm text-muted ${cancelled ? "line-through" : ""}`}>{session.location}</span>
      {live && !cancelled && <Badge className="bg-green/10 text-green">Open now</Badge>}
      {session.status === "changed" && <Badge className="bg-amber/10 text-amber">Time changed</Badge>}
      {cancelled && <Badge className="bg-red/10 text-red">Cancelled</Badge>}
    </li>
  );
}

function Badge({ className, children }: { className: string; children: string }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}
