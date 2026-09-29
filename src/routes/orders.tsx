import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Deliveries & Operations — TMMS" },
    ],
  }),
  component: OrdersRedirect,
});

function OrdersRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    // Deliveries is the unified operational tracking screen for admin
    navigate({ to: "/deliveries" });
  }, [navigate]);

  return null;
}