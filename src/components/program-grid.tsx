"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useTorontoNow } from "@/lib/use-now";
import type { Program } from "@/lib/types";
import { ProgramCard } from "./program-card";

type Item = { program: Program; locations: string[] };

export function ProgramGrid({ items, fallbackNow }: { items: Item[]; fallbackNow: string }) {
  const now = useTorontoNow(fallbackNow);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = items.filter(
    ({ program, locations }) => !q || [program.name, ...locations].some((t) => t.toLowerCase().includes(q)),
  );

  return (
    <section aria-labelledby="programs-heading" className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="programs-heading" className="font-display text-2xl font-semibold tracking-tight">
          Programs <span className="text-muted tabular-nums">{items.length}</span>
        </h2>
        <label className="relative block sm:w-72">
          <span className="sr-only">Filter programs</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by sport or place"
            className="h-11 w-full rounded-2xl border border-line bg-surface/80 pr-4 pl-10 text-sm placeholder:text-muted focus:border-volt-text/50"
          />
        </label>
      </div>

      {shown.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ program, locations }, i) => (
            <li key={program.slug} className="rise grid" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <ProgramCard program={program} locations={locations} now={now} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-line px-6 py-12 text-center text-muted">
          Nothing matches “{query}”.
        </p>
      )}
    </section>
  );
}
