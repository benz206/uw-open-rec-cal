import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { schedule } from "@/lib/schedule";
import "./globals.css";

const heading = Bricolage_Grotesque({ variable: "--font-heading", subsets: ["latin"] });
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "UW Open Rec Calendar", template: "%s · UW Open Rec Calendar" },
  description:
    "Subscribe to auto-updating calendars for every University of Waterloo Open Recreation drop-in program — skate, swim, basketball, badminton and more.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090f" },
    { media: "(prefers-color-scheme: light)", color: "#f4f5ef" },
  ],
};

const updated = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(schedule.generatedAt));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip font-sans">
        <header className="mx-auto flex w-full max-w-6xl items-center px-4 pt-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg font-display text-lg font-semibold tracking-tight">
            <span aria-hidden className="grid size-8 place-items-center rounded-xl bg-volt text-on-volt">
              <CalendarCheck className="size-4" strokeWidth={2.5} />
            </span>
            <span>
              open<span className="text-volt-text">rec</span>.cal
            </span>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">{children}</main>

        <footer className="mt-24 border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted sm:px-6 md:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-2">
              <h2 className="font-display text-base font-semibold text-fg">How it works</h2>
              <p className="max-w-prose">
                Each program has its own calendar feed. Subscribe once and your calendar app keeps it in sync —
                new sessions, time changes and cancellations show up on their own. Apple Calendar and Outlook refresh
                within hours; Google Calendar can take up to ~24 hours.
              </p>
            </div>
            <div className="grid content-start gap-2">
              <p>
                Unofficial — not affiliated with the University of Waterloo. Data from{" "}
                <a href="https://warrior.uwaterloo.ca" className="rounded-sm text-fg underline decoration-line underline-offset-4 hover:decoration-volt-text">
                  warrior.uwaterloo.ca
                </a>
                , refreshed every few hours.
              </p>
              <p>
                Last updated <time dateTime={schedule.generatedAt}>{updated} ET</time>.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
