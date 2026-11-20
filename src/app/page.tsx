import { ProgramGrid } from "@/components/program-grid";
import { builtAt, locationsOf, schedule, upcoming } from "@/lib/schedule";

export default function Home() {
  const items = schedule.programs.map((program) => ({
    program: { ...program, description: "", sessions: upcoming(program, 21) },
    locations: locationsOf(program),
  }));

  return (
    <>
      <section className="relative isolate py-16 sm:py-24">
        <div aria-hidden className="court-lines absolute inset-x-[-50vw] top-0 -z-10 h-full" />
        <p className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
          <span className="size-1.5 rounded-full bg-volt" />
          Unofficial · Auto-updating · Free
        </p>
        <h1 className="rise mt-6 max-w-3xl font-display text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl [animation-delay:60ms]">
          UW Open Rec, <span className="bg-linear-to-r from-volt-text to-ice bg-clip-text text-transparent">live in your calendar.</span>
        </h1>
        <p className="rise mt-6 max-w-xl text-lg text-pretty text-muted [animation-delay:120ms]">
          Skate, swim, shoot hoops or hit the gym. Subscribe to any drop-in program once — new times, changes and
          cancellations sync to Apple, Google or Outlook on their own.
        </p>
      </section>

      <ProgramGrid items={items} fallbackNow={builtAt} />
    </>
  );
}
