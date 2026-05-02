export function StatusBadge({
  status,
}: {
  status: "available" | "busy" | "offline" | "pending" | "delivered" | "in_transit" | "cancelled" | "paid" | "unpaid" | "overdue";
}) {
  const map: Record<string, { label: string; cls: string }> = {
    available: { label: "Available", cls: "bg-success/15 text-success border-success/30" },
    busy: { label: "Busy", cls: "bg-accent/15 text-accent border-accent/30" },
    offline: { label: "Offline", cls: "bg-muted text-muted-foreground border-border" },
    pending: { label: "Pending", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
    in_transit: { label: "In Transit", cls: "bg-secondary/20 text-primary border-secondary/40" },
    delivered: { label: "Delivered", cls: "bg-success/15 text-success border-success/30" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    paid: { label: "Paid", cls: "bg-success/15 text-success border-success/30" },
    unpaid: { label: "Unpaid", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
    overdue: { label: "Overdue", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const v = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${v.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {v.label}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 animate-fade-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
