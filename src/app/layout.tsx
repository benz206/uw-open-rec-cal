import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import { schedule } from "@/lib/schedule";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "UW Open Rec", template: "%s | UW Open Rec" },
  description:
    "Drop-in times for every University of Waterloo Open Rec program, with calendar feeds you can subscribe to.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121a22" },
    { media: "(prefers-color-scheme: light)", color: "#edf0ef" },
  ],
};

const updated = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(schedule.generatedAt));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip font-sans">
        <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
          <Link href="/" className="wide text-lg font-extrabold tracking-tight">
            UW Open Rec
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">{children}</main>

        <footer className="mx-auto mt-20 w-full max-w-6xl px-4 pb-10 sm:px-6">
          <p className="max-w-2xl border-t border-rule pt-5 text-sm text-muted">
            Not affiliated with the University of Waterloo. Times come from{" "}
            <a href="https://warrior.uwaterloo.ca" className="text-ink underline underline-offset-2">
              warrior.uwaterloo.ca
            </a>{" "}
            and are checked every 6 hours, most recently{" "}
            <time dateTime={schedule.generatedAt}>{updated}</time>. Subscribed calendars pick up changes on their own,
            though Google Calendar can take up to a day.
          </p>
        </footer>
      </body>
    </html>
  );
}
