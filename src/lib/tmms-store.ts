// Simple localStorage-backed mock store for auth, bookings, and complaints.
// Frontend-only — preserves design without requiring a backend.

export type Role = "customer" | "admin" | "owner";
export type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string; // mock only
  role: Role;
};

export type Booking = {
  id: string;
  userEmail: string;
  customer: string;
  area: string;
  size: 500 | 1000 | 2000;
  price: number;
  address: string;
  eta: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  createdAt: string;
};

export type Complaint = {
  id: string;
  orderId: string;
  userEmail: string;
  customer: string;
  type: "Late Delivery" | "Overcharging" | "No Delivery" | "Other";
  description: string;
  status: "pending" | "resolved";
  createdAt: string;
};

const K_USERS = "tmms_users";
const K_SESSION = "tmms_session";
const K_BOOKINGS = "tmms_bookings";
const K_COMPLAINTS = "tmms_complaints";

const isClient = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("tmms-store"));
}

// Pricing (PKR)
export const TANKER_PRICES: Record<500 | 1000 | 2000, number> = {
  500: 1500,
  1000: 2800,
  2000: 5200,
};

export const KARACHI_AREAS = [
  "DHA",
  "Clifton",
  "Gulshan-e-Iqbal",
  "Gulistan-e-Johar",
  "North Nazimabad",
  "Nazimabad",
  "PECHS",
  "Korangi",
  "Malir",
  "Saddar",
  "Lyari",
  "Orangi",
] as const;

export const AREA_DAILY_LIMIT = 10;

export function getAreaUsage(area: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return getBookings().filter(
    (b) => b.area === area && b.createdAt.slice(0, 10) === today && b.status !== "cancelled",
  ).length;
}

export function estimateETA(): string {
  return "2–3 hours";
}

// Users
export function getUsers(): User[] {
  return read<User[]>(K_USERS, []);
}
export function signUp(u: Omit<User, "id">): { ok: boolean; error?: string } {
  const users = getUsers();
  if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const newUser: User = { ...u, id: crypto.randomUUID() };
  write(K_USERS, [...users, newUser]);
  write(K_SESSION, newUser.email);
  return { ok: true };
}
export function signIn(email: string, password: string): { ok: boolean; error?: string } {
  const u = getUsers().find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!u) return { ok: false, error: "Invalid email or password." };
  write(K_SESSION, u.email);
  return { ok: true };
}
export function signOut() {
  if (!isClient()) return;
  localStorage.removeItem(K_SESSION);
  window.dispatchEvent(new Event("tmms-store"));
}
export function currentUser(): User | null {
  if (!isClient()) return null;
  const email = localStorage.getItem(K_SESSION);
  if (!email) return null;
  return getUsers().find((u) => u.email === JSON.parse(email)) ?? null;
}

// Bookings
export function getBookings(): Booking[] {
  return read<Booking[]>(K_BOOKINGS, []);
}
export function addBooking(b: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const newB: Booking = {
    ...b,
    id: "ORD-" + Math.floor(40000 + Math.random() * 9999),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  write(K_BOOKINGS, [newB, ...getBookings()]);
  return newB;
}

// Pending booking (between Book Tanker form and Payment page)
export type PendingBooking = {
  area: string;
  size: 500 | 1000 | 2000;
  price: number;
  address: string;
  eta: string;
};
const K_PENDING = "tmms_pending_booking";
export function setPendingBooking(p: PendingBooking) {
  write(K_PENDING, p);
}
export function getPendingBooking(): PendingBooking | null {
  return read<PendingBooking | null>(K_PENDING, null);
}
export function clearPendingBooking() {
  if (!isClient()) return;
  localStorage.removeItem(K_PENDING);
  window.dispatchEvent(new Event("tmms-store"));
}
export function getComplaints(): Complaint[] {
  return read<Complaint[]>(K_COMPLAINTS, []);
}
export function addComplaint(c: Omit<Complaint, "id" | "createdAt" | "status">): Complaint {
  const newC: Complaint = {
    ...c,
    id: "CMP-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  write(K_COMPLAINTS, [newC, ...getComplaints()]);
  return newC;
}
export function resolveComplaint(id: string) {
  write(
    K_COMPLAINTS,
    getComplaints().map((c) => (c.id === id ? { ...c, status: "resolved" as const } : c)),
  );
}
