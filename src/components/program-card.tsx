import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { addDays, formatDate, formatRange, formatTime, isLive, isOver, pendingNote, relativeDay } from "@/lib/format";
import type { Program } from "@/lib/types";
import { ProgramIcon } from "./program-icon";
import { Subscribe } from "./subscribe";

export function ProgramCard({ program, locations, now }: { program: Program; locations: string[]; now: string }) {
  const today = now.slice(0, 10);
  const open = program.sessions.filter((s) => s.status !== "cancelled" && !isOver(s, now));
  const next = open[0];
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return { date, count: open.filter((s) => s.date === date).length };
  });

  return (
    <article className="group relative flex flex-col gap-5 rounded-3xl border border-line bg-surface/80 p-5 backdrop-blur-sm transition-[border-color,transform,box-shadow] duration-300 hover:border-volt-text/30 hover:shadow-[0_20px_50px_-30px_var(--volt)] motion-safe:hover:-translate-y-0.5">
      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-volt/12 text-volt-text ring-1 ring-volt-text/20">
          <ProgramIcon name={program.name} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight font-semibold text-balance">
            <Link
              href={`/p/${program.slug}/`}
              className="rounded-sm after:absolute after:inset-x-0 after:top-0 after:h-24 after:rounded-t-3xl hover:text-volt-text"
            >
              {program.name}
            </Link>
          </h3>
          {locations.length > 0 && (
            <p className="mt-1 flex items-start gap-1 text-sm text-muted">
              <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">{locations.join(" · ")}</span>
            </p>
          )}
        </div>
        <ArrowUpRight
          aria-hidden
          className="size-5 shrink-0 text-muted transition-transform group-hover:text-volt-text motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        />
      </header>

      <div className="rounded-2xl bg-surface-2/70 px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Next up</p>
        {next ? (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-medium tabular-nums">
            {isLive(next, now) ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-volt-text">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 rounded-full bg-volt motion-safe:animate-ping" />
                    <span className="relative size-2 rounded-full bg-volt" />
                  </span>
                  Happening now
                </span>
                <span className="text-muted">until {formatTime(next.end)}</span>
              </>
            ) : (
              <>
                <span>{relativeDay(next.date, today)}</span>
                <span className="text-muted">{formatRange(next.start, next.end)}</span>
              </>
            )}
            {next.status === "changed" && <span className="text-xs text-amber">Time changed</span>}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">{pendingNote(program.semesters) ?? "No upcoming sessions"}</p>
        )}
      </div>

      <ol aria-label="Next 7 days" className="grid grid-cols-7 gap-1.5 text-center">
        {week.map(({ date, count }, i) => (
          <li
            key={date}
            aria-label={`${formatDate(date, { weekday: "long", month: "short", day: "numeric" })}: ${count || "no"} session${count === 1 ? "" : "s"}`}
            className="flex flex-col items-center gap-1"
          >
            <span aria-hidden className={`text-[11px] ${i === 0 ? "font-semibold text-fg" : "text-muted"}`}>
              {formatDate(date, { weekday: "short" })}
            </span>
            <span
              aria-hidden
              className={`grid h-7 w-full place-items-center rounded-lg text-xs font-semibold tabular-nums ${
                count ? "bg-volt text-on-volt" : "bg-surface-2/70 text-muted/60"
              } ${i === 0 ? "ring-2 ring-fg/70 ring-offset-2 ring-offset-surface" : ""}`}
            >
              {count || "·"}
            </span>
          </li>
        ))}
      </ol>

      <div className="relative mt-auto">
        <Subscribe slug={program.slug} name={program.name} />
      </div>
    </article>
  );
}
