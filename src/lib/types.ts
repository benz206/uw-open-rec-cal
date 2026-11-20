export type SessionStatus = "scheduled" | "changed" | "cancelled";

export interface Session {
  id: string;
  date: string;
  start: string;
  end: string;
  location: string;
  status: SessionStatus;
  semester: string;
}

export interface Semester {
  id: string;
  name: string;
  hasOfferings: boolean;
}

export interface Program {
  slug: string;
  name: string;
  courseId: string;
  url: string;
  description: string;
  semesters: Semester[];
  sessions: Session[];
}

export interface ScheduleData {
  generatedAt: string;
  timezone: "America/Toronto";
  programs: Program[];
}
