import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { currentUser, type User } from "@/lib/tmms-store";

/**
 * Redirects to /signin if not authenticated, or to / (or `denyTo`) if the user's
 * role is not in `allow`. Returns the user once authorized.
 */
export function useRoleGuard(
  allow: Array<User["role"]>,
  denyTo: string = "/",
) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      navigate({ to: "/signin" });
      return;
    }
    if (!allow.includes(u.role)) {
      navigate({ to: denyTo as never });
      return;
    }
    setUser(u);
    setOk(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, ok };
}
