// import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
// import { AppShell } from "@/components/AppShell";
// import { PageHeader } from "@/components/ui-bits";
// import { useEffect, useState } from "react";
// import {
//   currentUser,
//   getPendingBooking,
//   clearPendingBooking,
//   addBooking,
//   type PendingBooking,
//   type Booking,
// } from "@/lib/tmms-store";
// import {
//   Wallet,
//   Banknote,
//   Smartphone,
//   CheckCircle2,
//   ArrowRight,
//   MapPin,
//   Droplets,
//   Clock,
// } from "lucide-react";

// export const Route = createFileRoute("/payment")({
//   head: () => ({
//     meta: [
//       { title: "Payment — TMMS" },
//       { name: "description", content: "Confirm payment for your tanker booking on TMMS." },
//     ],
//   }),
//   component: PaymentPage,
// });

// type Method = "cash" | "easypaisa";

// function PaymentPage() {
//   const navigate = useNavigate();
//   const [pending, setPending] = useState<PendingBooking | null>(null);
//   const [method, setMethod] = useState<Method>("cash");
//   const [confirmed, setConfirmed] = useState<Booking | null>(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     const u = currentUser();
//     if (!u) {
//       navigate({ to: "/signin" });
//       return;
//     }
//     if (u.role === "admin") {
//       navigate({ to: "/dashboard" });
//       return;
//     }
//     const p = getPendingBooking();
//     if (!p) {
//       navigate({ to: "/book-tanker" });
//       return;
//     }
//     setPending(p);
//     setReady(true);
//   }, [navigate]);

//   const confirm = () => {
//     const u = currentUser();
//     if (!u || !pending) return;
//     const b = addBooking({
//       userEmail: u.email,
//       customer: u.fullName,
//       area: pending.area,
//       size: pending.size,
//       price: pending.price,
//       address: pending.address,
//       eta: pending.eta,
//     });
//     clearPendingBooking();
//     setConfirmed(b);
//   };

//   if (!ready || !pending) return null;

//   if (confirmed) {
//     return (
//       <AppShell>
//         <div className="p-4 md:p-8 max-w-3xl mx-auto">
//           <div className="bg-card rounded-2xl border border-border shadow-elegant p-8 md:p-12 animate-fade-up">
//             <div className="text-center">
//               <div className="mx-auto h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
//                 <CheckCircle2 className="h-8 w-8 text-success" />
//               </div>
//               <h2 className="mt-5 text-3xl font-black text-primary">Booking Confirmed</h2>
//               <p className="mt-2 text-muted-foreground">
//                 Order <span className="font-bold text-primary">{confirmed.id}</span> has been placed successfully.
//               </p>
//             </div>

//             <div className="mt-8 grid sm:grid-cols-2 gap-3">
//               <Stat label="Order ID" value={confirmed.id} />
//               <Stat label="Area" value={confirmed.area} />
//               <Stat label="Tanker Size" value={`${confirmed.size} L`} />
//               <Stat label="Estimated Delivery" value={confirmed.eta} />
//               <div className="sm:col-span-2 rounded-xl bg-muted p-4">
//                 <div className="text-xs uppercase tracking-wider text-muted-foreground">Full Address</div>
//                 <div className="mt-1 font-bold text-primary">{confirmed.address}</div>
//               </div>
//               <div className="sm:col-span-2 rounded-xl bg-accent/10 p-4 flex items-center justify-between">
//                 <span className="text-sm font-semibold text-primary">Amount Paid</span>
//                 <span className="text-2xl font-black text-accent">₨ {confirmed.price.toLocaleString()}</span>
//               </div>
//             </div>

//             <div className="mt-7 flex flex-wrap justify-center gap-3">
//               <Link
//                 to="/my-orders"
//                 className="inline-flex items-center gap-2 px-5 py-3 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant"
//               >
//                 View My Orders <ArrowRight className="h-4 w-4" />
//               </Link>
//               <Link
//                 to="/book-tanker"
//                 className="px-5 py-3 rounded-lg border border-border bg-muted font-bold hover:bg-card transition"
//               >
//                 Book Another
//               </Link>
//             </div>
//           </div>
//         </div>
//       </AppShell>
//     );
//   }

//   return (
//     <AppShell>
//       <div className="p-4 md:p-8">
//         <PageHeader title="Payment" subtitle="Review your order and confirm payment to dispatch your tanker" />

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Order summary */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-card rounded-2xl border border-border shadow-card p-6">
//               <h3 className="font-bold text-primary text-lg">Order Summary</h3>
//               <div className="mt-4 grid sm:grid-cols-2 gap-3">
//                 <SummaryItem icon={MapPin} label="Area" value={pending.area} />
//                 <SummaryItem icon={Droplets} label="Tanker Size" value={`${pending.size} Litres`} />
//                 <SummaryItem icon={Clock} label="Estimated Delivery" value={pending.eta} />
//                 <SummaryItem icon={Wallet} label="Amount" value={`₨ ${pending.price.toLocaleString()}`} />
//               </div>
//               <div className="mt-4 rounded-xl bg-muted p-4">
//                 <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Full Delivery Address</div>
//                 <div className="mt-1.5 text-foreground font-medium">{pending.address}</div>
//               </div>
//             </div>

//             <div className="bg-card rounded-2xl border border-border shadow-card p-6">
//               <h3 className="font-bold text-primary text-lg">Payment Method</h3>
//               <div className="mt-4 grid sm:grid-cols-2 gap-3">
//                 <MethodCard
//                   active={method === "cash"}
//                   onClick={() => setMethod("cash")}
//                   icon={Banknote}
//                   title="Cash on Delivery"
//                   desc="Pay the driver in cash on arrival"
//                 />
//                 <MethodCard
//                   active={method === "easypaisa"}
//                   onClick={() => setMethod("easypaisa")}
//                   icon={Smartphone}
//                   title="EasyPaisa"
//                   desc="Mock mobile wallet payment"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Total + confirm */}
//           <aside className="lg:sticky lg:top-20 h-fit bg-card rounded-2xl border border-border shadow-elegant p-6">
//             <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total Payable</div>
//             <div className="mt-2 text-4xl font-black text-accent">₨ {pending.price.toLocaleString()}</div>
//             <div className="mt-1 text-xs text-muted-foreground">
//               {method === "cash" ? "Cash on Delivery" : "EasyPaisa (mock)"}
//             </div>
//             <button
//               onClick={confirm}
//               className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition"
//             >
//               Confirm Payment <ArrowRight className="h-4 w-4" />
//             </button>
//             <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
//               Driver details will be shared once your order is dispatched.
//             </p>
//           </aside>
//         </div>
//       </div>
//     </AppShell>
//   );
// }

// function SummaryItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
//       <div className="h-9 w-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
//         <Icon className="h-4 w-4" />
//       </div>
//       <div className="min-w-0">
//         <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
//         <div className="font-bold text-primary truncate">{value}</div>
//       </div>
//     </div>
//   );
// }

// function MethodCard({
//   active,
//   onClick,
//   icon: Icon,
//   title,
//   desc,
// }: {
//   active: boolean;
//   onClick: () => void;
//   icon: React.ElementType;
//   title: string;
//   desc: string;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`text-left p-4 rounded-xl border-2 transition ${
//         active ? "border-secondary bg-secondary/10" : "border-border bg-muted hover:border-secondary/50"
//       }`}
//     >
//       <div className="flex items-center gap-3">
//         <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
//           <Icon className="h-5 w-5" />
//         </div>
//         <div>
//           <div className="font-bold text-primary">{title}</div>
//           <div className="text-xs text-muted-foreground">{desc}</div>
//         </div>
//       </div>
//     </button>
//   );
// }

// function Stat({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-xl bg-muted p-4">
//       <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
//       <div className="mt-1 font-bold text-primary">{value}</div>
//     </div>
//   );
// }
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui-bits";
import { useEffect, useState } from "react";
import {
  currentUser,
  getPendingBooking,
  clearPendingBooking,
  addBooking,
  type PendingBooking,
  type Booking,
} from "@/lib/tmms-store";
import {
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Droplets,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — TMMS" },
      { name: "description", content: "Confirm payment for your tanker booking on TMMS." },
    ],
  }),
  component: PaymentPage,
});

type Method = "cash" | "easypaisa";

function PaymentPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [method, setMethod] = useState<Method>("cash");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      navigate({ to: "/signin" });
      return;
    }
    if (u.role === "admin") {
      navigate({ to: "/dashboard" });
      return;
    }
    const p = getPendingBooking();
    if (!p) {
      navigate({ to: "/book-tanker" });
      return;
    }
    setPending(p);
    setReady(true);
  }, [navigate]);

  // Changed to async to await the Flask API response
  const confirm = async () => {
    const u = currentUser();
    if (!u || !pending) return;
    
    const b = await addBooking({
      userEmail: u.email,
      customer: u.fullName,
      area: pending.area,
      size: pending.size,
      price: pending.price,
      address: pending.address,
      eta: pending.eta,
    });
    
    if (b) {
      clearPendingBooking();
      setConfirmed(b);
    } else {
      alert("Error confirming booking. Please check your connection to the server.");
    }
  };

  if (!ready || !pending) return null;

  if (confirmed) {
    return (
      <AppShell>
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-elegant p-8 md:p-12 animate-fade-up">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="mt-5 text-3xl font-black text-primary">Booking Confirmed</h2>
              <p className="mt-2 text-muted-foreground">
                Order <span className="font-bold text-primary">{confirmed.id}</span> has been placed successfully.
              </p>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <Stat label="Order ID" value={confirmed.id} />
              <Stat label="Area" value={confirmed.area} />
              <Stat label="Tanker Size" value={`${confirmed.size || confirmed.tanker_size} L`} />
              <Stat label="Estimated Delivery" value={confirmed.eta} />
              <div className="sm:col-span-2 rounded-xl bg-muted p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Full Address</div>
                <div className="mt-1 font-bold text-primary">{confirmed.address}</div>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-accent/10 p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Amount Paid</span>
                <span className="text-2xl font-black text-accent">₨ {confirmed.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/my-orders"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant"
              >
                View My Orders <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/book-tanker"
                className="px-5 py-3 rounded-lg border border-border bg-muted font-bold hover:bg-card transition"
              >
                Book Another
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <PageHeader title="Payment" subtitle="Review your order and confirm payment to dispatch your tanker" />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-bold text-primary text-lg">Order Summary</h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <SummaryItem icon={MapPin} label="Area" value={pending.area} />
                <SummaryItem icon={Droplets} label="Tanker Size" value={`${pending.size} Litres`} />
                <SummaryItem icon={Clock} label="Estimated Delivery" value={pending.eta} />
                <SummaryItem icon={Wallet} label="Amount" value={`₨ ${pending.price.toLocaleString()}`} />
              </div>
              <div className="mt-4 rounded-xl bg-muted p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Full Delivery Address</div>
                <div className="mt-1.5 text-foreground font-medium">{pending.address}</div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-bold text-primary text-lg">Payment Method</h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <MethodCard
                  active={method === "cash"}
                  onClick={() => setMethod("cash")}
                  icon={Banknote}
                  title="Cash on Delivery"
                  desc="Pay the driver in cash on arrival"
                />
                <MethodCard
                  active={method === "easypaisa"}
                  onClick={() => setMethod("easypaisa")}
                  icon={Smartphone}
                  title="EasyPaisa"
                  desc="Mock mobile wallet payment"
                />
              </div>
            </div>
          </div>

          {/* Total + confirm */}
          <aside className="lg:sticky lg:top-20 h-fit bg-card rounded-2xl border border-border shadow-elegant p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total Payable</div>
            <div className="mt-2 text-4xl font-black text-accent">₨ {pending.price.toLocaleString()}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {method === "cash" ? "Cash on Delivery" : "EasyPaisa (mock)"}
            </div>
            <button
              onClick={confirm}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition"
            >
              Confirm Payment <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
              Driver details will be shared once your order is dispatched.
            </p>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
      <div className="h-9 w-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-bold text-primary truncate">{value}</div>
      </div>
    </div>
  );
}

function MethodCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition ${
        active ? "border-secondary bg-secondary/10" : "border-border bg-muted hover:border-secondary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-primary">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
    </button>
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