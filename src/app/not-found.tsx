import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-24">
      <h1 className="wide text-4xl font-extrabold tracking-tight">No program here</h1>
      <p className="mt-3 max-w-md text-muted">
        This address doesn’t match any Open Rec program. It may have been renamed or dropped for the season.
      </p>
      <Link href="/" className="mt-6 inline-block font-semibold underline underline-offset-2">
        See all programs
      </Link>
    </section>
  );
}
