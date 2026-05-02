import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Plus, Search, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export const Route = createFileRoute("/tankers")({
  head: () => ({
    meta: [
      { title: "Tanker Management — TMMS" },
      { name: "description", content: "Manage and monitor the registered water tanker fleet across Karachi." },
      { property: "og:title", content: "Tanker Management — TMMS" },
      { property: "og:description", content: "Manage and monitor the registered water tanker fleet." },
    ],
  }),
  component: TankersPage,
});

type Tanker = {
  id: string;
  driver: string;
  capacity: string;
  region: string;
  status: "available" | "busy" | "offline";
  trips: number;
};

const initial: Tanker[] = [
  { id: "TMK-1138", driver: "Asad Khan", capacity: "5,000 L", region: "Gulshan", status: "busy", trips: 412 },
  { id: "TMK-0942", driver: "Imran Baloch", capacity: "8,000 L", region: "DHA", status: "available", trips: 528 },
  { id: "TMK-2207", driver: "Saleem Memon", capacity: "3,000 L", region: "North Nazimabad", status: "available", trips: 198 },
  { id: "TMK-1810", driver: "Rashid Ali", capacity: "5,000 L", region: "Korangi", status: "busy", trips: 376 },
  { id: "TMK-0455", driver: "Yousuf Shah", capacity: "10,000 L", region: "Malir", status: "offline", trips: 612 },
  { id: "TMK-3301", driver: "Bilal Ahmed", capacity: "8,000 L", region: "Saddar", status: "available", trips: 240 },
  { id: "TMK-2014", driver: "Faisal Qureshi", capacity: "5,000 L", region: "Lyari", status: "busy", trips: 305 },
  { id: "TMK-1602", driver: "Naveed Hussain", capacity: "3,000 L", region: "Orangi", status: "available", trips: 158 },
];

function TankersPage() {
  const { ok } = useRoleGuard(["admin"]);
  const [tankers, setTankers] = useState(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "busy" | "offline">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      tankers.filter(
        (t) =>
          (filter === "all" || t.status === filter) &&
          (t.id.toLowerCase().includes(q.toLowerCase()) ||
            t.driver.toLowerCase().includes(q.toLowerCase()) ||
            t.region.toLowerCase().includes(q.toLowerCase())),
      ),
    [tankers, q, filter],
  );

  if (!ok) return null;
  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader
          title="Tanker Management"
          subtitle="Registered fleet across Karachi"
          action={
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-accent text-accent-foreground font-semibold shadow-elegant hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" /> Add Tanker
            </button>
          }
        />

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-card mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID, driver, or region…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm transition"
            />
          </div>
          <div className="flex gap-1.5 bg-muted p-1 rounded-lg">
            {(["all", "available", "busy", "offline"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                  filter === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Tanker</th>
                  <th className="text-left px-5 py-3 font-semibold">Driver</th>
                  <th className="text-left px-5 py-3 font-semibold">Capacity</th>
                  <th className="text-left px-5 py-3 font-semibold">Region</th>
                  <th className="text-left px-5 py-3 font-semibold">Trips</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Truck className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-primary">{t.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{t.driver}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded-md bg-secondary/15 text-primary text-xs font-semibold">
                        {t.capacity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.region}</td>
                    <td className="px-5 py-3.5 font-semibold">{t.trips}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      No tankers match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add tanker modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setTankers((t) => [
                {
                  id: String(fd.get("id") || `TMK-${Math.floor(Math.random() * 9000 + 1000)}`),
                  driver: String(fd.get("driver") || "—"),
                  capacity: String(fd.get("capacity") || "5,000 L"),
                  region: String(fd.get("region") || "Karachi"),
                  status: "available",
                  trips: 0,
                },
                ...t,
              ]);
              setOpen(false);
            }}
            className="relative bg-card rounded-2xl shadow-elegant w-full max-w-md p-6 border border-border animate-fade-up"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-xl font-black text-primary">Add Tanker</h3>
            <p className="text-sm text-muted-foreground mt-1">Register a new vehicle to the TMMS fleet.</p>
            <div className="mt-5 space-y-3">
              {[
                { name: "id", label: "Tanker ID", placeholder: "TMK-0000" },
                { name: "driver", label: "Driver Name", placeholder: "e.g. Asad Khan" },
                { name: "capacity", label: "Capacity", placeholder: "5,000 L" },
                { name: "region", label: "Region", placeholder: "Gulshan-e-Iqbal" },
              ].map((f) => (
                <label key={f.name} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                  <input
                    name={f.name}
                    placeholder={f.placeholder}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2.5 rounded-lg gradient-accent text-accent-foreground font-semibold text-sm shadow-elegant">
                Save Tanker
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
