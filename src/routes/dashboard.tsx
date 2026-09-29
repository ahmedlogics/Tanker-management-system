import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { Truck, ClipboardList, Droplets, TrendingUp, Activity, ArrowUpRight } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { API_URL } from "@/lib/tmms-store";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TMMS Pakistan" },
      { name: "description", content: "Live overview of tanker operations, orders, and water delivery across Karachi." },
      { property: "og:title", content: "TMMS Operations Dashboard" },
      { property: "og:description", content: "Live overview of tanker operations across Karachi." },
    ],
  }),
  component: DashboardPage,
});

import { useEffect, useState } from "react";

type StatCards = {
  totalOrders: string;
  activeTankers: string;
  waterDelivered: string;
  totalUsers: string;
};

const initialStats: StatCards = {
  totalOrders: "48,210",
  activeTankers: "1,084",
  waterDelivered: "186 ML",
  totalUsers: "32,540",
};

const initialMonthly = [
  { m: "Jan", orders: 3200, water: 1.8 },
  { m: "Feb", orders: 3850, water: 2.1 },
  { m: "Mar", orders: 4200, water: 2.4 },
  { m: "Apr", orders: 5100, water: 2.9 },
  { m: "May", orders: 6200, water: 3.6 },
  { m: "Jun", orders: 7400, water: 4.4 },
  { m: "Jul", orders: 7900, water: 4.8 },
  { m: "Aug", orders: 7100, water: 4.2 },
  { m: "Sep", orders: 6300, water: 3.7 },
];

const initialHydrants = [
  { name: "Safoora", uses: 312 },
  { name: "Sakhi Hassan", uses: 286 },
  { name: "Manghopir", uses: 254 },
  { name: "Pipri", uses: 198 },
  { name: "NIPA", uses: 176 },
  { name: "Korangi", uses: 142 },
];

const initialTankerStatus = [
  {"name": "Available", "value": 612, "color": "var(--success)"},
  {"name": "Busy", "value": 384, "color": "var(--accent)"},
  {"name": "Offline", "value": 88, "color": "var(--muted-foreground)"},
];

const initialRecent = [
  { id: "ORD-49021", area: "Gulshan-e-Iqbal", capacity: "5,000 L", tanker: "TMK-1138", status: "in_transit" as const, time: "12 min ago" },
  { id: "ORD-49020", area: "DHA Phase 6", capacity: "8,000 L", tanker: "TMK-0942", status: "delivered" as const, time: "28 min ago" },
  { id: "ORD-49019", area: "North Nazimabad", capacity: "3,000 L", tanker: "TMK-2207", status: "pending" as const, time: "41 min ago" },
  { id: "ORD-49018", area: "Korangi", capacity: "5,000 L", tanker: "TMK-1810", status: "delivered" as const, time: "1 hr ago" },
  { id: "ORD-49017", area: "Malir", capacity: "10,000 L", tanker: "TMK-0455", status: "cancelled" as const, time: "1 hr ago" },
];

function DashboardPage() {
  const { ok } = useRoleGuard(["admin"]);
  const [stats, setStats] = useState<StatCards>(initialStats);
  const [recent, setRecent] = useState(initialRecent);
  const [tankerStatus, setTankerStatus] = useState(initialTankerStatus);
  const [hydrants, setHydrants] = useState(initialHydrants);
  const [monthly, setMonthly] = useState(initialMonthly);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/stats`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.recent && Array.isArray(data.recent)) setRecent(data.recent);
          if (data.tankerStatus && Array.isArray(data.tankerStatus)) setTankerStatus(data.tankerStatus);
          if (data.hydrants && Array.isArray(data.hydrants)) setHydrants(data.hydrants);
          if (data.monthly && Array.isArray(data.monthly)) setMonthly(data.monthly);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats API:", err);
      }
    };
    fetchStats();
  }, []);

  if (!ok) return null;
  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader
          title="Operations Dashboard"
          subtitle="Live overview — Karachi region"
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live API Sync
            </div>
          }
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ClipboardList, label: "Total Orders", value: stats.totalOrders, trend: "+12.4%", color: "secondary" },
            { icon: Truck, label: "Active Tankers", value: stats.activeTankers, trend: "+3.1%", color: "accent" },
            { icon: Droplets, label: "Water Delivered", value: stats.waterDelivered, trend: "+18.7%", color: "primary" },
            { icon: Activity, label: "Total Users", value: stats.totalUsers, trend: "+5.2%", color: "success" },
          ].map((c, i) => (
            <div
              key={c.label}
              className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-elegant transition animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center bg-${c.color}/10`}>
                  <c.icon className={`h-5 w-5 text-${c.color}`} />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                  <ArrowUpRight className="h-3 w-3" /> {c.trend}
                </span>
              </div>
              <div className="mt-4 text-3xl font-black text-primary">{c.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-primary">Monthly Orders & Water</h3>
                <p className="text-xs text-muted-foreground">Last 9 months</p>
              </div>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="orders" stroke="var(--secondary)" fill="url(#g1)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="water" stroke="var(--accent)" fill="url(#g2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h3 className="font-bold text-primary">Tanker Status</h3>
            <p className="text-xs text-muted-foreground mb-2">Fleet breakdown</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tankerStatus} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {tankerStatus.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(v) => <span className="text-xs text-foreground">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-primary">Hydrant Usage</h3>
                <p className="text-xs text-muted-foreground">Withdrawals this week</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hydrants}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="uses" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h3 className="font-bold text-primary mb-1">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Latest 5 orders</p>
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-muted/60 transition">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-primary truncate">{r.area}</div>
                    <div className="text-xs text-muted-foreground">{r.id} • {r.time}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
