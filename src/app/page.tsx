import { DayBoard } from "@/components/day-board";
import { builtAt, hourRange, schedule, upcoming } from "@/lib/schedule";

export default function Home() {
  const programs = schedule.programs
    .map((p) => ({ ...p, name: p.name.replace(/^Open Rec /, ""), description: "", sessions: upcoming(p, 8) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <DayBoard programs={programs} fallbackNow={builtAt} hours={hourRange()} />;
}
