import Link from "next/link";

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-6 shadow-sm bg-white/70">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          TravelPlanner
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Plan trips, build itineraries, and explore with AI.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/plan"
            className="rounded-xl bg-black text-white px-6 py-3 text-center hover:opacity-90"
          >
            Plan a Trip
          </Link>
          <Link
            href="/itineraries"
            className="rounded-xl border px-6 py-3 text-center hover:bg-slate-100"
          >
            My Itineraries
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Feature
            title="Smart Planning"
            desc="Chat with AI to craft day-by-day plans."
          />
          <Feature
            title="Maps Integration"
            desc="Search places and visualize routes with Google Maps."
          />
          <Feature
            title="Save & Revisit"
            desc="Store itineraries and continue planning anytime."
          />
        </div>
      </div>

      <footer className="py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TravelPlanner
      </footer>
    </main>
  );
}
