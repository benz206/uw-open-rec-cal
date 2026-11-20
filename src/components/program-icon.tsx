import {
  Activity,
  CircleDot,
  Dumbbell,
  Feather,
  Goal,
  LandPlot,
  PersonStanding,
  Snowflake,
  Volleyball,
  WavesLadder,
  Zap,
  type LucideIcon,
} from "lucide-react";

const icons: [RegExp, LucideIcon][] = [
  [/skat/i, Snowflake],
  [/swim|pool|aqua/i, WavesLadder],
  [/basketball/i, CircleDot],
  [/volleyball/i, Volleyball],
  [/badminton|pickleball/i, Feather],
  [/futsal|soccer/i, Goal],
  [/field/i, LandPlot],
  [/fitness|weight/i, Dumbbell],
  [/studio|yoga/i, PersonStanding],
  [/zone/i, Zap],
];

export function ProgramIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons.find(([pattern]) => pattern.test(name))?.[1] ?? Activity;
  return <Icon aria-hidden className={className} />;
}
