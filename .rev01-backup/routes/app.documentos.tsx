import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  FileSignature,
  FileText,
  Lock,
  ScrollText,
  UserRound,
} from "lucide-react";
import { Badge, BtnPrimary, Card, PageHeader } from "@/components/portal-shell";
import { DocPreviewModal, type DocPreviewData } from "@/components/doc-preview";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  etapaIndex,
  formatearMonto,
  paisPorNombre,
  useJaikaDemo,
  type EtapaCredito,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/documentos")({
  component: DocumentosPage,
});

type EstadoDocumento = "pendiente" | "adjuntado" | "firmado";

type Documento = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: typeof FileText;
  fecha: string | null;
  estado: EstadoDocumento;
  lineas: string[];
};

function estadoDocumento(etapa: EtapaCredito, etapaMinima: EtapaCredito): EstadoDocumento {
  return etapaIndex(etapa) >= etapaIndex(etapaMinima) ? "adjuntado" : "pendiente";
}

function escaparXml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mockDocUrl(titulo: string, lineas: string[]) {
  const contenido = lineas
    .map(
      (linea, i) =>
        `<text x="64" y="${230 + i * 34}" font-family="Arial, sans-serif" font-size="15" fill="#3a4658">${escaparXml(linea)}</text>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="840" viewBox="0 0 620 840">
    <rect width="620" height="840" fill="#f5f5f3"/>
    <rect x="24" y="24" width="572" height="792" fill="#ffffff" stroke="#e2e0db"/>
    <rect x="24" y="24" width="572" height="8" fill="#B08D57"/>
    <text x="64" y="96" font-family="Georgia, serif" font-size="14" letter-spacing="3" fill="#B08D57">JAIKA</text>
    <text x="64" y="142" font-family="Georgia, serif" font-size="30" fill="#1c2e4a">${escaparXml(titulo)}</text>
    <line x1="64" y1="166" x2="556" y2="166" stroke="#e2e0db"/>
    ${contenido}
    <text x="64" y="760" font-family="Arial, sans-serif" font-size="11" fill="#9aa0aa">Documento de demostración · Jaika</text>
    <text x="64" y="780" font-family="Arial, sans-serif" font-size="11" fill="#9aa0aa">No tiene validez legal.</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function fechaDocumento(iso: string | null) {
  if (!iso) return "Pendiente";
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

const ESTADO_META: Record<EstadoDocumento, { label: string; clase: string }> = {
  pendiente: { label: "Pendiente", clase: "bg-plata-100 text-black-400" },
  adjuntado: { label: "Adjuntado", clase: "bg-success-bg text-success" },
  firmado: { label: "Firmado", clase: "bg-jaika-gold/15 text-jaika-gold-dark" },
};

function DocumentosPage() {
  const { perfil, solicitud, preaprobacion, etapa, notificaciones } = useJaikaDemo();
  const [preview, setPreview] = useState<DocPreviewData | null>(null);
  const pais = paisPorNombre(perfil.paisPostula);
  const moneda = solicitud?.moneda ?? "USD";
  const haySolicitud = !!solicitud;
  const firmada = !!solicitud?.firmada;
  const fechaBase = preaprobacion?.fecha ?? new Date().toISOString();

  const documentos: Documento[] = [
    {
      id: "dni",
      titulo: "Documento de identidad",
      descripcion: `${perfil.tipoDocumento ?? "DNI"} ${perfil.numeroDocumento ?? ""}`.trim(),
      icono: UserRound,
      fecha: fechaBase,
      estado: perfil.estadoIdentidad === "verificada" ? "adjuntado" : "pendiente",
      lineas: [
        `Titular: ${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim(),
        `Documento: ${perfil.tipoDocumento ?? ""} ${perfil.numeroDocumento ?? ""}`.trim(),
        `País: ${pais.nombre}`,
        "Identidad validada con biometría facial.",
      ],
    },
    {
      id: "ingresos",
      titulo: "Sustento de ingresos",
      descripcion: "Declaración jurada y boletas de pago",
      icono: BriefcaseBusiness,
      fecha: haySolicitud ? notificaciones[0]?.fecha ?? fechaBase : null,
      estado: haySolicitud ? "adjuntado" : "pendiente",
      lineas: [
        `Titular: ${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim(),
        `Ocupación: ${perfil.ocupacion || "No registrada"}`,
        "Sustento aceptado para la evaluación crediticia.",
      ],
    },
    {
      id: "minuta",
      titulo: "Minuta de compraventa",
      descripcion: solicitud?.datosBien.vendedor
        ? `Vendedor: ${solicitud.datosBien.vendedor}`
        : "Pendiente de generar",
      icono: ScrollText,
      fecha:
        etapaIndex(etapa) >= etapaIndex("registros_publicos")
          ? notificaciones.find((n) => n.etapa === "registros_publicos")?.fecha ?? fechaBase
          : null,
      estado:
        etapaIndex(etapa) >= etapaIndex("notaria")
          ? "firmado"
          : estadoDocumento(etapa, "registros_publicos"),
      lineas: solicitud
        ? [
            `Bien: ${solicitud.tipoBien}`,
            `Valor: ${formatearMonto(solicitud.valor, moneda)}`,
            `Ubicación: ${solicitud.datosBien.ubicacion || "—"}`,
            `Vendedor: ${solicitud.datosBien.vendedor || "—"}`,
            `Comprador: ${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim(),
          ]
        : ["La minuta se genera después de la preaprobación."],
    },
    {
      id: "contrato",
      titulo: "Contrato de crédito",
      descripcion: "Contrato con el fideicomiso",
      icono: FileSignature,
      fecha:
        etapaIndex(etapa) >= etapaIndex("desembolso")
          ? notificaciones.find((n) => n.etapa === "notaria")?.fecha ?? fechaBase
          : null,
      estado:
        etapaIndex(etapa) >= etapaIndex("desembolso")
          ? "firmado"
          : etapaIndex(etapa) >= etapaIndex("notaria")
            ? "adjuntado"
            : "pendiente",
      lineas: solicitud
        ? [
            `Titular: ${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim(),
            `Monto: ${formatearMonto(solicitud.valor, moneda)}`,
            `Plazo: ${solicitud.plazo} meses`,
            "Firmado digitalmente en notaría.",
          ]
        : ["El contrato se genera después de la preaprobación."],
    },
    {
      id: "cronograma",
      titulo: "Cronograma de pagos",
      descripcion: solicitud ? `${solicitud.plazo} cuotas` : "Pendiente de generar",
      icono: CalendarDays,
      fecha:
        etapaIndex(etapa) >= etapaIndex("preaprobado")
          ? notificaciones.find((n) => n.etapa === "preaprobado")?.fecha ?? fechaBase
          : null,
      estado: estadoDocumento(etapa, "preaprobado"),
      lineas: solicitud
        ? [
            `Bien: ${solicitud.tipoBien}`,
            `Plazo: ${solicitud.plazo} meses`,
            `Monto financiado: ${formatearMonto(solicitud.valor * 0.9, moneda)}`,
            "El detalle de cuotas está disponible en el portal.",
          ]
        : ["El cronograma se genera al preaprobar el crédito."],
    },
  ];

  const disponibles = documentos.filter((d) => d.estado !== "pendiente").length;

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Revisa los documentos de tu proceso. Los archivos de esta demo son referenciales."
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      {!firmada && (
        <div className="mb-5 flex flex-col gap-3 rounded-sm border border-black-100 bg-plata-50 px-5 py-4 text-sm text-black-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Lock size={17} className="mt-0.5 shrink-0 text-black-400" />
            <span>
              Los documentos de crédito se completan a medida que avanzas. Tu identidad ya puede
              estar verificada.
            </span>
          </div>
          <Link to={haySolicitud ? "/app/preaprobacion" : "/app/solicitud"}>
            <BtnPrimary className="h-9 px-3 text-xs">
              {haySolicitud ? "Acreditar inicial" : "Iniciar solicitud"} <ArrowRight size={13} />
            </BtnPrimary>
          </Link>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-black-400">
          {disponibles} de {documentos.length} documentos disponibles
        </p>
        <span className="text-[11px] text-black-400">
          Los documentos pendientes se habilitan al avanzar de etapa.
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documentos.map((doc) => {
          const Icono = doc.icono;
          const meta = ESTADO_META[doc.estado];
          const url = mockDocUrl(doc.titulo, doc.lineas);
          return (
            <Card key={doc.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-plata-100 text-jaika-gold-dark">
                  <Icono size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-black-800">{doc.titulo}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.clase}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-black-400">{doc.descripcion}</p>
                  <p className="mt-2 text-[11px] text-black-300">{fechaDocumento(doc.fecha)}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-black-100 pt-3">
                {doc.estado === "pendiente" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-black-300">
                    <Lock size={12} /> Se habilita en una etapa posterior
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setPreview({
                        tipo: doc.titulo,
                        label: doc.descripcion,
                        signedUrl: url,
                        kind: "image",
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-jaika-gold-dark hover:underline"
                  >
                    <Eye size={13} /> Ver documento
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-black-400">
        Los documentos mostrados son mockups de demostración. En producción se generan desde el
        expediente del fideicomiso.
      </p>

      <DocPreviewModal doc={preview} onClose={() => setPreview(null)} />
    </>
  );
}
