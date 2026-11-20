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
    <section aria-labelledby="programs-heading" className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="programs-heading" className="text-lg font-semibold">
          All programs <span className="font-normal text-muted">({items.length})</span>
        </h2>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search programs</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs or places"
            className="h-9 w-full rounded-lg border border-line bg-card pr-3 pl-9 text-sm placeholder:text-muted"
          />
        </label>
      </div>

      {shown.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ program, locations }) => (
            <li key={program.slug} className="grid">
              <ProgramCard program={program} locations={locations} now={now} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-muted">
          No programs match “{query}”.
        </p>
      )}
    </section>
  );
}
