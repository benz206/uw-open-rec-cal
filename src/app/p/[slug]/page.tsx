import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    description: `Drop-in times for UW ${program?.name}, with a calendar feed for Apple Calendar, Google Calendar and Outlook.`,
  };
}

export default async function ProgramPage({ params }: PageProps<"/p/[slug]">) {
  const program = getProgram((await params).slug);
  if (!program) notFound();
  const locations = locationsOf(program);

  return (
    <div className="pt-8 sm:pt-12">
      <Link href="/" className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
        All programs
      </Link>
      <h1 className="wide mt-4 text-[2.5rem] leading-[0.95] font-extrabold tracking-tight text-balance sm:text-6xl">
        {program.name}
      </h1>
      {locations.length > 0 && (
        <p className="mt-4 max-w-2xl text-muted">
          Drop-in at {new Intl.ListFormat("en", { type: "conjunction" }).format(locations)}.
        </p>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16">
        <aside className="grid gap-8 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
          <section aria-labelledby="add-heading" className="grid gap-3">
            <h2 id="add-heading" className="text-lg font-bold">
              Add to your calendar
            </h2>
            <Subscribe slug={program.slug} name={program.name} />
            <p className="text-sm text-pretty text-muted">
              Subscribing keeps your calendar in step with this schedule, including time changes and cancellations.
            </p>
          </section>
          {program.description && (
            <details className="border-t border-rule pt-4">
              <summary className="cursor-pointer font-semibold">About this program</summary>
              <p className="mt-3 text-sm whitespace-pre-line text-muted">{program.description}</p>
            </details>
          )}
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-t border-rule pt-4 text-sm font-semibold underline underline-offset-2"
          >
            Official page on warrior.uwaterloo.ca
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </aside>
        <SessionList
          sessions={upcoming(program)}
          semesters={program.semesters}
          fallbackNow={builtAt}
          showLocation={locations.length > 1}
        />
      </div>
    </div>
  );
}
