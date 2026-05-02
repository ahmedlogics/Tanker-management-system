import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Search, Filter } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — TMMS" },
      { name: "description", content: "Track and manage all water tanker orders across Karachi neighborhoods." },
      { property: "og:title", content: "Orders — TMMS" },
      { property: "og:description", content: "Track and manage all water tanker orders." },
    ],
  }),
  component: OrdersPage,
});

type OS = "pending" | "in_transit" | "delivered" | "cancelled";
const orders: { id: string; customer: string; area: string; capacity: string; tanker: string; date: string; status: OS; amount: string }[] = [
  { id: "ORD-49021", customer: "Ayesha Siddiqui", area: "Gulshan-e-Iqbal", capacity: "5,000 L", tanker: "TMK-1138", date: "2025-05-02", status: "in_transit", amount: "₨ 4,200" },
  { id: "ORD-49020", customer: "Hamza Tariq", area: "DHA Phase 6", capacity: "8,000 L", tanker: "TMK-0942", date: "2025-05-02", status: "delivered", amount: "₨ 6,800" },
  { id: "ORD-49019", customer: "Sana Iqbal", area: "North Nazimabad", capacity: "3,000 L", tanker: "TMK-2207", date: "2025-05-02", status: "pending", amount: "₨ 2,500" },
  { id: "ORD-49018", customer: "Bilal Ahmed", area: "Korangi", capacity: "5,000 L", tanker: "TMK-1810", date: "2025-05-01", status: "delivered", amount: "₨ 4,200" },
  { id: "ORD-49017", customer: "Faraz Sheikh", area: "Malir", capacity: "10,000 L", tanker: "TMK-0455", date: "2025-05-01", status: "cancelled", amount: "₨ 8,500" },
  { id: "ORD-49016", customer: "Mehwish Khan", area: "Saddar", capacity: "5,000 L", tanker: "TMK-3301", date: "2025-05-01", status: "delivered", amount: "₨ 4,200" },
  { id: "ORD-49015", customer: "Usman Ghani", area: "Lyari", capacity: "3,000 L", tanker: "TMK-2014", date: "2025-04-30", status: "delivered", amount: "₨ 2,500" },
  { id: "ORD-49014", customer: "Zainab Raza", area: "Orangi", capacity: "8,000 L", tanker: "TMK-1602", date: "2025-04-30", status: "pending", amount: "₨ 6,800" },
  { id: "ORD-49013", customer: "Kashif Mir", area: "PECHS", capacity: "5,000 L", tanker: "TMK-1138", date: "2025-04-30", status: "delivered", amount: "₨ 4,200" },
];

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OS | "all">("all");
  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (o.id.toLowerCase().includes(q.toLowerCase()) ||
            o.customer.toLowerCase().includes(q.toLowerCase()) ||
            o.area.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, status],
  );

  const counts = useMemo(() => {
    const c = { pending: 0, in_transit: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => (c[o.status] += 1));
    return c;
  }, []);

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader title="Orders" subtitle="All tanker orders across the network" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { l: "Pending", v: counts.pending, c: "warning" },
            { l: "In Transit", v: counts.in_transit, c: "secondary" },
            { l: "Delivered", v: counts.delivered, c: "success" },
            { l: "Cancelled", v: counts.cancelled, c: "destructive" },
          ].map((s) => (
            <div key={s.l} className="bg-card rounded-2xl p-5 border border-border shadow-card">
              <div className={`text-3xl font-black text-${s.c}`}>{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border shadow-card mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order ID, customer, or area…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OS | "all")}
              className="px-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary outline-none text-sm font-medium"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3 font-semibold">Area</th>
                  <th className="text-left px-5 py-3 font-semibold">Capacity</th>
                  <th className="text-left px-5 py-3 font-semibold">Tanker</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-5 py-3.5 font-bold text-primary">{o.id}</td>
                    <td className="px-5 py-3.5">{o.customer}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{o.area}</td>
                    <td className="px-5 py-3.5">{o.capacity}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">{o.tanker}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary">{o.amount}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No orders match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
