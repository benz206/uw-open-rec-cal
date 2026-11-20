import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { schedule } from "@/lib/schedule";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "UW Open Rec Calendar", template: "%s | UW Open Rec Calendar" },
  description:
    "Subscribe to auto-updating calendars for every University of Waterloo Open Rec drop-in program, including skate, swim, basketball and badminton.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

const updated = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(schedule.generatedAt));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip font-sans">
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <svg aria-hidden viewBox="0 0 32 32" className="size-6">
                <rect width="32" height="32" rx="7" fill="var(--accent)" />
                <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="9" width="16" height="15" rx="2" />
                  <path d="M8 14h16M12.5 7v4M19.5 7v4" />
                </g>
              </svg>
              UW Open Rec Calendar
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">{children}</main>

        <footer className="mt-20 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted sm:px-6 md:grid-cols-2">
            <p className="max-w-prose">
              Each program has its own calendar feed. Once you subscribe, your calendar app picks up new sessions, time
              changes and cancellations by itself. Apple Calendar and Outlook refresh within a few hours; Google Calendar
              can take up to a day.
            </p>
            <p className="max-w-prose md:text-right">
              Not affiliated with the University of Waterloo. Schedules come from{" "}
              <a href="https://warrior.uwaterloo.ca" className="text-fg underline underline-offset-4 hover:text-accent">
                warrior.uwaterloo.ca
              </a>
              . Last updated <time dateTime={schedule.generatedAt}>{updated}</time>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
