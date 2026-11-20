"use client";

import { CalendarPlus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function subscribe() {
  return () => {};
}

function useFeed(slug: string) {
  const path = `${basePath}/cal/${slug}.ics`;
  const host = useSyncExternalStore(subscribe, () => window.location.host, () => null);
  const [copied, setCopied] = useState(false);
  const webcal = host ? `webcal://${host}${path}` : undefined;
  const google = webcal && `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return { path, webcal, google, copied, copy };
}

const button = "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors";
const outline = `${button} border border-line bg-card hover:bg-hover`;
const item = "flex h-9 items-center rounded-md px-2.5 text-left text-sm hover:bg-hover";

export function AddToCalendar({ slug, name }: { slug: string; name: string }) {
  const feed = useFeed(slug);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Add ${name} to your calendar`}
        onClick={() => setOpen(!open)}
        className={`${outline} w-full`}
      >
        <CalendarPlus aria-hidden className="size-4" />
        Add to calendar
        <ChevronDown aria-hidden className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 grid rounded-lg border border-line bg-card p-1 shadow-lg">
          <a href={feed.webcal} className={item}>
            Apple Calendar or Outlook
          </a>
          <a href={feed.google} target="_blank" rel="noopener noreferrer" className={item}>
            Google Calendar
          </a>
          <button type="button" onClick={feed.copy} className={item}>
            {feed.copied ? "Link copied" : "Copy link"}
          </button>
          <a href={feed.path} download className={item}>
            Download .ics file
          </a>
        </div>
      )}
      <span aria-live="polite" className="sr-only">
        {feed.copied ? "Calendar link copied" : ""}
      </span>
    </div>
  );
}

export function Subscribe({ slug, name }: { slug: string; name: string }) {
  const feed = useFeed(slug);

  return (
    <div className="grid gap-2">
      <a
        href={feed.webcal}
        aria-label={`Subscribe to ${name} in Apple Calendar or Outlook`}
        className={`${button} bg-accent text-accent-fg hover:opacity-90`}
      >
        Apple Calendar or Outlook
      </a>
      <a
        href={feed.google}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Subscribe to ${name} in Google Calendar (opens in a new tab)`}
        className={outline}
      >
        Google Calendar
      </a>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={feed.copy} className={outline}>
          {feed.copied ? "Link copied" : "Copy link"}
        </button>
        <a href={feed.path} download aria-label={`Download ${name} calendar file`} className={outline}>
          Download .ics
        </a>
      </div>
      <span aria-live="polite" className="sr-only">
        {feed.copied ? "Calendar link copied" : ""}
      </span>
    </div>
  );
}
