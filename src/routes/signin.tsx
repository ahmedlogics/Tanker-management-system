import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplets, ArrowRight, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { signIn } from "@/lib/tmms-store";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — TMMS" },
      { name: "description", content: "Sign in to TMMS to manage water tanker orders in Karachi." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signIn(email, password);
    if (!r.ok) return setError(r.error ?? "Sign in failed");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative gradient-hero">
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-elegant">
              <Droplets className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-black">TMMS</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Pakistan</div>
            </div>
          </Link>
          <div>
            <h2 className="text-4xl font-black leading-tight text-balance">
              Welcome back to <span className="text-accent">Karachi's</span> water network.
            </h2>
            <p className="mt-3 text-white/80 max-w-md">
              Track tanker orders, monitor deliveries, and keep every drop transparent.
            </p>
          </div>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} TMMS — Government of Sindh</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-md animate-fade-up">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 text-primary">
            <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center">
              <Droplets className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-black">TMMS</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">Sign In</h1>
          <p className="mt-2 text-muted-foreground">Access your TMMS dashboard.</p>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/30">
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4">
            <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          </div>

          <button
            type="submit"
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition"
          >
            Login <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-secondary hover:text-primary">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground/85">{label}</span>
      <div className="mt-1.5 relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 rounded-lg bg-muted border border-transparent focus:border-secondary focus:bg-card outline-none text-sm"
        />
      </div>
    </label>
  );
}
