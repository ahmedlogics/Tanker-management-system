import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import {
  Wallet,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  PlusCircle,
  ShieldCheck,
  Droplets,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState, useMemo } from "react";
import { currentUser, getBookings, type Booking, type User, API_URL } from "@/lib/tmms-store";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Invoices — TMMS" },
      { name: "description", content: "Payment history, invoices, and revenue records on TMMS." },
    ],
  }),
  component: PaymentsPage,
});

type PS = "paid" | "unpaid" | "overdue";
const adminPayments: { id: string; order: string; customer: string; date: string; method: string; status: PS; amount: string }[] = [
  { id: "PAY-9013", order: "ORD-49020", customer: "Hamza Tariq", date: "2025-05-02", method: "Easypaisa", status: "paid", amount: "₨ 6,800" },
  { id: "PAY-9012", order: "ORD-49018", customer: "Bilal Ahmed", date: "2025-05-01", method: "JazzCash", status: "paid", amount: "₨ 4,200" },
  { id: "PAY-9011", order: "ORD-49016", customer: "Mehwish Khan", date: "2025-05-01", method: "Cash", status: "paid", amount: "₨ 4,200" },
  { id: "PAY-9010", order: "ORD-49019", customer: "Sana Iqbal", date: "2025-05-02", method: "—", status: "unpaid", amount: "₨ 2,500" },
  { id: "PAY-9009", order: "ORD-49014", customer: "Zainab Raza", date: "2025-04-30", method: "—", status: "unpaid", amount: "₨ 6,800" },
  { id: "PAY-9008", order: "ORD-49011", customer: "Tariq Mehmood", date: "2025-04-25", method: "—", status: "overdue", amount: "₨ 8,500" },
  { id: "PAY-9007", order: "ORD-49013", customer: "Kashif Mir", date: "2025-04-30", method: "Bank Transfer", status: "paid", amount: "₨ 4,200" },
  { id: "PAY-9006", order: "ORD-49015", customer: "Usman Ghani", date: "2025-04-30", method: "Cash", status: "paid", amount: "₨ 2,500" },
];

const revenueData = [
  { d: "Mon", v: 38 }, { d: "Tue", v: 52 }, { d: "Wed", v: 47 }, { d: "Thu", v: 61 },
  { d: "Fri", v: 78 }, { d: "Sat", v: 85 }, { d: "Sun", v: 71 },
];

function PaymentsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(currentUser());
  }, []);

  return (
    <AppShell>
      {user?.role === "admin" ? (
        <AdminPaymentsView />
      ) : (
        <CustomerPaymentsView user={user} />
      )}
    </AppShell>
  );
}

// ==========================================
// 1. CUSTOMER PAYMENTS & RECEIPTS VIEW
// ==========================================
function CustomerPaymentsView({ user }: { user: User | null }) {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const data = await getBookings(user.email);
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const sync = () => fetchOrders();
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, [user]);

  // Financial calculations for this customer
  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.price || 0), 0);
  }, [orders]);

  const pendingPayable = useMemo(() => {
    return orders
      .filter((o) => o.status === "pending" || o.status === "in_transit")
      .reduce((sum, o) => sum + (o.price || 0), 0);
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.status === "delivered").length;
  }, [orders]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="My Payments & Invoices"
        subtitle={`Official payment history and digital receipts for ${user?.fullName || "Citizen"}`}
        action={
          <Link
            to="/book-tanker"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition text-sm"
          >
            <PlusCircle className="h-4 w-4" /> Book Tanker
          </Link>
        }
      />

      {/* Customer summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center mb-3">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="text-2xl font-black text-primary">₨ {totalSpent.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Paid (Delivered)</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-3">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-2xl font-black text-warning">₨ {pendingPayable.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Payable on Delivery</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="text-2xl font-black text-primary">{orders.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Invoices Issued</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-2xl font-black text-secondary">Verified</div>
          <div className="text-xs text-muted-foreground mt-0.5">Govt Regulated Tariff</div>
        </div>
      </div>

      {/* Customer Receipts Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary">Payment & Receipt Ledger</h3>
            <p className="text-xs text-muted-foreground">Every tanker delivery generates an official digital tax receipt</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            Loading your payment history…
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-bold text-primary">No payment history yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't placed any tanker orders yet. Once you book a tanker, all payment slips and receipts will be stored here.
            </p>
            <Link
              to="/book-tanker"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm shadow-elegant"
            >
              <PlusCircle className="h-4 w-4" /> Book Your First Tanker
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Receipt #</th>
                  <th className="text-left px-5 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Area & Capacity</th>
                  <th className="text-left px-5 py-3 font-semibold">Booking Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Payment Mode</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const isPaid = o.status === "delivered";
                  const receiptNo = `REC-${o.id.replace("ORD-", "")}`;
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3.5 font-bold text-primary">{receiptNo}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-semibold">
                          {o.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-primary">{o.area}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.size || o.tanker_size} Gallons Tanker
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recent"}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          Cash on Delivery
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPaid
                              ? "bg-success/15 text-success"
                              : o.status === "cancelled"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-warning/15 text-warning"
                          }`}
                        >
                          {isPaid ? "Paid" : o.status === "cancelled" ? "Cancelled" : "Due on Arrival"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-primary">
                        ₨ {(o.price || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(o)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Receipt Modal */}
      {selectedReceipt && (
        <CustomerReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

// Receipt Modal for customer
function CustomerReceiptModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const receiptNo = `REC-${booking.id.replace("ORD-", "")}`;
  const isPaid = booking.status === "delivered";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">
        {/* Modal Top Bar */}
        <div className="bg-muted px-6 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-secondary" />
            <span className="font-bold text-sm text-primary">Official Payment Receipt</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-card">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center pb-4 border-b border-dashed border-border">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Government of Sindh • KW&SC
            </span>
            <h2 className="text-xl font-black text-primary mt-1">Tanker Mafia Management System</h2>
            <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {receiptNo}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Customer:</span>
              <span className="font-bold text-primary">{booking.customer || "Citizen"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Order Reference:</span>
              <span className="font-bold text-primary">{booking.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Delivery Area:</span>
              <span className="font-bold text-primary">{booking.area}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Tanker Volume:</span>
              <span className="font-bold text-primary">{booking.size || booking.tanker_size} Gallons</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block">Delivery Address:</span>
              <span className="font-medium text-primary">{booking.address}</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex justify-between text-xs py-1">
              <span className="text-muted-foreground">Official Water Tariff</span>
              <span className="font-semibold">₨ {(booking.price || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-muted-foreground">Service & GPS Monitoring</span>
              <span className="font-semibold text-success">Included</span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-black text-primary">
              <span>Total Payable</span>
              <span>₨ {(booking.price || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-success/10 border border-success/30 text-success">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {isPaid ? "Payment Verified (Delivered)" : "Cash on Delivery (Pay to verified driver)"}
            </span>
            <span className="font-bold uppercase tracking-wider">{isPaid ? "PAID" : "DUE"}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm text-primary hover:bg-muted transition"
            >
              <Printer className="h-4 w-4" /> Print / Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm shadow-elegant"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ADMIN PAYMENTS & REVENUE VIEW
// ==========================================
function AdminPaymentsView() {
  const [data, setData] = useState({
    revenueMonth: "₨ 24.6 M",
    revenueToday: "₨ 712 K",
    receiptsIssued: 1248,
    outstanding: "₨ 184 K",
    weekly: revenueData,
    payments: adminPayments,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_URL}/payments`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load admin payments API:", err);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Network Revenue & Payments"
        subtitle="Revenue & payment history across all hydrants in Karachi"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Wallet, l: "Revenue (Month)", v: data.revenueMonth, c: "secondary" },
          { icon: TrendingUp, l: "Revenue (Today)", v: data.revenueToday, c: "accent" },
          { icon: Receipt, l: "Receipts Issued", v: String(data.receiptsIssued), c: "primary" },
          { icon: AlertCircle, l: "Outstanding", v: data.outstanding, c: "destructive" },
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

      <div className="bg-card rounded-2xl p-6 border border-border shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-primary">Weekly Revenue Across Hydrants</h3>
            <p className="text-xs text-muted-foreground">In ₨ lakhs (PKR)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.weekly || revenueData}>
            <defs>
              <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
            <Area type="monotone" dataKey="v" stroke="var(--accent)" fill="url(#revG)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-primary">Network-Wide Payment Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Receipt</th>
                <th className="text-left px-5 py-3 font-semibold">Order</th>
                <th className="text-left px-5 py-3 font-semibold">Customer</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Method</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <td className="px-5 py-3.5 font-bold text-primary">{p.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-semibold">{p.order}</span>
                  </td>
                  <td className="px-5 py-3.5">{p.customer}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3.5">{p.method}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status === "paid" ? "delivered" : "pending"} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-primary">{p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
