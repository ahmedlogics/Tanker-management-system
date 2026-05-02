import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui-bits";
import { useEffect, useMemo, useState } from "react";
import {
  KARACHI_AREAS,
  TANKER_PRICES,
  AREA_DAILY_LIMIT,
  getAreaUsage,
  estimateETA,
  addBooking,
  currentUser,
} from "@/lib/tmms-store";
import { Droplets, MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/book-tanker")({
  head: () => ({
    meta: [
      { title: "Book a Tanker — TMMS" },
      { name: "description", content: "Book a water tanker in Karachi with transparent pricing and live availability." },
    ],
  }),
  component: BookTankerPage,
});

function BookTankerPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser());
  const [area, setArea] = useState<string>(KARACHI_AREAS[0]);
  const [size, setSize] = useState<500 | 1000 | 2000>(1000);
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState<{ id: string; eta: string } | null>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/signin" });
  }, [user, navigate]);

  const usage = useMemo(() => getAreaUsage(area), [area, success]);
  const remaining = AREA_DAILY_LIMIT - usage;
  const price = TANKER_PRICES[size];
  const eta = estimateETA();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (remaining <= 0) return;
    const b = addBooking({
      userEmail: user.email,
      customer: user.fullName,
      area,
      size,
      price,
      address,
      eta,
    });
    setSuccess({ id: b.id, eta });
  };

  if (!user) return null;

  if (success) {
    return (
      <AppShell>
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-elegant p-8 md:p-12 text-center animate-fade-up">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mt-5 text-3xl font-black text-primary">Booking Confirmed</h2>
            <p className="mt-2 text-muted-foreground">
              Order <span className="font-bold text-primary">{success.id}</span> has been placed.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <Stat label="Area" value={area} />
              <Stat label="Tanker" value={`${size}L`} />
              <Stat label="ETA" value={success.eta} />
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant"
              >
                View Orders <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setSuccess(null)}
                className="px-5 py-3 rounded-lg border border-border bg-muted font-bold hover:bg-card transition"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader title="Book a Tanker" subtitle="Transparent pricing • Live availability • Karachi-wide" />

        <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Area */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <SectionTitle icon={MapPin} title="Delivery Area" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-3 w-full px-4 py-3 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm font-medium"
              >
                {KARACHI_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {/* Availability bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tankers remaining today in {area}</span>
                  <span className={`font-bold ${remaining <= 2 ? "text-destructive" : "text-success"}`}>
                    {Math.max(remaining, 0)}/{AREA_DAILY_LIMIT}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      remaining <= 2 ? "bg-destructive" : remaining <= 5 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${Math.max((remaining / AREA_DAILY_LIMIT) * 100, 0)}%` }}
                  />
                </div>
                {remaining <= 0 && (
                  <p className="mt-2 text-xs text-destructive font-semibold">
                    No tankers remaining for this area today. Try another area.
                  </p>
                )}
              </div>
            </div>

            {/* Size */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <SectionTitle icon={Droplets} title="Tanker Size" />
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                {([500, 1000, 2000] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSize(s)}
                    className={`text-left p-4 rounded-xl border-2 transition ${
                      size === s
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-muted hover:border-secondary/50"
                    }`}
                  >
                    <div className="text-2xl font-black text-primary">{s}L</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Capacity</div>
                    <div className="mt-3 text-sm font-bold text-accent">₨ {TANKER_PRICES[s].toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <SectionTitle icon={MapPin} title="Delivery Address" />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House # / Street / Block / Landmark"
                rows={3}
                className="mt-3 w-full px-4 py-3 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm resize-none"
              />
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 h-fit bg-card rounded-2xl border border-border shadow-elegant p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Booking Summary</div>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Area" value={area} />
              <Row label="Size" value={`${size} Litres`} />
              <Row
                label="Estimated Delivery"
                value={
                  <span className="inline-flex items-center gap-1 font-bold text-primary">
                    <Clock className="h-3.5 w-3.5" /> {eta}
                  </span>
                }
              />
              <Row label="Availability" value={`${Math.max(remaining, 0)}/${AREA_DAILY_LIMIT}`} />
            </div>
            <div className="mt-5 pt-5 border-t border-border flex items-end justify-between">
              <div className="text-sm text-muted-foreground">Total (Fixed)</div>
              <div className="text-3xl font-black text-accent">₨ {price.toLocaleString()}</div>
            </div>
            <button
              type="submit"
              disabled={remaining <= 0 || !address.trim()}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Confirm Booking <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
              Standard TMMS pricing applies. Driver details will be shared once dispatched.
            </p>
          </aside>
        </form>
      </div>
    </AppShell>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-bold text-primary">{title}</h3>
    </div>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-bold text-primary">{value}</div>
    </div>
  );
}
