import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid justify-items-start gap-3 py-24">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted">This program may have been renamed or removed.</p>
      <Link
        href="/"
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg hover:opacity-90"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All programs
      </Link>
    </section>
  );
}
