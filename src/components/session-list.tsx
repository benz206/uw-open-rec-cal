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
  showLocation,
}: {
  sessions: Session[];
  semesters: Semester[];
  fallbackNow: string;
  showLocation: boolean;
}) {
  const now = useTorontoNow(fallbackNow);
  const today = now.slice(0, 10);
  const visible = sessions.filter((s) => !isOver(s, now));
  const pending = pendingNote(semesters);

  return (
    <section aria-labelledby="schedule-heading">
      <h2 id="schedule-heading" className="text-lg font-bold">
        Schedule
      </h2>

      {visible.length === 0 ? (
        <p className="mt-3 max-w-md text-muted">
          {pending ? `${pending}.` : "No upcoming sessions."} Subscribe now and new sessions will appear in your
          calendar once they are posted.
        </p>
      ) : (
        <table className="w-full text-left tabular-nums">
          {groupBy(visible, (s) => weekStart(s.date)).map(([week, items]) => (
            <tbody key={week}>
              <tr>
                <th
                  colSpan={showLocation ? 3 : 2}
                  scope="colgroup"
                  className="border-b border-rule pt-8 pb-2 text-sm font-semibold text-muted"
                >
                  {weekLabel(week, today)}
                </th>
              </tr>
              {items.map((s, i) => {
                const firstOfDay = i === 0 || items[i - 1].date !== s.date;
                const isToday = s.date === today;
                const cancelled = s.status === "cancelled";
                return (
                  <tr key={s.id} className={`${firstOfDay ? "border-t border-faint" : ""} ${isToday ? "bg-court-soft" : ""}`}>
                    <th scope="row" className="w-28 py-2.5 pl-2 align-top font-normal sm:w-36">
                      <span className={firstOfDay ? (isToday ? "font-semibold" : "") : "sr-only"}>
                        {isToday ? "Today" : formatDate(s.date, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </th>
                    <td className="py-2.5 pr-2 align-top">
                      <span className={cancelled ? "text-muted line-through decoration-red" : "font-medium"}>
                        {formatRange(s.start, s.end)}
                      </span>
                      {cancelled && <span className="block text-sm text-red sm:ml-3 sm:inline">Cancelled</span>}
                      {s.status === "changed" && (
                        <span className="block text-sm text-muted sm:ml-3 sm:inline">Moved from usual time</span>
                      )}
                      {!cancelled && isLive(s, now) && (
                        <span className="block text-sm font-semibold text-court sm:ml-3 sm:inline">On now</span>
                      )}
                    </td>
                    {showLocation && <td className="py-2.5 pr-2 align-top text-muted">{s.location}</td>}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      )}

      {visible.length > 0 && pending && (
        <p className="mt-6 text-sm text-muted">{pending}. Subscribed calendars will get it automatically.</p>
      )}
    </section>
  );
}
