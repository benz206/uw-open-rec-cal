import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { ScheduleData } from "../src/lib/types";
import { buildIcs } from "./ics";

const OUT_DIR = "public/cal";

const data: ScheduleData = JSON.parse(readFileSync("src/data/schedule.json", "utf8"));
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
for (const program of data.programs) {
  writeFileSync(`${OUT_DIR}/${program.slug}.ics`, buildIcs(program, data.generatedAt));
}
console.log(`Wrote ${data.programs.length} calendars to ${OUT_DIR}`);
