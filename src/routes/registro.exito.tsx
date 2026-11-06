import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/registro/exito")({
  head: () => ({
    meta: [
      { title: "Registro exitoso — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedirectToEmail,
});

function RedirectToEmail() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/registro/validar-email", replace: true });
  }, [navigate]);
  return null;
}
