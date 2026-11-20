import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { ProgramIcon } from "@/components/program-icon";
import { SessionList } from "@/components/session-list";
import { Subscribe } from "@/components/subscribe";
import { builtAt, getProgram, locationsOf, schedule, upcoming } from "@/lib/schedule";

export const dynamicParams = false;

export function generateStaticParams() {
  return schedule.programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const program = getProgram((await params).slug);
  return {
    title: program?.name,
    description: `Subscribe to the UW ${program?.name} drop-in schedule in Apple Calendar, Google Calendar or Outlook.`,
  };
}

export default async function ProgramPage({ params }: PageProps<"/p/[slug]">) {
  const program = getProgram((await params).slug);
  if (!program) notFound();
  const locations = locationsOf(program);

  return (
    <div className="pt-10 sm:pt-14">
      <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" />
        All programs
      </Link>

      <header className="rise mt-8 grid gap-5">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-volt/12 text-volt-text ring-1 ring-volt-text/20">
            <ProgramIcon name={program.name} className="size-7" />
          </span>
          <h1 className="min-w-0 font-display text-4xl leading-none font-semibold tracking-[-0.03em] text-balance break-words sm:text-5xl">
            {program.name}
          </h1>
        </div>
        <ul aria-label="Semesters" className="flex flex-wrap gap-2">
          {program.semesters.map((s) => (
            <li
              key={s.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                s.hasOfferings ? "bg-surface-2 text-fg ring-1 ring-line" : "border border-dashed border-line text-muted"
              }`}
            >
              {s.name}
              {!s.hasOfferings && " · not published yet"}
            </li>
          ))}
        </ul>
        {program.description && <p className="max-w-2xl whitespace-pre-line text-pretty text-muted">{program.description}</p>}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {locations.length > 0 && (
            <p className="flex items-start gap-1.5 text-muted">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              {locations.join(" · ")}
            </p>
          )}
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm font-medium text-volt-text underline-offset-4 hover:underline"
          >
            Official program page
            <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <aside
          aria-labelledby="subscribe-heading"
          className="rise grid gap-4 rounded-3xl border border-line bg-surface/80 p-5 backdrop-blur-sm lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 [animation-delay:80ms]"
        >
          <h2 id="subscribe-heading" className="font-display text-lg font-semibold">
            Subscribe
          </h2>
          <Subscribe slug={program.slug} name={program.name} />
          <p className="text-xs leading-relaxed text-muted">
            Your calendar stays in sync as the schedule changes. Google Calendar can take up to ~24h to pick up updates.
          </p>
        </aside>
        <SessionList sessions={upcoming(program)} semesters={program.semesters} fallbackNow={builtAt} />
      </div>
    </div>
  );
}
