import type { Session, SessionStatus } from "../src/lib/types";
import type { Offerings, Slot } from "./parse";

export type Draft = Slot & { status: SessionStatus };

const minutes = (time: string) => +time.slice(0, 2) * 60 + +time.slice(3);

function* datesBetween(from: string, to: string) {
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    yield d.toISOString().slice(0, 10);
  }
}

export function expand(offerings: Offerings): Draft[] {
  const drafts: Draft[] = [];
  for (const { from, to, days, start, end, location } of offerings.rules) {
    for (const date of datesBetween(from, days ? to : from)) {
      if (!days || days.includes(new Date(`${date}T00:00:00Z`).getUTCDay())) {
        drafts.push({ date, start, end, location, status: "scheduled" });
      }
    }
  }

  const overrides: Draft[] = [
    ...offerings.changed.map((s) => ({ ...s, status: "changed" as const })),
    ...offerings.cancelled.map((s) => ({ ...s, status: "cancelled" as const })),
  ];
  const apply = (override: Draft, exact: boolean) => {
    const distance = (d: Draft, key: "start" | "end") => Math.abs(minutes(d[key]) - minutes(override[key]));
    const candidates = drafts
      .filter((d) => d.status === "scheduled" && d.date === override.date && d.location === override.location)
      .sort((a, b) => distance(a, "start") - distance(b, "start") || distance(a, "end") - distance(b, "end"));
    const match = exact ? candidates.find((d) => d.start === override.start && d.end === override.end) : candidates[0];
    if (!match) return false;
    if (override.status === "changed") Object.assign(match, override);
    else match.status = "cancelled";
    return true;
  };
  for (const override of overrides.filter((o) => !apply(o, true))) {
    if (!apply(override, false)) drafts.push(override);
  }
  return drafts;
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function toSessions(slug: string, semesters: { semester: string; drafts: Draft[] }[]): Session[] {
  const all = semesters.flatMap(({ semester, drafts }) => drafts.map((d) => ({ ...d, semester })));
  const multiLocation = new Set(all.map((d) => d.location)).size > 1;
  const byId = new Map<string, Session>();
  for (const d of all) {
    const id = `${slug}-${d.date}-${d.start.replace(":", "")}${multiLocation ? `-${slugify(d.location)}` : ""}`;
    const existing = byId.get(id);
    if (!existing || (existing.status === "cancelled" && d.status !== "cancelled")) byId.set(id, { id, ...d });
  }
  return [...byId.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.location.localeCompare(b.location),
  );
}
