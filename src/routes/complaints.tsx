import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useEffect, useState } from "react";
import {
  getComplaints,
  addComplaint,
  resolveComplaint,
  getBookings,
  type Complaint,
  type Booking,
} from "@/lib/tmms-store";
import {
  CheckCircle2,
  MessageSquareWarning,
  Send,
  Clock,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints & Grievances — TMMS" },
      { name: "description", content: "Lodge and track complaints regarding water tanker operations in Karachi." },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  // Allow both customer and admin to view this page
  const { user, ok } = useRoleGuard(["customer", "admin", "owner"]);

  if (!ok || !user) return null;

  return (
    <AppShell>
      {user.role === "admin" ? (
        <AdminComplaintsView />
      ) : (
        <CustomerComplaintsView user={user} />
      )}
    </AppShell>
  );
}

// ==========================================
// 1. CUSTOMER COMPLAINTS VIEW
// ==========================================
function CustomerComplaintsView({ user }: { user: { fullName: string; email: string } }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [orderId, setOrderId] = useState<string>("GENERAL");
  const [type, setType] = useState<string>("Overcharging");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const refreshComplaints = async () => {
    try {
      const data = await getComplaints(user.email);
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplaints();
    // Also fetch customer's orders so they can link a complaint to an order
    getBookings(user.email).then((b) => setOrders(b));

    const sync = () => refreshComplaints();
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, [user.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!description.trim() || description.trim().length < 10) {
      setFormError("Please provide a detailed description (minimum 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addComplaint({
        orderId: orderId === "GENERAL" ? "" : orderId,
        userEmail: user.email,
        customer: user.fullName,
        type,
        description: description.trim(),
      });

      if (res) {
        setSuccessMsg("Your complaint has been successfully lodged. Our surveillance unit will review it.");
        setDescription("");
        setOrderId("GENERAL");
        await refreshComplaints();
      } else {
        setFormError("Failed to lodge complaint. Please try again.");
      }
    } catch {
      setFormError("Server connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Complaints & Grievances"
        subtitle="Lodge and track issues regarding tanker water delivery, delay, or extortion."
      />

      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        {/* Left column: File a Complaint form */}
        <div className="lg:col-span-5">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <MessageSquareWarning className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-base">Lodge New Grievance</h3>
                <p className="text-xs text-muted-foreground">Official anti-water-mafia complaint form</p>
              </div>
            </div>

            {successMsg && (
              <div className="mt-4 p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {formError && (
              <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Related Tanker Order (Optional)
                </label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-secondary"
                >
                  <option value="GENERAL">General Grievance (Not order specific)</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.area} ({o.size || o.tanker_size} Gallons)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Complaint Category *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-secondary"
                >
                  <option value="Overcharging">Overcharging / Water Mafia Pricing</option>
                  <option value="Late Delivery">Delayed Delivery / Excessive Waiting Time</option>
                  <option value="No Delivery">No Delivery / Tanker No-Show</option>
                  <option value="Water Quality">Contaminated / Muddy / Saline Water</option>
                  <option value="Incomplete Volume">Incomplete Volume (Tanker not filled)</option>
                  <option value="Driver Misbehavior">Driver Extortion or Misbehavior</option>
                  <option value="Other">Other Service Grievance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide full details: driver behavior, actual amount charged vs quoted, address, etc."
                  className="w-full p-3 rounded-xl bg-muted border border-border text-sm outline-none focus:border-secondary resize-none"
                />
                <span className="text-[11px] text-muted-foreground">Min 10 characters</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-accent text-accent-foreground font-bold text-sm shadow-elegant hover:opacity-95 disabled:opacity-50 transition"
              >
                {submitting ? "Lodging Complaint…" : "Submit Official Complaint"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Customer's Filed Complaints History */}
        <div className="lg:col-span-7">
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary">My Filed Complaints</h3>
                <p className="text-xs text-muted-foreground">Track resolution status from TMMS administration</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {complaints.length} Total
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading complaints…
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-bold text-primary">No complaints submitted</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                  If you experience price gouging, delay, or quality issues with any tanker delivery, submit a report here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {complaints.map((c) => (
                  <div key={c.id} className="p-5 hover:bg-muted/30 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">Ticket #{c.id}</span>
                          {c.orderId && c.orderId !== "GENERAL" && (
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                              Order: {c.orderId}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • {c.type}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/85 mt-2 leading-relaxed">
                          {c.description}
                        </p>
                        {c.createdAt && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <StatusBadge
                          status={c.status === "resolved" ? "delivered" : "pending"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ADMIN COMPLAINTS VIEW
// ==========================================
function AdminComplaintsView() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const sync = async () => {
    const data = await getComplaints();
    setItems(data);
  };

  useEffect(() => {
    sync();
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    await resolveComplaint(id);
    await sync();
    setResolvingId(null);
  };

  const pending = items.filter((c) => c.status === "pending").length;
  const resolved = items.filter((c) => c.status === "resolved").length;

  const filteredItems = items.filter((c) => {
    if (filter === "pending") return c.status === "pending";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Complaints Administration"
        subtitle="Customer-filed grievances and tanker mafia violations across the Karachi network"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Pending Action" value={pending} tone="warning" />
        <Stat label="Resolved" value={resolved} tone="success" />
        <Stat label="Total Received" value={items.length} tone="primary" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold text-primary">Filter:</span>
            <div className="flex gap-1.5">
              {(["all", "pending", "resolved"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {items.length} complaints
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <MessageSquareWarning className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-bold text-primary">No complaints in this view</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All grievances filed by citizens will appear in this administrative list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Ticket ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Customer / Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Description</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-5 py-3.5 font-bold text-primary">#{c.id}</td>
                    <td className="px-5 py-3.5">
                      {c.orderId && c.orderId !== "GENERAL" ? (
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          {c.orderId}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">General</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-primary">{c.customer || "Citizen"}</div>
                      <div className="text-xs text-muted-foreground">{c.userEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{c.type}</td>
                    <td className="px-5 py-3.5 max-w-sm truncate" title={c.description}>
                      {c.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status === "resolved" ? "delivered" : "pending"} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {c.status === "pending" ? (
                        <button
                          disabled={resolvingId === c.id}
                          onClick={() => handleResolve(c.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-bold hover:bg-success/25 disabled:opacity-50 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {resolvingId === c.id ? "Resolving…" : "Mark Resolved"}
                        </button>
                      ) : (
                        <span className="text-xs text-success font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                        </span>
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