import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Wallet, TrendingUp, Receipt, AlertCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — TMMS" },
      { name: "description", content: "Revenue and payment history for water tanker deliveries across Karachi." },
      { property: "og:title", content: "Payments — TMMS" },
      { property: "og:description", content: "Revenue and payment history for water tanker deliveries." },
    ],
  }),
  component: PaymentsPage,
});

type PS = "paid" | "unpaid" | "overdue";
const payments: { id: string; order: string; customer: string; date: string; method: string; status: PS; amount: string }[] = [
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
  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader title="Payments" subtitle="Revenue & payment history across the network" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Wallet, l: "Revenue (Month)", v: "₨ 24.6 M", c: "secondary" },
            { icon: TrendingUp, l: "Revenue (Today)", v: "₨ 712 K", c: "accent" },
            { icon: Receipt, l: "Receipts Issued", v: "1,248", c: "primary" },
            { icon: AlertCircle, l: "Outstanding", v: "₨ 184 K", c: "destructive" },
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
              <h3 className="font-bold text-primary">Weekly Revenue</h3>
              <p className="text-xs text-muted-foreground">In ₨ lakhs (PKR)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
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
            <h3 className="font-bold text-primary">Payment History</h3>
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
                {payments.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/40 transition animate-fade-up"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-5 py-3.5 font-bold text-primary">{p.id}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.order}</td>
                    <td className="px-5 py-3.5">{p.customer}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.date}</td>
                    <td className="px-5 py-3.5">{p.method}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary">{p.amount}</td>
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
