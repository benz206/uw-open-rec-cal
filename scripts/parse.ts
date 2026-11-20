import * as cheerio from "cheerio";

export interface Slot {
  date: string;
  start: string;
  end: string;
  location: string;
}

export interface Rule {
  from: string;
  to: string;
  days: number[] | null;
  start: string;
  end: string;
  location: string;
}

export interface Offerings {
  rules: Rule[];
  changed: Slot[];
  cancelled: Slot[];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

export function parseProgramList(html: string) {
  const $ = cheerio.load(html);
  return $(".program-list-item a.img-link")
    .map((_, a) => ({
      name: clean($(a).find(".program-list-item-title").text()),
      courseId: new URL($(a).attr("href")!, "https://x").searchParams.get("courseId")!,
    }))
    .get();
}

export function parseProgramDetail(html: string) {
  const $ = cheerio.load(html);
  const semesters = new Map<string, string>();
  $("button[data-semester-id]").each((_, b) => {
    semesters.set($(b).attr("data-semester-id")!, clean($(b).text()));
  });
  return {
    byOffering: $("#IsProgramByOffering").val() === "True",
    description: clean($("#progDesc").text()),
    semesters: [...semesters].map(([id, name]) => ({ id, name })),
  };
}

export function parseDate(text: string) {
  const m = clean(text).match(/^\w{3}, (\w{3}) (\d{1,2}) (\d{4})$/);
  const month = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  if (!m || month < 0) throw new Error(`Unrecognized date: ${text}`);
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

function toMinutes(hour: number, minute: number, meridiem: string) {
  return (hour % 12) * 60 + minute + (meridiem.toUpperCase() === "PM" ? 720 : 0);
}

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export function parseTimeRange(text: string) {
  const m = clean(text).match(/^(\d{1,2}):(\d{2}) ?(AM|PM)? - (\d{1,2}):(\d{2}) ?(AM|PM)$/i);
  if (!m) throw new Error(`Unrecognized time range: ${text}`);
  const end = toMinutes(+m[4], +m[5], m[6]);
  let start = toMinutes(+m[1], +m[2], m[3] ?? m[6]);
  if (!m[3] && m[6].toUpperCase() === "PM" && start > end) start = toMinutes(+m[1], +m[2], "AM");
  return { start: hhmm(start), end: hhmm(end) };
}

export function parseDays(text: string) {
  const t = clean(text).toLowerCase();
  if (t === "one-time") return null;
  if (t === "every day") return [0, 1, 2, 3, 4, 5, 6];
  if (t === "every weekday") return [1, 2, 3, 4, 5];
  if (!t.startsWith("every ")) throw new Error(`Unrecognized recurrence: ${text}`);
  return t
    .slice(6)
    .split(/,|\band\b/)
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      if (!DAYS.includes(d)) throw new Error(`Unrecognized recurrence: ${text}`);
      return DAYS.indexOf(d);
    });
}

export function parseOfferings(html: string): Offerings | null {
  const $ = cheerio.load(html);
  if ($(".offering-card").length === 0 && clean($.text()) === "There are no offerings available at this time") {
    return null;
  }
  const result: Offerings = { rules: [], changed: [], cancelled: [] };
  $(".offering-card .card-body.d-md-none > .schedule-summary").each((_, card) => {
    const kind = $(card).find("[role=img]").first().attr("aria-label");
    const fields = $(card)
      .find("p.ps-2")
      .map((_, p) => clean($(p).text()))
      .get();
    if (kind === "Date") {
      const [range, recurrence, time, location] = fields;
      const [from, to = from] = range.split(" - ").map(parseDate);
      result.rules.push({ from, to, days: parseDays(recurrence), ...parseTimeRange(time), location });
    } else if (kind === "Changed Date" || kind === "Canceled Date") {
      const [date, time, location] = fields;
      const slot = { date: parseDate(date), ...parseTimeRange(time), location };
      (kind === "Changed Date" ? result.changed : result.cancelled).push(slot);
    } else {
      throw new Error(`Unrecognized schedule card: ${kind}`);
    }
  });
  return result;
}
