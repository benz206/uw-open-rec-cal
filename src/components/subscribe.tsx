"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function subscribe() {
  return () => {};
}

const button =
  "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-[color,background-color,border-color,filter]";
const small = `${button} h-8 px-2.5 text-xs text-muted hover:bg-surface-2 hover:text-fg`;

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
    <div className="grid gap-1.5">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={webcal}
          aria-label={`Subscribe to ${name} in Apple Calendar or Outlook`}
          className={`${button} h-10 bg-volt px-3 text-sm text-on-volt shadow-[0_8px_24px_-12px_var(--volt)] hover:brightness-110`}
        >
          Apple / Outlook
        </a>
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Subscribe to ${name} in Google Calendar (opens in a new tab)`}
          className={`${button} h-10 border border-line bg-surface-2 px-3 text-sm text-fg hover:border-volt-text/50`}
        >
          Google
        </a>
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={copy} className={small}>
          {copied ? <Check aria-hidden className="size-3.5 text-volt-text" /> : <Copy aria-hidden className="size-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a href={path} download className={small} aria-label={`Download ${name} calendar file`}>
          <Download aria-hidden className="size-3.5" />
          Download .ics
        </a>
      </div>
      <span aria-live="polite" className="sr-only">
        {copied ? "Calendar link copied" : ""}
      </span>
    </div>
  );
}
