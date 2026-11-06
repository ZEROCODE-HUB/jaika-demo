import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  FileText,
  Landmark,
  MailOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card, PageHeader } from "@/components/portal-shell";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  useJaikaDemo,
  type NotificacionDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/notificaciones")({
  component: NotificacionesPage,
});

type Filtro = "todas" | "no_leidas" | "leidas";

function fechaNotificacion(iso: string) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function iconoNotificacion(notificacion: NotificacionDemo) {
  if (notificacion.id.startsWith("email") || notificacion.id.startsWith("identidad")) {
    return MailOpen;
  }
  if (notificacion.etapa === "en_pago") return CheckCircle2;
  if (notificacion.etapa === "notaria" || notificacion.etapa === "desembolso") return Landmark;
  if (notificacion.etapa === "preaprobado") return Sparkles;
  return FileText;
}

function NotificacionesPage() {
  const {
    etapa,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
  } = useJaikaDemo();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const visibles = notificaciones.filter((n) => {
    if (filtro === "no_leidas") return !n.leida;
    if (filtro === "leidas") return n.leida;
    return true;
  });

  const marcarTodas = () => {
    if (noLeidas === 0) return;
    marcarTodasNotificacionesLeidas();
    toast.success("Marcaste todas las notificaciones como leídas.");
  };

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Novedades de tu proceso de crédito y de tu cuenta."
        action={
          <div className="flex items-center gap-2">
            {noLeidas > 0 && <Badge tone="warn">{noLeidas} sin leer</Badge>}
            <Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-sm bg-plata-100 p-1">
          {[
            ["todas", "Todas"],
            ["no_leidas", "No leídas"],
            ["leidas", "Leídas"],
          ].map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltro(valor as Filtro)}
              className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                filtro === valor
                  ? "bg-white text-black-800 shadow-sm"
                  : "text-black-400 hover:text-black-600"
              }`}
            >
              {label}
              {valor === "no_leidas" && noLeidas > 0 ? ` (${noLeidas})` : ""}
            </button>
          ))}
        </div>

        <BtnOutline onClick={marcarTodas} disabled={noLeidas === 0} className="h-9 px-3 text-xs">
          <CheckCheck size={14} /> Marcar todas como leídas
        </BtnOutline>
      </div>

      {visibles.length === 0 ? (
        <Card className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plata-100">
            <Bell size={24} className="text-black-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black-800">
            {filtro === "no_leidas"
              ? "No tienes notificaciones sin leer"
              : filtro === "leidas"
                ? "Aún no hay notificaciones leídas"
                : "Todavía no tienes notificaciones"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black-400">
            {filtro === "todas"
              ? "Cuando avances en tu crédito o completes un paso, te avisaremos aquí."
              : "Prueba con otro filtro para ver el resto de tus notificaciones."}
          </p>
          {filtro === "todas" && (
            <div className="mt-6">
              <Link to="/app">
                <BtnPrimary>
                  Volver al inicio <Check size={15} />
                </BtnPrimary>
              </Link>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {visibles.map((notificacion) => {
            const Icono = iconoNotificacion(notificacion);
            return (
              <button
                key={notificacion.id}
                type="button"
                onClick={() => marcarNotificacionLeida(notificacion.id)}
                className={`w-full rounded-sm border p-4 text-left transition-colors ${
                  notificacion.leida
                    ? "border-black-100 bg-white hover:bg-plata-50"
                    : "border-jaika-gold/40 bg-jaika-gold/[0.06] hover:bg-jaika-gold/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notificacion.leida
                        ? "bg-plata-100 text-black-400"
                        : "bg-jaika-gold/20 text-jaika-gold-dark"
                    }`}
                  >
                    <Icono size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-sm ${
                            notificacion.leida
                              ? "font-medium text-black-600"
                              : "font-semibold text-black-800"
                          }`}
                        >
                          {notificacion.titulo}
                        </h2>
                        {!notificacion.leida && (
                          <span className="h-2 w-2 rounded-full bg-jaika-gold" aria-label="No leída" />
                        )}
                      </div>
                      <span className="text-[11px] text-black-300">
                        {fechaNotificacion(notificacion.fecha)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-black-400">
                      {notificacion.detalle}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-black-300">
                      {notificacion.etapa !== "sin_solicitud" && (
                        <span>{ETAPA_LABEL[notificacion.etapa]}</span>
                      )}
                      {!notificacion.leida && (
                        <span className="inline-flex items-center gap-1 font-medium text-jaika-gold-dark">
                          <Check size={11} /> Marcar como leída
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
