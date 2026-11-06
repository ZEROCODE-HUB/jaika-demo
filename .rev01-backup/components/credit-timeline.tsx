import { Check, Clock3 } from "lucide-react";
import {
  ETAPA_LABEL,
  ETAPAS_TIMELINE,
  etapaIndex,
  fechaEtapa,
  type EtapaCredito,
  type NotificacionDemo,
} from "@/lib/jaika-demo-store";

function fechaCorta(fecha: string | null) {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

export function CreditTimeline({
  etapa,
  notificaciones,
  compact = false,
  includePago = false,
}: {
  etapa: EtapaCredito;
  notificaciones: NotificacionDemo[];
  compact?: boolean;
  includePago?: boolean;
}) {
  const pasos = includePago ? [...ETAPAS_TIMELINE, "en_pago" as EtapaCredito] : ETAPAS_TIMELINE;
  const actual = etapaIndex(etapa);

  if (compact) {
    return (
      <ol className="flex items-start gap-0 overflow-x-auto pb-1">
        {pasos.map((paso, i) => {
          const indice = etapaIndex(paso);
          const completada = actual > indice;
          const enCurso = actual === indice;
          const fecha = fechaCorta(fechaEtapa(notificaciones, paso));
          return (
            <li key={paso} className="flex min-w-[116px] flex-1 items-start gap-2">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                    completada
                      ? "border-success bg-success text-white"
                      : enCurso
                        ? "border-jaika-gold bg-jaika-gold text-[#1c2e4a]"
                        : "border-black-200 bg-white text-black-400"
                  }`}
                >
                  {completada ? <Check size={12} /> : enCurso ? <Clock3 size={12} /> : i + 1}
                </span>
                {i < pasos.length - 1 && (
                  <span
                    className={`mt-1 h-px w-full min-w-10 ${
                      completada ? "bg-success" : "bg-black-100"
                    }`}
                  />
                )}
              </div>
              <div className="min-w-0 pr-2">
                <div
                  className={`text-[11px] font-semibold leading-tight ${
                    enCurso ? "text-black-800" : "text-black-500"
                  }`}
                >
                  {ETAPA_LABEL[paso]}
                </div>
                <div className="mt-1 text-[10px] text-black-400">
                  {fecha ?? (enCurso ? "En curso" : "Pendiente")}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="space-y-0">
      {pasos.map((paso, i) => {
        const indice = etapaIndex(paso);
        const completada = actual > indice;
        const enCurso = actual === indice;
        const fecha = fechaCorta(fechaEtapa(notificaciones, paso));
        return (
          <li key={paso} className="relative flex gap-4 pb-7 last:pb-0">
            {i < pasos.length - 1 && (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px ${
                  completada ? "bg-success" : "bg-black-100"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                completada
                  ? "border-success bg-success text-white"
                  : enCurso
                    ? "border-jaika-gold bg-jaika-gold text-[#1c2e4a]"
                    : "border-black-200 bg-white text-black-400"
              }`}
            >
              {completada ? <Check size={14} /> : i + 1}
            </span>
            <div className="pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    enCurso ? "text-black-800" : "text-black-600"
                  }`}
                >
                  {ETAPA_LABEL[paso]}
                </span>
                <span className="text-[11px] font-medium text-black-400">
                  {completada ? "Completada" : enCurso ? "En curso" : "Pendiente"}
                </span>
              </div>
              <div className="mt-1 text-xs text-black-400">
                {fecha ?? (enCurso ? "Fecha en proceso" : "Sin fecha estimada")}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
