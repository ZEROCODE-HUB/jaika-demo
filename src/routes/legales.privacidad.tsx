import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legales/privacidad")({
  head: () => ({
    meta: [
      { title: "Políticas de privacidad — Jaika" },
      { name: "description", content: "Políticas de privacidad de la plataforma Jaika (texto de ejemplo para la demo)." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black-100 bg-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-navy-700">Jaika</Link>
          <Link to="/" className="text-sm text-black-500 hover:text-black-800 inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="inline-block text-xs font-semibold uppercase tracking-wider text-warning bg-warning-bg border border-warning-border rounded-full px-3 py-1">
          Texto de ejemplo para la demo
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-black-800">Políticas de privacidad</h1>
        <section className="mt-8 space-y-6 text-sm leading-relaxed text-black-500">
          <div>
            <h2 className="text-base font-semibold text-black-800">1. Datos que tratamos</h2>
            <p className="mt-2">Datos de identificación, documento de identidad, verificación facial, datos de contacto y la información del bien a financiar.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">2. Finalidad</h2>
            <p className="mt-2">Validar la identidad del solicitante, evaluar y preaprobar su crédito, y mantenerlo informado sobre cada etapa.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">3. Seguridad</h2>
            <p className="mt-2">La información se trata con confidencialidad y solo la conoce el equipo de Jaika que gestiona la solicitud.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">4. Derechos</h2>
            <p className="mt-2">El usuario puede solicitar el acceso, la corrección o la eliminación de sus datos escribiendo al equipo de Jaika.</p>
          </div>
        </section>
      </article>
    </div>
  );
}
