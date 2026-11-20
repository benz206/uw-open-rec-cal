import { renameSync, writeFileSync } from "node:fs";
import type { Program, ScheduleData } from "../src/lib/types";
import { parseOfferings, parseProgramDetail, parseProgramList } from "./parse";
import { expand, slugify, toSessions } from "./sessions";

const BASE = "https://warrior.uwaterloo.ca";
const OPEN_REC = "96aba661-60ee-4953-a190-35233bad5f10";
const OUT = "src/data/schedule.json";

async function get(path: string) {
  const res = await fetch(BASE + path, {
    headers: { "User-Agent": "uw-open-rec-cal-bot" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.text();
}

async function scrapeProgram(name: string, courseId: string): Promise<Program> {
  const slug = slugify(name);
  const url = `/Program/GetProgramDetails?courseId=${courseId}`;
  const detail = parseProgramDetail(await get(url));
  if (!detail.byOffering) throw new Error(`${name} is not scheduled by offering; unsupported structure`);
  if (detail.semesters.length === 0) throw new Error(`${name} has no semesters`);

  const semesters = [];
  const perSemester = [];
  for (const { id, name: semester } of detail.semesters) {
    const offerings = parseOfferings(await get(`/Program/GetOfferingsForSemester?semesterId=${id}&programId=${courseId}`));
    const drafts = offerings ? expand(offerings) : [];
    if (offerings && drafts.length === 0) throw new Error(`${name} ${semester}: offerings parsed to zero sessions`);
    semesters.push({ id, name: semester, hasOfferings: offerings !== null });
    perSemester.push({ semester, drafts });
  }

  const sessions = toSessions(slug, perSemester);
  console.log(`${name}: ${sessions.length} sessions (${semesters.map((s) => `${s.name}${s.hasOfferings ? "" : " empty"}`).join(", ")})`);
  return { slug, name, courseId, url: BASE + url, description: detail.description, semesters, sessions };
}

async function main() {
  const listed = parseProgramList(await get(`/program?classificationId=${OPEN_REC}`));
  if (listed.length === 0) throw new Error("No programs found in listing");

  const programs: Program[] = [];
  for (const { name, courseId } of listed) programs.push(await scrapeProgram(name, courseId));
  programs.sort((a, b) => a.name.localeCompare(b.name));

  const total = programs.reduce((n, p) => n + p.sessions.length, 0);
  if (total === 0) throw new Error("Scrape produced zero sessions");

  const data: ScheduleData = { generatedAt: new Date().toISOString(), timezone: "America/Toronto", programs };
  writeFileSync(`${OUT}.tmp`, JSON.stringify(data, null, 2) + "\n");
  renameSync(`${OUT}.tmp`, OUT);
  console.log(`Wrote ${programs.length} programs, ${total} sessions to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
