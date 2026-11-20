"use client";

import { useState, useSyncExternalStore } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function subscribe() {
  return () => {};
}

const button = "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-semibold";

export function Subscribe({ slug, name }: { slug: string; name: string }) {
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

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={webcal}
        aria-label={`Subscribe to ${name} in Apple Calendar or Outlook`}
        className={`${button} col-span-2 bg-court text-on-court hover:opacity-90`}
      >
        Apple Calendar or Outlook
      </a>
      <a
        href={google}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Subscribe to ${name} in Google Calendar (opens in a new tab)`}
        className={`${button} col-span-2 border border-ink hover:bg-surface`}
      >
        Google Calendar
      </a>
      <button type="button" onClick={copy} className={`${button} border border-rule hover:border-ink`}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a
        href={path}
        download
        aria-label={`Download ${name} calendar file`}
        className={`${button} border border-rule hover:border-ink`}
      >
        Download .ics
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? "Calendar link copied" : ""}
      </span>
    </div>
  );
}
