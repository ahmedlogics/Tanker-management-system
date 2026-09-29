import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Droplets,
  Truck,
  ShieldCheck,
  Activity,
  MapPin,
  ArrowRight,
  ChartBar,
  Clock,
  Users,
} from "lucide-react";
import heroTanker from "@/assets/hero-tanker.jpg";
import hydrant from "@/assets/hydrant-station.jpg";
import delivery from "@/assets/delivery-scene.jpg";

import { currentUser, signOut, type User } from "@/lib/tmms-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TMMS — Smart Water Tanker Management System Pakistan" },
      {
        name: "description",
        content:
          "A smart system to manage and monitor water tanker operations in Pakistan, ensuring transparency and efficiency in Karachi and beyond.",
      },
      { name: "keywords", content: "Water tanker system Pakistan, Tanker management Karachi, Water supply monitoring system" },
      { property: "og:title", content: "TMMS — Tanker Mafia Management System" },
      { property: "og:description", content: "Smart monitoring of water tanker operations in urban Pakistan." },
      { property: "og:image", content: heroTanker },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const slides = [
  { src: heroTanker, alt: "Water tanker in Karachi street", caption: "Karachi's lifeline on wheels" },
  { src: hydrant, alt: "Hydrant water filling station Pakistan", caption: "Monitored hydrant operations" },
  { src: delivery, alt: "Tanker delivering water to residents in Pakistan", caption: "Last-mile delivery, transparent" },
];

function HomePage() {
  const [slide, setSlide] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(currentUser());
    const sync = () => setUser(currentUser());
    window.addEventListener("tmms-store", sync);
    return () => window.removeEventListener("tmms-store", sync);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="container-tmms flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-elegant">
              <Droplets className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-black tracking-tight">TMMS</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Pakistan</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/90">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#problem" className="hover:text-white">The Problem</a>
            <a href="#stats" className="hover:text-white">Stats</a>
            <Link to="/book-tanker" className="hover:text-white">Book Tanker</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={user.role === "admin" ? "/dashboard" : "/my-orders"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-accent text-accent-foreground font-semibold text-sm shadow-elegant hover:opacity-95 transition"
                >
                  {user.role === "admin" ? "Admin Dashboard" : "My Orders"} <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setUser(null);
                  }}
                  className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold text-xs hover:bg-white/20 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-accent text-accent-foreground font-semibold text-sm shadow-elegant hover:opacity-95 transition"
                >
                  Sign Up <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero with slider */}
      <section className="relative min-h-[92vh] md:h-[92vh] md:min-h-[640px] w-full overflow-hidden">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt={s.alt}
            width={1920}
            height={1080}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent" />

        <div className="relative h-full container-tmms flex flex-col justify-center pt-24 md:pt-32 pb-12 text-white">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Real-time monitoring • Karachi
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-balance">
              Smart Monitoring of <span className="text-accent">Water Tanker</span> Operations
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Ensuring transparency and efficient water distribution in urban Pakistan — from hydrant
              to household, every drop accounted for.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-2px] transition"
              >
                Sign Up <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/20 transition"
              >
                Sign In
              </Link>
            </div>

            {/* Slide caption + dots */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-10 bg-accent" : "w-5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-white/70">{slides[slide].caption}</div>
            </div>
          </div>
        </div>

        {/* Floating stat card */}
        <div className="hidden lg:block absolute right-10 bottom-12 w-80 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-elegant animate-float">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active right now</div>
              <div className="font-bold text-primary">42 tankers in transit</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted">
              <div className="text-lg font-black text-primary">128</div>
              <div className="text-[10px] uppercase text-muted-foreground">Today</div>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <div className="text-lg font-black text-accent">14</div>
              <div className="text-[10px] uppercase text-muted-foreground">Hydrants</div>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <div className="text-lg font-black text-success">99%</div>
              <div className="text-[10px] uppercase text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section id="problem" className="py-20 md:py-28">
        <div className="container-tmms grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="text-accent font-bold text-sm uppercase tracking-wider">The crisis</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-primary leading-tight text-balance">
              Pakistan's cities run on tankers — but no one was watching.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              In Karachi alone, more than 12 million residents depend on private water tankers
              every week. Hydrants run unmetered, prices fluctuate without oversight, and the
              "tanker mafia" thrives in the gaps. TMMS replaces opacity with accountability.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Unregulated hydrant withdrawals",
                "No price transparency for end-users",
                "Zero traceability from source to delivery",
                "Manual logs, lost revenue, leaked supply",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-5 rounded-md bg-destructive/10 text-destructive flex items-center justify-center text-xs font-black">!</span>
                  <span className="text-foreground/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative animate-fade-up">
            <img
              src={delivery}
              alt="Hydrant water filling station Pakistan"
              loading="lazy"
              width={1280}
              height={832}
              className="rounded-2xl shadow-elegant w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-5 shadow-elegant border border-border w-56">
              <div className="text-3xl font-black text-accent">2,400+</div>
              <div className="text-xs text-muted-foreground mt-1">tankers operating daily across Karachi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/40">
        <div className="container-tmms">
          <div className="max-w-2xl mb-14 animate-fade-up">
            <span className="text-secondary font-bold text-sm uppercase tracking-wider">Capabilities</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-primary text-balance">
              Built for municipal-scale water operations.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Truck, title: "Tanker Fleet Tracking", desc: "Live status, capacity, and route history for every registered tanker." },
              { icon: MapPin, title: "Hydrant Monitoring", desc: "Volume and frequency of withdrawals at each filling station." },
              { icon: ShieldCheck, title: "Transparent Pricing", desc: "Standardized rates and digital receipts for every delivery." },
              { icon: ChartBar, title: "Analytics Dashboard", desc: "Order trends, revenue, and demand heatmaps by neighborhood." },
              { icon: Clock, title: "Order Lifecycle", desc: "From request to delivery — every step timestamped and auditable." },
              { icon: Users, title: "Citizen Portal", desc: "Residents place orders, track tankers, and rate service." },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all"
              >
                <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mt-5 font-bold text-lg text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 md:py-28 gradient-hero text-white">
        <div className="container-tmms">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-balance">
              The scale we're operating at.
            </h2>
            <p className="mt-4 text-white/80">Live numbers from the TMMS network across Sindh.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { v: "48,210", l: "Orders this month" },
              { v: "2,418", l: "Registered tankers" },
              { v: "186 ML", l: "Water delivered" },
              { v: "₨ 312M", l: "Revenue tracked" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl p-6 bg-white/10 backdrop-blur border border-white/15">
                <div className="text-3xl md:text-4xl font-black text-accent">{s.v}</div>
                <div className="text-sm text-white/75 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-14">
        <div className="container-tmms grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center">
                <Droplets className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="font-black">TMMS</div>
                <div className="text-[10px] uppercase tracking-widest opacity-70">Tanker Mafia Management System</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-sidebar-foreground/70 max-w-md">
              A municipal-grade water tanker monitoring platform built for Pakistani cities. Bringing
              transparency, accountability and efficiency to urban water supply.
            </p>
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-wider text-sidebar-foreground/60 mb-3">Platform</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-accent">Dashboard</Link></li>
              <li><Link to="/tankers" className="hover:text-accent">Tankers</Link></li>
              <li><Link to="/orders" className="hover:text-accent">Orders</Link></li>
              <li><Link to="/payments" className="hover:text-accent">Payments</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-wider text-sidebar-foreground/60 mb-3">Contact</div>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li>Karachi Water & Sewerage Board</li>
              <li>9th Mile, Karsaz Road, Karachi</li>
              <li>support@tmms.gov.pk</li>
              <li>UAN: 111-TMMS-PK</li>
            </ul>
          </div>
        </div>
        <div className="container-tmms mt-10 pt-6 border-t border-sidebar-border flex flex-col md:flex-row gap-3 justify-between text-xs text-sidebar-foreground/60">
          <div>© {new Date().getFullYear()} TMMS — Government of Sindh. All rights reserved.</div>
          <div>Built for the cities that run on tankers.</div>
        </div>
      </footer>
    </div>
  );
}
