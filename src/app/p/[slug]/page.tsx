import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
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
    <div className="pt-8 sm:pt-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" />
        All programs
      </Link>

      <header className="mt-6 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{program.name}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {locations.length > 0 && (
            <p className="flex items-start gap-1.5 text-muted">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              {locations.join(", ")}
            </p>
          )}
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline"
          >
            Official program page
            <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <ul aria-label="Semesters" className="flex flex-wrap gap-2">
          {program.semesters.map((s) => (
            <li
              key={s.id}
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                s.hasOfferings ? "border-line bg-card" : "border-dashed border-line text-muted"
              }`}
            >
              {s.hasOfferings ? s.name : `${s.name} (not posted yet)`}
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <aside
          aria-labelledby="subscribe-heading"
          className="grid gap-4 rounded-xl border border-line bg-card p-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1"
        >
          <h2 id="subscribe-heading" className="font-semibold">
            Add to your calendar
          </h2>
          <Subscribe slug={program.slug} name={program.name} />
          <p className="text-xs/relaxed text-muted">
            Your calendar stays in sync as the schedule changes. Google Calendar can take up to a day to pick up
            updates.
          </p>
        </aside>
        <div className="grid gap-10">
          {program.description && (
            <p className="max-w-2xl text-sm/relaxed whitespace-pre-line text-pretty text-muted">{program.description}</p>
          )}
          <SessionList sessions={upcoming(program)} semesters={program.semesters} fallbackNow={builtAt} />
        </div>
      </div>
    </div>
  );
}
