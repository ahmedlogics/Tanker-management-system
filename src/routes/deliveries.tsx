import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { MapPin, Clock, Droplets } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export const Route = createFileRoute("/deliveries")({
  head: () => ({
    meta: [
      { title: "Deliveries — TMMS" },
      { name: "description", content: "Track water tanker deliveries from hydrant to household across Karachi." },
      { property: "og:title", content: "Deliveries — TMMS" },
      { property: "og:description", content: "Track water tanker deliveries from hydrant to household." },
    ],
  }),
  component: DeliveriesPage,
});

type DS = "in_transit" | "delivered" | "pending";
const deliveries: { id: string; tanker: string; hydrant: string; destination: string; volume: string; departed: string; arrived: string; status: DS }[] = [
  { id: "DLV-7821", tanker: "TMK-1138", hydrant: "Safoora", destination: "Gulshan Block 5", volume: "5,000 L", departed: "08:42", arrived: "—", status: "in_transit" },
  { id: "DLV-7820", tanker: "TMK-0942", hydrant: "Sakhi Hassan", destination: "DHA Phase 6", volume: "8,000 L", departed: "07:55", arrived: "08:38", status: "delivered" },
  { id: "DLV-7819", tanker: "TMK-1810", hydrant: "Manghopir", destination: "Korangi 2½", volume: "5,000 L", departed: "07:10", arrived: "07:58", status: "delivered" },
  { id: "DLV-7818", tanker: "TMK-3301", hydrant: "NIPA", destination: "Saddar", volume: "5,000 L", departed: "—", arrived: "—", status: "pending" },
  { id: "DLV-7817", tanker: "TMK-2014", hydrant: "Pipri", destination: "Lyari", volume: "3,000 L", departed: "06:24", arrived: "07:12", status: "delivered" },
  { id: "DLV-7816", tanker: "TMK-1602", hydrant: "Manghopir", destination: "Orangi Sec 11", volume: "8,000 L", departed: "06:00", arrived: "07:05", status: "delivered" },
];

function DeliveriesPage() {
  const { ok } = useRoleGuard(["admin"]);
  if (!ok) return null;
  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader title="Deliveries" subtitle="Hydrant-to-household tracking, in real time" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Droplets, l: "Total Volume Today", v: "184,000 L", c: "secondary" },
            { icon: Clock, l: "Avg Delivery Time", v: "47 min", c: "accent" },
            { icon: MapPin, l: "Active Hydrants", v: "14 / 16", c: "primary" },
            { icon: Droplets, l: "Completed", v: "128", c: "success" },
          ].map((s) => (
            <div key={s.l} className="bg-card rounded-2xl p-5 border border-border shadow-card">
              <div className={`h-10 w-10 rounded-lg bg-${s.c}/10 flex items-center justify-center mb-3`}>
                <s.icon className={`h-5 w-5 text-${s.c}`} />
              </div>
              <div className="text-2xl font-black text-primary">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-primary">Delivery Tracking</h3>
            <p className="text-xs text-muted-foreground">Live feed of in-progress and completed deliveries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Delivery</th>
                  <th className="text-left px-5 py-3 font-semibold">Tanker</th>
                  <th className="text-left px-5 py-3 font-semibold">Hydrant</th>
                  <th className="text-left px-5 py-3 font-semibold">Destination</th>
                  <th className="text-left px-5 py-3 font-semibold">Volume</th>
                  <th className="text-left px-5 py-3 font-semibold">Departed</th>
                  <th className="text-left px-5 py-3 font-semibold">Arrived</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d, i) => (
                  <tr
                    key={d.id}
                    className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5 font-bold text-primary">{d.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">{d.tanker}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" />{d.hydrant}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.destination}</td>
                    <td className="px-5 py-3.5 font-semibold">{d.volume}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.departed}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.arrived}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
