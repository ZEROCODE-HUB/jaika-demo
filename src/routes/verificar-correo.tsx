import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

// Demo Jaika: la verificacion de correo se simula, no llama a ningun servicio.
export const Route = createFileRoute("/verificar-correo")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    token: (search.token as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Correo verificado — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerificarCorreo,
});

function VerificarCorreo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-plata-50 px-6">
      <div className="w-full max-w-md bg-white border border-black-100 rounded-xl shadow-sm p-8 text-center">
        <div className="text-2xl font-bold tracking-tight text-navy-700">Jaika</div>
        <CheckCircle2 className="mx-auto mt-6 text-success" size={48} />
        <h1 className="mt-4 text-xl font-semibold text-black-800">Tu correo fue verificado</h1>
        <p className="mt-2 text-sm text-black-500">
          Ya puedes continuar con tu perfil y la validación de identidad.
        </p>
        <Link
          to="/onboarding/datos-personales"
          className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-md bg-navy-700 text-white text-sm font-semibold hover:opacity-90"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
