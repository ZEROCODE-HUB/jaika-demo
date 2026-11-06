import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Earth,
  Fingerprint,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge, BtnOutline, Card, PageHeader } from "@/components/portal-shell";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  MONEDAS,
  etiquetaGrupo,
  nombreCompleto,
  paisPorNombre,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/cuenta")({ component: CuentaPage });

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

function CuentaPage() {
  const { perfil, etapa } = useJaikaDemo();
  const pais = paisPorNombre(perfil.paisPostula);
  const grupo = etiquetaGrupo(perfil.grupoOrigen);
  const nombre = nombreCompleto(perfil) || "Cliente Jaika";
  const verificada = perfil.estadoIdentidad === "verificada";

  const datos = [
    ["Documento", `${perfil.tipoDocumento ?? "DNI"} ${perfil.numeroDocumento ?? "—"}`],
    ["Fecha de nacimiento", perfil.fechaNacimiento || "—"],
    ["Correo electrónico", perfil.email || "—"],
    ["País de residencia", perfil.paisPostula || pais.nombre],
    ["Ciudad", perfil.ciudad || "—"],
    ["Dirección", perfil.direccion || "—"],
    ["Ocupación", perfil.ocupacion || "—"],
    ["Origen de fondos", perfil.origenFondos || "—"],
    ["Moneda de la cuenta", `${MONEDAS[perfil.moneda ?? pais.moneda].nombre} (${perfil.moneda ?? pais.moneda})`],
  ];

  return (
    <>
      <PageHeader
        title="Mi cuenta"
        description="Tus datos personales y el estado de tu cuenta en Jaika."
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1c2e4a] font-display text-xl font-semibold text-jaika-gold">
                {iniciales(nombre) || <UserRound size={24} />}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-black-800">{nombre}</h2>
                <p className="truncate text-sm text-black-400">{perfil.email || "Sin correo"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={verificada ? "success" : "warn"}>
                    {verificada ? "Identidad verificada" : "Identidad pendiente"}
                  </Badge>
                  {grupo && <Badge tone="neutral">{grupo}</Badge>}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-black-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-black-500">
                <MapPin size={15} className="text-jaika-gold-dark" />
                {pais.nombre}
              </div>
              <div className="flex items-center gap-2 text-sm text-black-500">
                <Earth size={15} className="text-jaika-gold-dark" />
                {perfil.paisOrigen ? `Origen: ${perfil.paisOrigen}` : "Origen no registrado"}
              </div>
              <div className="flex items-center gap-2 text-sm text-black-500">
                <BriefcaseBusiness size={15} className="text-jaika-gold-dark" />
                {perfil.ocupacion || "Ocupación no registrada"}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-black-800">Verificaciones</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Fingerprint size={16} className="mt-0.5 text-jaika-gold-dark" />
                  <div>
                    <div className="text-sm font-medium text-black-700">Identidad</div>
                    <div className="text-xs text-black-400">Documento y biometría facial</div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    verificada ? "text-success" : "text-amber-600"
                  }`}
                >
                  {verificada ? "Verificada" : "Pendiente"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 text-jaika-gold-dark" />
                  <div>
                    <div className="text-sm font-medium text-black-700">Correo electrónico</div>
                    <div className="text-xs text-black-400">{perfil.email || "Sin correo"}</div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    perfil.emailValidado ? "text-success" : "text-amber-600"
                  }`}
                >
                  {perfil.emailValidado ? "Validado" : "Sin validar"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-jaika-gold-dark" />
                  <div>
                    <div className="text-sm font-medium text-black-700">Cuenta demo</div>
                    <div className="text-xs text-black-400">Datos almacenados localmente</div>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-success" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Datos personales</h2>
            </div>
            <dl className="mt-4 divide-y divide-black-100">
              {datos.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[190px_1fr] sm:gap-4"
                >
                  <dt className="text-black-400">{label}</dt>
                  <dd className="font-medium text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-sm bg-plata-50 p-3 text-[11px] leading-relaxed text-black-400">
              En esta demo los datos provienen de tu registro y se guardan en el navegador. Para
              actualizarlos, reinicia la demo desde el panel inferior.
            </p>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link to="/app/documentos">
              <BtnOutline>
                Ver mis documentos <ArrowRight size={14} />
              </BtnOutline>
            </Link>
            <Link to="/app/seguridad">
              <BtnOutline>
                Seguridad de la cuenta <ArrowRight size={14} />
              </BtnOutline>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
