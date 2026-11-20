import { ProgramGrid } from "@/components/program-grid";
import { builtAt, locationsOf, schedule, upcoming } from "@/lib/schedule";

export default function Home() {
  const items = schedule.programs.map((program) => ({
    program: { ...program, description: "", sessions: upcoming(program, 21) },
    locations: locationsOf(program),
  }));

  return (
    <>
      <section className="py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          UW Open Rec in your calendar
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-muted sm:text-lg">
          Subscribe to any drop-in program, from skating to swimming. Your calendar stays up to date when times change
          or sessions are cancelled.
        </p>
      </section>

      <ProgramGrid items={items} fallbackNow={builtAt} />
    </>
  );
}
