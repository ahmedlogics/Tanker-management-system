import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplets, ArrowRight, Mail, Lock, User as UserIcon, Phone } from "lucide-react";
import { useState } from "react";
import { signUp, type Role } from "@/lib/tmms-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — TMMS" },
      { name: "description", content: "Create your TMMS account to book water tankers in Karachi." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signUp({ fullName, phone, email, password, role });
    if (!r.ok) return setError(r.error ?? "Sign up failed");
    navigate({ to: role === "admin" ? "/dashboard" : "/my-orders" });
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
              Join the network bringing <span className="text-accent">transparency</span> to Karachi's water supply.
            </h2>
            <p className="mt-3 text-white/80 max-w-md">
              Register as a customer to order tankers, or as a tanker owner to operate within TMMS.
            </p>
          </div>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} TMMS — Government of Sindh</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-md animate-fade-up">
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">Sign Up</h1>
          <p className="mt-2 text-muted-foreground">Create your TMMS account.</p>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/30">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Field icon={UserIcon} label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="Ali Khan" />
            <Field icon={Phone} label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+92 300 1234567" />
            <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            <div>
              <span className="text-sm font-semibold text-foreground/85">Role</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["customer", "admin"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition ${
                      role === r
                        ? "border-secondary bg-secondary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    {r === "customer" ? "Customer" : "Admin"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] transition"
          >
            Create Account <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-secondary hover:text-primary">
              Sign In
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
