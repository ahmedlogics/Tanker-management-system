import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useEffect, useState } from "react";
import { getComplaints, resolveComplaint, type Complaint } from "@/lib/tmms-store";
import { CheckCircle2, MessageSquareWarning } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints — TMMS" },
      { name: "description", content: "Manage and resolve customer complaints in TMMS." },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { ok } = useRoleGuard(["admin"]);
  const [items, setItems] = useState<Complaint[]>([]);

  useEffect(() => {
    const sync = () => setItems(getComplaints());
    sync();
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, []);

  const pending = items.filter((c) => c.status === "pending").length;
  const resolved = items.filter((c) => c.status === "resolved").length;

  if (!ok) return null;
  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader
          title="Complaints"
          subtitle="Customer-filed complaints across the TMMS network"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Stat label="Pending" value={pending} tone="warning" />
          <Stat label="Resolved" value={resolved} tone="success" />
          <Stat label="Total" value={items.length} tone="primary" />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquareWarning className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-bold text-primary">No complaints filed yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Complaints filed from the Orders page will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">ID</th>
                    <th className="text-left px-5 py-3 font-semibold">Order</th>
                    <th className="text-left px-5 py-3 font-semibold">Customer</th>
                    <th className="text-left px-5 py-3 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c, i) => (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3.5 font-bold text-primary">{c.id}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          {c.orderId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{c.customer}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.type}</td>
                      <td className="px-5 py-3.5 max-w-xs truncate" title={c.description}>
                        {c.description}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status === "resolved" ? "delivered" : "pending"} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {c.status === "pending" ? (
                          <button
                            onClick={() => resolveComplaint(c.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-bold hover:bg-success/25 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "warning" | "success" | "primary" }) {
  const cls = { warning: "text-warning", success: "text-success", primary: "text-primary" }[tone];
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
      <div className={`text-3xl font-black ${cls}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
