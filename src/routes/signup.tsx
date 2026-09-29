import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplets, ArrowRight, Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { signUp } from "@/lib/tmms-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Customer Registration — TMMS" },
      { name: "description", content: "Create your customer account to book water tankers in Karachi." },
    ],
  }),
  component: SignUpPage,
});

export function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Track user interaction per field so errors/checks only show when interacted or submitted
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateField = (field: string, val: string, allValues?: { password?: string; confirmPassword?: string }) => {
    let err = "";
    if (field === "fullName") {
      const trimmed = val.trim();
      if (!trimmed) err = "Full name is required.";
      else if (trimmed.length < 3) err = "Full name must be at least 3 characters.";
      else if (!/^[a-zA-Z\s'.]+$/.test(trimmed)) err = "Full name can only contain letters and spaces.";
    } else if (field === "phone") {
      const clean = val.trim().replace(/[\s-]/g, "");
      if (!val.trim()) err = "Phone number is required.";
      else if (!/^(\+92|0)?3[0-9]{9}$/.test(clean) && clean.length < 10) {
        err = "Enter a valid Pakistani mobile number (e.g. 0300 1234567).";
      }
    } else if (field === "email") {
      const trimmed = val.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed) err = "Email address is required.";
      else if (!emailRegex.test(trimmed)) err = "Please enter a valid email address (e.g. user@example.com).";
    } else if (field === "password") {
      if (!val) err = "Password is required.";
      else if (val.length < 6) err = "Password must be at least 6 characters.";
    } else if (field === "confirmPassword") {
      const pwd = allValues?.password ?? password;
      if (!val) err = "Please confirm your password.";
      else if (val !== pwd) err = "Passwords do not match.";
    }
    return err;
  };

  const validateAll = () => {
    const errs: Record<string, string> = {};
    const e1 = validateField("fullName", fullName);
    if (e1) errs.fullName = e1;
    const e2 = validateField("phone", phone);
    if (e2) errs.phone = e2;
    const e3 = validateField("email", email);
    if (e3) errs.email = e3;
    const e4 = validateField("password", password);
    if (e4) errs.password = e4;
    const e5 = validateField("confirmPassword", confirmPassword, { password });
    if (e5) errs.confirmPassword = e5;

    setErrors(errs);
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    let val = "";
    if (field === "fullName") val = fullName;
    else if (field === "phone") val = phone;
    else if (field === "email") val = email;
    else if (field === "password") val = password;
    else if (field === "confirmPassword") val = confirmPassword;

    const err = validateField(field, val, { password, confirmPassword });
    setErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const r = await signUp({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "customer", // Registration is strictly customer only
      });

      if (!r.ok) {
        const errorMsg = r.error ?? "Registration failed. Please try again.";
        setServerError(errorMsg);
        if (errorMsg.toLowerCase().includes("email") || errorMsg.toLowerCase().includes("registered")) {
          setErrors((prev) => ({ ...prev, email: errorMsg }));
          setTouched((prev) => ({ ...prev, email: true }));
        }
        setSubmitting(false);
        return;
      }

      navigate({ to: "/my-orders" });
    } catch {
      setServerError("Unable to connect to server. Please ensure the backend is running.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand side */}
      <div className="hidden lg:block relative gradient-hero">
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-elegant">
              <Droplets className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-black text-lg">TMMS</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Karachi Water Network</div>
            </div>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Customer Registration Portal
            </div>
            <h2 className="text-4xl font-black leading-tight text-balance">
              Official Water Tanker Booking & Delivery Verification.
            </h2>
            <p className="mt-3 text-white/80 max-w-md text-sm leading-relaxed">
              Create your verified citizen account to request tankers at government-regulated rates, monitor delivery routes, and track payments.
            </p>
          </div>
          <div className="text-xs text-white/60">
            © {new Date().getFullYear()} TMMS — Karachi Water & Sewerage Corporation
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <form onSubmit={submit} className="w-full max-w-md animate-fade-up" autoComplete="off" noValidate>
          {/* Hidden inputs to absorb browser password-manager autofill heuristics */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="fake_username_autofill_prevent" tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_password_autofill_prevent" tabIndex={-1} autoComplete="new-password" />
          </div>

          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6 text-primary">
            <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center">
              <Droplets className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-black text-lg">TMMS</span>
          </Link>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Customer Registration
            </span>
            <h1 className="text-3xl font-black text-primary tracking-tight mt-2">Create Account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign up as a customer to order and manage water tankers.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/30 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Issue</p>
                <p className="text-xs mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <ValidatedField
              id="signup-fullname"
              name="signup_customer_name"
              icon={UserIcon}
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(v) => {
                setFullName(v);
                if (touched.fullName) {
                  const err = validateField("fullName", v);
                  setErrors((prev) => ({ ...prev, fullName: err }));
                }
              }}
              onBlur={() => handleBlur("fullName")}
              placeholder="e.g. Ahmed Raza"
              error={touched.fullName ? errors.fullName : undefined}
              isTouched={touched.fullName}
              autoComplete="off"
            />

            {/* Phone Number */}
            <ValidatedField
              id="signup-phone"
              name="signup_customer_phone"
              icon={Phone}
              label="Mobile Number"
              type="tel"
              value={phone}
              onChange={(v) => {
                setPhone(v);
                if (touched.phone) {
                  const err = validateField("phone", v);
                  setErrors((prev) => ({ ...prev, phone: err }));
                }
              }}
              onBlur={() => handleBlur("phone")}
              placeholder="0300 1234567"
              error={touched.phone ? errors.phone : undefined}
              isTouched={touched.phone}
              autoComplete="off"
            />

            {/* Email Address */}
            <ValidatedField
              id="signup-email"
              name="signup_customer_unique_email"
              icon={Mail}
              label="Email Address"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (touched.email) {
                  const err = validateField("email", v);
                  setErrors((prev) => ({ ...prev, email: err }));
                }
              }}
              onBlur={() => handleBlur("email")}
              placeholder="ahmed@example.com"
              error={touched.email ? errors.email : undefined}
              isTouched={touched.email}
              autoComplete="off"
            />

            {/* Password */}
            <ValidatedField
              id="signup-password"
              name="signup_customer_new_password"
              icon={Lock}
              label="Password"
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                if (touched.password) {
                  const err = validateField("password", v);
                  setErrors((prev) => ({ ...prev, password: err }));
                }
                if (touched.confirmPassword && confirmPassword) {
                  const matchErr = validateField("confirmPassword", confirmPassword, { password: v });
                  setErrors((prev) => ({ ...prev, confirmPassword: matchErr }));
                }
              }}
              onBlur={() => handleBlur("password")}
              placeholder="At least 6 characters"
              error={touched.password ? errors.password : undefined}
              isTouched={touched.password}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <ValidatedField
              id="signup-confirm-password"
              name="signup_customer_confirm_password"
              icon={Lock}
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                if (touched.confirmPassword) {
                  const err = validateField("confirmPassword", v, { password });
                  setErrors((prev) => ({ ...prev, confirmPassword: err }));
                }
              }}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Re-enter your password"
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              isTouched={touched.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-accent text-accent-foreground font-bold shadow-elegant hover:translate-y-[-1px] disabled:opacity-50 transition"
          >
            {submitting ? "Creating Account…" : "Register as Customer"} <ArrowRight className="h-4 w-4" />
          </button>

          {/* Admin notice */}
          <div className="mt-5 p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>Are you a TMMS Admin?</span>
            <Link to="/signin" className="font-bold text-primary hover:text-secondary underline">
              Admin Sign In
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground text-center">
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

function ValidatedField({
  id,
  name,
  icon: Icon,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  isTouched,
  autoComplete = "off",
}: {
  id?: string;
  name?: string;
  icon: React.ElementType;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  isTouched?: boolean;
  autoComplete?: string;
}) {
  const isValid = isTouched && !error && value.trim().length > 0;
  const isInvalid = isTouched && Boolean(error);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-foreground/80 mb-1">
        {label} *
      </label>
      <div className="relative">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isInvalid ? "text-destructive" : "text-muted-foreground"}`} />
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          data-lpignore="true"
          className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-sm transition outline-none border ${
            isInvalid
              ? "border-destructive bg-destructive/5 text-destructive focus:ring-1 focus:ring-destructive"
              : isValid
              ? "border-emerald-500/60 bg-emerald-500/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              : "border-border bg-card focus:border-secondary focus:ring-1 focus:ring-secondary/20"
          }`}
        />
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
        )}
      </div>
      {isInvalid && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 font-medium animate-fadeIn">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
