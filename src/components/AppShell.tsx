import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  PackageCheck,
  Wallet,
  Home,
  Droplets,
  Menu,
  X,
  PlusCircle,
  MessageSquareWarning,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/tmms-store";

const customerNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/book-tanker", label: "Book Tanker", icon: PlusCircle },
  { to: "/my-orders", label: "My Orders", icon: ClipboardList },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
] as const;

const adminNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tankers", label: "Tankers", icon: Truck },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/deliveries", label: "Deliveries", icon: PackageCheck },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
] as const;

const guestNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/book-tanker", label: "Book Tanker", icon: PlusCircle },
] as const;

type NavItem = { to: string; label: string; icon: React.ElementType };

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AK";

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  const items: readonly NavItem[] = !user
    ? guestNav
    : user.role === "admin"
      ? adminNav
      : customerNav;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <SidebarInner path={path} items={items} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground lg:hidden animate-slide-in flex flex-col">
            <SidebarInner path={path} items={items} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3 shadow-sm">
          <button
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="h-8 w-8 rounded-md gradient-accent flex items-center justify-center">
              <Droplets className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-primary">TMMS</span>
          </Link>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-ring" />
            Live system • Karachi Region
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs text-muted-foreground">{user.role === "owner" ? "Tanker Owner" : "Customer"}</div>
                <div className="text-sm font-bold text-primary truncate max-w-[140px]">{user.fullName}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signin" className="text-sm font-bold text-primary hover:text-secondary px-3 py-1.5">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-bold px-3 py-1.5 rounded-lg gradient-accent text-accent-foreground shadow-elegant"
              >
                Sign Up
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  path,
  items,
  onNavigate,
}: {
  path: string;
  items: readonly NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center shadow-elegant">
            <Droplets className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-black text-base tracking-tight">TMMS</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Tanker Mafia MS
            </div>
          </div>
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="p-1.5 rounded hover:bg-sidebar-accent">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50 px-3 py-2">
          Operations
        </div>
        {items.map((item) => {
          const active =
            item.to === "/" ? path === "/" : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as never}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary-foreground/80" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-lg p-3 bg-sidebar-accent">
          <div className="text-xs text-sidebar-foreground/70">Water delivered today</div>
          <div className="text-2xl font-black text-sidebar-primary">2.4M L</div>
          <div className="text-[11px] text-sidebar-foreground/60 mt-0.5">Across 14 hydrants</div>
        </div>
      </div>
    </>
  );
}
