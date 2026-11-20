import type { Program, Session } from "../src/lib/types";

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Toronto",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

export const escapeText = (text: string) => text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

export function fold(line: string) {
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char);
    if (octets + size > 75) {
      parts.push(current);
      current = " ";
      octets = 1;
    }
    current += char;
    octets += size;
  }
  parts.push(current);
  return parts.join("\r\n");
}

const localStamp = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;

function endDate(session: Session) {
  if (session.end > session.start) return session.date;
  const d = new Date(`${session.date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function buildIcs(program: Program, generatedAt: string) {
  const dtstamp = generatedAt.replace(/[-:]/g, "").replace(/\.\d+/, "");
  const events = program.sessions
    .filter((s) => s.status !== "cancelled")
    .flatMap((s) => [
      "BEGIN:VEVENT",
      `UID:${s.id}@uw-open-rec-cal`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=America/Toronto:${localStamp(s.date, s.start)}`,
      `DTEND;TZID=America/Toronto:${localStamp(endDate(s), s.end)}`,
      `SUMMARY:${escapeText(program.name)}`,
      `LOCATION:${escapeText(s.location)}`,
      `DESCRIPTION:${escapeText(
        [s.status === "changed" && "Time changed from the regular schedule.", `Official schedule: ${program.url}`]
          .filter(Boolean)
          .join("\n"),
      )}`,
      `URL:${program.url}`,
      "END:VEVENT",
    ]);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//uw-open-rec-cal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`${program.name} · UW`)}`,
    "X-WR-TIMEZONE:America/Toronto",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...VTIMEZONE,
    ...events,
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
