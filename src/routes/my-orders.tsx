import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { useEffect, useMemo, useState } from "react";
import {
  getBookings,
  currentUser,
  addComplaint,
  type Booking,
} from "@/lib/tmms-store";
import { Plus, MessageSquareWarning, Clock, X, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/my-orders")({
  head: () => ({
    meta: [
      { title: "My Orders — TMMS" },
      { name: "description", content: "Track your tanker bookings and file complaints on TMMS." },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaintFor, setComplaintFor] = useState<Booking | null>(null);

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    if (!u) {
      navigate({ to: "/signin" });
      return;
    }
    if (u.role === "admin") {
      navigate({ to: "/dashboard" });
      return;
    }
    const sync = () => setBookings(getBookings());
    sync();
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, [navigate]);

  const mine = useMemo(
    () => (user ? bookings.filter((b) => b.userEmail === user.email) : []),
    [bookings, user],
  );

  const counts = useMemo(() => {
    const c = { pending: 0, in_transit: 0, delivered: 0, cancelled: 0 };
    mine.forEach((o) => (c[o.status] += 1));
    return c;
  }, [mine]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader
          title="My Orders"
          subtitle="Your tanker bookings and delivery status"
          action={
            <Link
              to="/book-tanker"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition"
            >
              <Plus className="h-4 w-4" /> Book Tanker
            </Link>
          }
        />

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

        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {mine.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-bold text-primary">No orders yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Book your first tanker to get started.
              </p>
              <Link
                to="/book-tanker"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant"
              >
                <Plus className="h-4 w-4" /> Book a Tanker
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                    <th className="text-left px-5 py-3 font-semibold">Area</th>
                    <th className="text-left px-5 py-3 font-semibold">Address</th>
                    <th className="text-left px-5 py-3 font-semibold">Size</th>
                    <th className="text-left px-5 py-3 font-semibold">ETA</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Amount</th>
                    <th className="text-right px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((o, i) => (
                    <tr
                      key={o.id}
                      className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3.5 font-bold text-primary">{o.id}</td>
                      <td className="px-5 py-3.5">{o.area}</td>
                      <td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate" title={o.address}>
                        {o.address}
                      </td>
                      <td className="px-5 py-3.5">{o.size} L</td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {o.eta}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                      <td className="px-5 py-3.5 text-right font-bold text-primary">
                        ₨ {o.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setComplaintFor(o)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition"
                        >
                          <MessageSquareWarning className="h-3.5 w-3.5" /> Complaint
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {complaintFor && (
        <ComplaintModal booking={complaintFor} onClose={() => setComplaintFor(null)} />
      )}
    </AppShell>
  );
}

function ComplaintModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [type, setType] = useState<"Late Delivery" | "Overcharging" | "No Delivery" | "Other">("Late Delivery");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = currentUser();
    addComplaint({
      orderId: booking.id,
      userEmail: u?.email ?? "guest@tmms",
      customer: u?.fullName ?? booking.customer,
      type,
      description,
    });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card rounded-2xl border border-border shadow-elegant w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black text-primary">File a Complaint</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Order {booking.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-6 text-center py-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
              <MessageSquareWarning className="h-6 w-6 text-success" />
            </div>
            <h4 className="mt-4 font-bold text-primary">Complaint Submitted</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Your complaint has been logged with TMMS administration.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2.5 rounded-lg gradient-accent text-accent-foreground font-bold text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Complaint Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm font-medium"
              >
                <option>Late Delivery</option>
                <option>Overcharging</option>
                <option>No Delivery</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Description</span>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail…"
                className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm resize-none"
              />
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-muted font-bold text-sm hover:bg-card transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg gradient-accent text-accent-foreground font-bold text-sm shadow-elegant"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
