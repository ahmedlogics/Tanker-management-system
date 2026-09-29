// --- TYPES & CONSTANTS (Keep these exactly as they were) ---
export type Role = "customer" | "admin" | "owner";
export type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password?: string; 
  role: Role;
};

export type Booking = {
  id: string;
  userEmail: string;
  customer_name?: string; // Matching backend
  customer?: string;      // Matching frontend
  area: string;
  size?: number;          // Added for backend
  tanker_size?: number;   // Added for backend
  price: number;
  address: string;
  eta: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  created_at?: string;    // Backend timestamp
  createdAt?: string;     // Frontend timestamp
};

export type Complaint = {
  id: string;
  booking_id?: string;
  orderId?: string;
  userEmail: string;
  customer?: string;
  type: "Late Delivery" | "Overcharging" | "No Delivery" | "Other";
  complaint_type?: string; // Backend
  description: string;
  status: "pending" | "resolved";
  created_at?: string;
  createdAt?: string;
};

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

export function estimateETA(): string {
  return "2–3 hours";
}

// --- LOCAL STORAGE HELPERS (For Session & UI State Only) ---
const K_SESSION = "tmms_session";
const K_PENDING = "tmms_pending_booking";
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


export const API_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:5000/api");

// --- USERS & AUTHENTICATION ---
export async function signUp(u: Omit<User, "id">): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...u, role: "customer" }),
    });
    const data = await res.json();
    if (data.ok) {
      return await signIn(u.email, u.password!);
    }
    return { ok: false, error: data.error };
  } catch (err) {
    return { ok: false, error: "Cannot connect to server." };
  }
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok) {
      write(K_SESSION, data.user);
      return { ok: true };
    }
    return { ok: false, error: data.error };
  } catch (err) {
    return { ok: false, error: "Cannot connect to server." };
  }
}

export function signOut() {
  if (!isClient()) return;
  localStorage.removeItem(K_SESSION);
  window.dispatchEvent(new Event("tmms-store"));
}

export function currentUser(): User | null {
  return read<User | null>(K_SESSION, null);
}

// --- BOOKINGS ---
// e
export async function getBookings(userEmail?: string): Promise<Booking[]> {
  try {
    const url = userEmail ? `${API_URL}/bookings?email=${userEmail}` : `${API_URL}/bookings`;
    const res = await fetch(url);
    const data = await res.json();
    
    // Map ALL backend snake_case to frontend camelCase
    return data.map((b: any) => ({
      ...b,
      id: b.id,
      userEmail: b.user_email,     // ✅ Missing in your current code
      customer: b.customer_name,
      area: b.area,
      size: b.tanker_size,         // ✅ Missing in your current code
      price: b.price,
      address: b.address,
      eta: b.eta,
      status: b.status,
      createdAt: b.created_at,
    }));
  } catch {
    return [];
  }
}


export async function addBooking(b: any): Promise<Booking | null> {
  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    const data = await res.json();
    if (data.ok) {
       window.dispatchEvent(new Event("tmms-store"));
       return { ...b, id: data.id };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAreaUsage(area: string): Promise<number> {
  // To keep it simple, we fetch today's bookings and count them
  const bookings = await getBookings();
  const today = new Date().toISOString().slice(0, 10);
  return bookings.filter(
    (b) => b.area === area && b.createdAt?.slice(0, 10) === today && b.status !== "cancelled",
  ).length;
}

// --- COMPLAINTS ---
export async function getComplaints(userEmail?: string): Promise<Complaint[]> {
  try {
    const url = userEmail ? `${API_URL}/complaints?email=${encodeURIComponent(userEmail)}` : `${API_URL}/complaints`;
    const res = await fetch(url);
    const data = await res.json();
    return data.map((c: any) => ({
      ...c,
      id: String(c.id),
      orderId: c.booking_id,
      userEmail: c.user_email,
      customer: c.customer_name || c.user_email,
      type: c.complaint_type,
      description: typeof c.description === "string" ? c.description : "",
      status: c.status || "pending",
      createdAt: c.created_at,
    }));
  } catch {
    return [];
  }
}

export async function addComplaint(c: any): Promise<Complaint | null> {
  try {
    const res = await fetch(`${API_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    if (res.ok) {
       window.dispatchEvent(new Event("tmms-store"));
       return c;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveComplaint(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/complaints/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      window.dispatchEvent(new Event("tmms-store"));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// --- PENDING BOOKING (Form State) ---
export type PendingBooking = {
  area: string;
  size: 500 | 1000 | 2000;
  price: number;
  address: string;
  eta: string;
};

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