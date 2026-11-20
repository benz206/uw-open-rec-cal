import { readFileSync } from "node:fs";
import ical, { type VEvent } from "node-ical";
import { describe, expect, it } from "vitest";
import type { Program } from "../src/lib/types";
import { buildIcs, escapeText, fold } from "./ics";
import { parseOfferings } from "./parse";
import { expand, toSessions } from "./sessions";

const programFrom = (name: string, slug: string, file: string): Program => {
  const html = readFileSync(new URL(`./fixtures/${file}`, import.meta.url), "utf8");
  return {
    slug,
    name,
    courseId: "d5521154-639f-4afb-93cd-971b00cc708c",
    url: "https://warrior.uwaterloo.ca/Program/GetProgramDetails?courseId=d5521154-639f-4afb-93cd-971b00cc708c",
    description: "",
    semesters: [],
    sessions: toSessions(slug, [{ semester: "Fall 2026", drafts: expand(parseOfferings(html)!) }]),
  };
};

const generatedAt = "2026-11-20T18:00:00.000Z";
const skateIcs = buildIcs(programFrom("Open Rec Skate", "open-rec-skate", "fall.html"), generatedAt);
const events = Object.values(ical.sync.parseICS(skateIcs)).filter((c): c is VEvent => c?.type === "VEVENT");
const event = (id: string) => events.find((e) => e.uid === `${id}@uw-open-rec-cal`);

describe("buildIcs", () => {
  it("uses CRLF and folds lines to 75 octets", () => {
    expect(skateIcs).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(skateIcs.replace(/\r\n/g, "")).not.toMatch(/\n|\r/);
    const lines = skateIcs.split("\r\n");
    expect(lines.some((l) => l.startsWith(" "))).toBe(true);
    for (const line of lines) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
  });

  it("includes calendar metadata and timezone", () => {
    expect(skateIcs).toContain("X-WR-CALNAME:Open Rec Skate · UW\r\n");
    expect(skateIcs).toContain("REFRESH-INTERVAL;VALUE=DURATION:PT6H\r\n");
    expect(skateIcs).toContain("BEGIN:VTIMEZONE\r\nTZID:America/Toronto\r\n");
  });

  it("converts Toronto local times across DST", () => {
    expect(event("open-rec-skate-2026-11-20-1200")?.start.toISOString()).toBe("2026-11-20T17:00:00.000Z");
    expect(event("open-rec-skate-2026-10-05-1030")?.start.toISOString()).toBe("2026-10-05T14:30:00.000Z");
    expect(event("open-rec-skate-2026-10-05-1030")?.end?.toISOString()).toBe("2026-10-05T15:30:00.000Z");
  });

  it("describes changed sessions and omits cancelled ones", () => {
    const changed = event("open-rec-skate-2026-11-20-1200");
    expect(changed?.description).toContain("Time changed from the regular schedule");
    expect(changed?.description).toContain("courseId=d5521154-639f-4afb-93cd-971b00cc708c");
    expect(changed?.location).toBe("CIF Arena");
    const dates = events.map((e) => e.start.toISOString().slice(0, 10));
    for (const date of ["2026-09-25", "2026-10-12", "2026-12-18"]) expect(dates).not.toContain(date);
    expect(events).toHaveLength(63);
  });

  it("ends overnight sessions on the next day", () => {
    const cif = buildIcs(programFrom("CIF Fitness Centre Hours", "cif-fitness-centre-hours", "cif-fitness-fall.html"), generatedAt);
    const parsed = ical.sync.parseICS(cif)["cif-fitness-centre-hours-2026-11-20-1500@uw-open-rec-cal"] as VEvent;
    expect(parsed.start.toISOString()).toBe("2026-11-20T20:00:00.000Z");
    expect(parsed.end?.toISOString()).toBe("2026-11-21T05:30:00.000Z");
  });
});

describe("text helpers", () => {
  it("escapes TEXT values", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("folds without splitting multi-byte characters", () => {
    const folded = fold(`X:${"·".repeat(80)}`);
    for (const line of folded.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(`X:${"·".repeat(80)}`);
  });
});
