import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDays, parseOfferings, parseProgramDetail, parseProgramList, parseTimeRange } from "./parse";
import { expand, toSessions } from "./sessions";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

const sessionsFor = (slug: string, file: string) =>
  toSessions(slug, [{ semester: "Fall 2026", drafts: expand(parseOfferings(fixture(file))!) }]);

const on = (sessions: ReturnType<typeof sessionsFor>, date: string) =>
  sessions.filter((s) => s.date === date).map(({ start, end, status }) => ({ start, end, status }));

describe("parseTimeRange", () => {
  it.each([
    ["10:30 - 11:30 AM", "10:30", "11:30"],
    ["1:00 - 2:00 PM", "13:00", "14:00"],
    ["11:00 AM - 12:00 PM", "11:00", "12:00"],
    ["12:00 - 1:00 PM", "12:00", "13:00"],
    ["11:00 - 12:30 PM", "11:00", "12:30"],
    ["10:00 - 11:00 PM", "22:00", "23:00"],
    ["9:30 PM - 12:30 AM", "21:30", "00:30"],
    ["6:00 - 12:30 AM", "06:00", "00:30"],
  ])("%s", (text, start, end) => {
    expect(parseTimeRange(text)).toEqual({ start, end });
  });

  it("rejects unknown formats", () => {
    expect(() => parseTimeRange("noon - 1pm")).toThrow();
  });
});

describe("parseDays", () => {
  it("handles recurrence text", () => {
    expect(parseDays("One-Time")).toBeNull();
    expect(parseDays("Every Weekday ")).toEqual([1, 2, 3, 4, 5]);
    expect(parseDays("Every Tuesday And Wednesday ")).toEqual([2, 3]);
    expect(parseDays("Every Monday, Tuesday, Thursday, And Friday ")).toEqual([1, 2, 4, 5]);
    expect(() => parseDays("Every Other Monday")).toThrow();
  });
});

describe("listing and detail pages", () => {
  it("finds only the category's program cards", () => {
    const programs = parseProgramList(fixture("list.html"));
    expect(programs).toHaveLength(14);
    expect(programs.map((p) => p.courseId)).not.toContain("96652727-301e-4456-b19c-5ddac9ff3ba1");
    expect(programs).toContainEqual({ name: "Open Rec Skate", courseId: "d5521154-639f-4afb-93cd-971b00cc708c" });
    expect(programs[0].name).toBe("CIF Fitness Centre Hours");
  });

  it("reads semesters and description", () => {
    const detail = parseProgramDetail(fixture("detail.html"));
    expect(detail.byOffering).toBe(true);
    expect(detail.semesters).toEqual([
      { id: "84d2b1ab-ff7c-4fb3-9281-3249de475a80", name: "Fall 2026" },
      { id: "f966b35d-96ad-4897-97c4-dd6eac9f1f1e", name: "Winter 2027" },
    ]);
    expect(detail.description).toMatch(/^NO REGISTRATION REQUIRED - Open Recreation Skate is designed/);
    expect(detail.description).not.toMatch(/ {2}|<|\n\n|^ | $/m);
    expect(detail.description).toContain("**Please Note**\n- All users must have a valid Warrior Recreation membership");
    expect(detail.description.split("\n")).toHaveLength(7);
  });
});

describe("Open Rec Skate, Fall 2026", () => {
  const sessions = sessionsFor("open-rec-skate", "fall.html");

  it("starts on the first scheduled Monday", () => {
    expect(sessions[0]).toEqual({
      id: "open-rec-skate-2026-09-14-1030",
      date: "2026-09-14",
      start: "10:30",
      end: "11:30",
      location: "CIF Arena",
      status: "scheduled",
      semester: "Fall 2026",
    });
  });

  it("runs Tuesdays and Wednesdays 13:00-14:00", () => {
    expect(on(sessions, "2026-09-22")).toEqual([{ start: "13:00", end: "14:00", status: "scheduled" }]);
    expect(on(sessions, "2026-09-23")).toEqual([{ start: "13:00", end: "14:00", status: "scheduled" }]);
  });

  it("applies changed sessions", () => {
    expect(on(sessions, "2026-11-20")).toEqual([{ start: "12:00", end: "13:00", status: "changed" }]);
    expect(on(sessions, "2026-09-16")).toEqual([{ start: "11:00", end: "12:00", status: "changed" }]);
  });

  it("marks cancelled sessions at their regular time", () => {
    expect(on(sessions, "2026-09-25")).toEqual([{ start: "11:00", end: "12:00", status: "cancelled" }]);
    expect(on(sessions, "2026-10-12")).toEqual([{ start: "10:30", end: "11:30", status: "cancelled" }]);
    expect(on(sessions, "2026-12-18")).toEqual([{ start: "11:00", end: "12:00", status: "cancelled" }]);
  });

  it("is sorted with unique ids", () => {
    const keys = sessions.map((s) => `${s.date} ${s.start}`);
    expect(keys).toEqual([...keys].sort());
    expect(new Set(sessions.map((s) => s.id)).size).toBe(sessions.length);
    expect(sessions).toHaveLength(70);
  });

  it("treats an empty semester as no offerings", () => {
    expect(parseOfferings(fixture("winter.html"))).toBeNull();
  });
});

describe("multiple sessions per day", () => {
  const swim = sessionsFor("swimming-fitness-and-rec", "swim-fitness-fall.html");

  it("matches cancellations by the card time", () => {
    expect(on(swim, "2026-10-30")).toEqual([
      { start: "08:00", end: "09:00", status: "scheduled" },
      { start: "12:00", end: "14:00", status: "changed" },
      { start: "15:00", end: "16:00", status: "cancelled" },
      { start: "22:00", end: "23:00", status: "scheduled" },
    ]);
    expect(on(swim, "2026-10-12").map((s) => s.status)).toEqual(["cancelled", "cancelled", "cancelled", "cancelled"]);
  });

  it("keeps a one-time replacement for a cancelled regular session", () => {
    expect(on(swim, "2026-10-31")).toEqual([{ start: "14:00", end: "15:00", status: "scheduled" }]);
    const cif = sessionsFor("cif-fitness-centre-hours", "cif-fitness-fall.html");
    expect(on(cif, "2026-10-10")).toEqual([{ start: "09:00", end: "17:30", status: "scheduled" }]);
    expect(on(cif, "2026-10-12")).toEqual([{ start: "15:00", end: "00:30", status: "cancelled" }]);
    expect(on(cif, "2026-11-20")).toEqual([{ start: "15:00", end: "00:30", status: "scheduled" }]);
  });
});
