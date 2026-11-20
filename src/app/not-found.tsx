import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid justify-items-start gap-4 py-24">
      <p className="font-display text-7xl font-semibold tracking-tight text-volt-text">404</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Nothing on the schedule here.</h1>
      <p className="max-w-md text-muted">That page doesn’t exist — maybe the program was renamed or retired.</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-volt px-4 text-sm font-medium text-on-volt hover:brightness-110"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All programs
      </Link>
    </section>
  );
}
