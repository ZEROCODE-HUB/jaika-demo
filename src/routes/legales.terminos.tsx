import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legales/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones — Jaika" },
      { name: "description", content: "Términos y condiciones de la plataforma Jaika (texto de ejemplo para la demo)." },
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
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-black-800">Términos y condiciones</h1>
        <section className="mt-8 space-y-6 text-sm leading-relaxed text-black-500">
          <div>
            <h2 className="text-base font-semibold text-black-800">1. Sobre Jaika</h2>
            <p className="mt-2">Jaika es una plataforma que facilita la solicitud, preaprobación y seguimiento de créditos respaldados por fideicomiso para vivienda, vehículos, transporte, construcción y negocios.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">2. Preaprobación</h2>
            <p className="mt-2">La preaprobación se emite cuando el solicitante completa su registro, valida su identidad y acredita el 10% del valor del bien. No constituye un desembolso.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">3. Fideicomiso</h2>
            <p className="mt-2">Los fondos del crédito se administran mediante fideicomiso. El desembolso y la recaudación de cuotas se realizan fuera de la plataforma, según los contratos firmados en notaría.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-black-800">4. Uso de la plataforma</h2>
            <p className="mt-2">El usuario se compromete a ingresar información veraz y a mantener la confidencialidad de su acceso.</p>
          </div>
        </section>
      </article>
    </div>
  );
}
