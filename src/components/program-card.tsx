import Link from "next/link";
import { formatRange, formatTime, isLive, isOver, pendingNote, relativeDay } from "@/lib/format";
import type { Program } from "@/lib/types";
import { AddToCalendar } from "./subscribe";

export function ProgramCard({ program, locations, now }: { program: Program; locations: string[]; now: string }) {
  const today = now.slice(0, 10);
  const next = program.sessions.find((s) => s.status !== "cancelled" && !isOver(s, now));
  const live = next && isLive(next, now);

  return (
    <article className="flex flex-col rounded-xl border border-line bg-card p-5 transition-colors hover:border-line-strong">
      <h3 className="font-semibold">
        <Link href={`/p/${program.slug}/`} className="underline-offset-4 hover:underline">
          {program.name}
        </Link>
      </h3>
      {locations.length > 0 && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{locations.join(", ")}</p>}

      <div className="mt-5 flex-1 text-sm">
        {next ? (
          <>
            <p className="flex items-center gap-1.5 text-muted">
              {live && <span aria-hidden className="size-2 rounded-full bg-green" />}
              {live ? "Open now" : "Next session"}
            </p>
            <p className="mt-0.5 font-medium tabular-nums">
              {live ? `Until ${formatTime(next.end)}` : `${relativeDay(next.date, today)}, ${formatRange(next.start, next.end)}`}
            </p>
            {next.status === "changed" && <p className="mt-0.5 text-amber">Time changed from the usual schedule</p>}
          </>
        ) : (
          <p className="text-muted">{pendingNote(program.semesters) ?? "No upcoming sessions"}</p>
        )}
      </div>

      <div className="mt-5">
        <AddToCalendar slug={program.slug} name={program.name} />
      </div>
    </article>
  );
}
