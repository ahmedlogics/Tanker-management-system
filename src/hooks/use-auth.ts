import { useEffect, useState } from "react";
import { currentUser, type User } from "@/lib/tmms-store";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(currentUser());
    sync();
    setReady(true);
    window.addEventListener("tmms-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tmms-store", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}
