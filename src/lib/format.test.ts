import { describe, expect, it } from "vitest";
import { isLive, isOver } from "./format";
import type { Session } from "./types";

const session = (start: string, end: string): Session => ({
  id: "x",
  date: "2026-11-20",
  start,
  end,
  location: "PAC Pool",
  status: "scheduled",
  semester: "Fall 2026",
});

describe("session timing", () => {
  it("handles same-day sessions", () => {
    const s = session("12:00", "13:00");
    expect(isLive(s, "2026-11-20 12:30")).toBe(true);
    expect(isOver(s, "2026-11-20 13:00")).toBe(true);
  });

  it("treats sessions ending at or after midnight as ending the next day", () => {
    const s = session("15:00", "00:30");
    expect(isOver(s, "2026-11-20 13:00")).toBe(false);
    expect(isLive(s, "2026-11-20 23:00")).toBe(true);
    expect(isLive(s, "2026-11-21 00:15")).toBe(true);
    expect(isOver(s, "2026-11-21 00:30")).toBe(true);
    expect(isOver(session("20:00", "00:00"), "2026-11-20 23:59")).toBe(false);
  });
});
