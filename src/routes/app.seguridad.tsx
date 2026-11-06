import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  Monitor,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  BtnOutline,
  BtnPrimary,
  Card,
  Input,
  Label,
  PageHeader,
} from "@/components/portal-shell";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  fechaEtapa,
  paisPorNombre,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/seguridad")({ component: SeguridadPage });

type Sesion = {
  id: string;
  dispositivo: string;
  ubicacion: string;
  detalle: string;
  actual: boolean;
  icono: typeof Monitor;
};

function fechaActividad(iso: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function SeguridadPage() {
  const { perfil, etapa, notificaciones } = useJaikaDemo();
  const pais = paisPorNombre(perfil.paisPostula);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [metodo, setMetodo] = useState<"email" | "app">("email");
  const [dosPasos, setDosPasos] = useState(false);
  const [sesiones, setSesiones] = useState<Sesion[]>([
    {
      id: "actual",
      dispositivo: "Chrome · Windows",
      ubicacion: pais.nombre,
      detalle: "Sesión actual",
      actual: true,
      icono: Monitor,
    },
    {
      id: "movil",
      dispositivo: "Safari · iPhone",
      ubicacion: pais.nombre,
      detalle: "Última actividad hace 2 horas",
      actual: false,
      icono: Smartphone,
    },
    {
      id: "laptop",
      dispositivo: "Edge · Laptop",
      ubicacion: pais.nombre,
      detalle: "Última actividad hace 3 días",
      actual: false,
      icono: Laptop,
    },
  ]);

  const actividad = notificaciones.slice(0, 5);
  const fechaPreaprobacion = fechaEtapa(notificaciones, "preaprobado");

  const cambiarPassword = () => {
    if (!actual || !nueva || !repetir) {
      toast.error("Completa todos los campos.");
      return;
    }
    if (nueva.length < 10) {
      toast.error("La nueva contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (nueva !== repetir) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setActual("");
    setNueva("");
    setRepetir("");
    toast.success("Contraseña actualizada (simulación).");
  };

  const alternarDosPasos = () => {
    const activar = !dosPasos;
    setDosPasos(activar);
    toast.success(
      activar
        ? `Verificación en dos pasos activada por ${metodo === "email" ? "correo" : "aplicación"}.`
        : "Verificación en dos pasos desactivada.",
    );
  };

  const cerrarOtrasSesiones = () => {
    const otras = sesiones.length - 1;
    setSesiones((lista) => lista.filter((sesion) => sesion.actual));
    toast.success(
      otras > 0 ? "Cerraste las demás sesiones." : "No hay otras sesiones activas.",
    );
  };

  return (
    <>
      <PageHeader
        title="Seguridad"
        description="Protege tu cuenta y revisa los accesos recientes."
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Contraseña</h2>
            </div>
            <p className="mt-1 text-sm text-black-400">
              Usa una contraseña larga y diferente a la de otros servicios.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="password-actual">Contraseña actual</Label>
                <Input
                  id="password-actual"
                  type="password"
                  value={actual}
                  onChange={(event) => setActual(event.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="password-nueva">Nueva contraseña</Label>
                  <Input
                    id="password-nueva"
                    type="password"
                    value={nueva}
                    onChange={(event) => setNueva(event.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Label htmlFor="password-repetir">Repetir contraseña</Label>
                  <Input
                    id="password-repetir"
                    type="password"
                    value={repetir}
                    onChange={(event) => setRepetir(event.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <BtnPrimary onClick={cambiarPassword}>
                Actualizar contraseña <LockKeyhole size={14} />
              </BtnPrimary>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-jaika-gold-dark" />
                <h2 className="font-semibold text-black-800">Verificación en dos pasos</h2>
              </div>
              <Badge tone={dosPasos ? "success" : "neutral"}>
                {dosPasos ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-black-400">
              Agrega una capa extra de seguridad al iniciar sesión.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMetodo("email")}
                className={`flex items-start gap-3 rounded-sm border p-3 text-left ${
                  metodo === "email"
                    ? "border-jaika-gold bg-jaika-gold/10"
                    : "border-black-100 hover:border-black-200"
                }`}
              >
                <Mail size={18} className="mt-0.5 text-jaika-gold-dark" />
                <span>
                  <span className="block text-sm font-semibold text-black-800">Correo</span>
                  <span className="mt-0.5 block text-xs text-black-400">
                    {perfil.email || "Tu correo registrado"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMetodo("app")}
                className={`flex items-start gap-3 rounded-sm border p-3 text-left ${
                  metodo === "app"
                    ? "border-jaika-gold bg-jaika-gold/10"
                    : "border-black-100 hover:border-black-200"
                }`}
              >
                <Smartphone size={18} className="mt-0.5 text-jaika-gold-dark" />
                <span>
                  <span className="block text-sm font-semibold text-black-800">Aplicación</span>
                  <span className="mt-0.5 block text-xs text-black-400">
                    Código de 6 dígitos
                  </span>
                </span>
              </button>
            </div>
            <div className="mt-4">
              <BtnOutline onClick={alternarDosPasos}>
                {dosPasos ? "Desactivar" : "Activar"} verificación en dos pasos
              </BtnOutline>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-black-800">Sesiones activas</h2>
                <p className="mt-1 text-xs text-black-400">
                  {sesiones.length} {sesiones.length === 1 ? "sesión" : "sesiones"}
                </p>
              </div>
              {sesiones.length > 1 && (
                <BtnOutline onClick={cerrarOtrasSesiones} className="h-8 px-2.5 text-[11px]">
                  <Trash2 size={12} /> Cerrar otras
                </BtnOutline>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {sesiones.map((sesion) => {
                const Icono = sesion.icono;
                return (
                  <div key={sesion.id} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plata-100 text-black-500">
                      <Icono size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-black-800">
                          {sesion.dispositivo}
                        </span>
                        {sesion.actual && (
                          <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black-400">
                        {sesion.ubicacion} · {sesion.detalle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-black-800">Actividad reciente</h2>
            {actividad.length === 0 ? (
              <p className="mt-3 text-sm text-black-400">
                Aún no hay movimientos registrados en tu cuenta.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {actividad.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                      <CheckCircle2 size={13} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black-700">{item.titulo}</p>
                      <p className="text-[11px] text-black-400">
                        {fechaActividad(item.fecha)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {fechaPreaprobacion && (
              <p className="mt-4 border-t border-black-100 pt-3 text-[11px] text-black-400">
                Crédito preaprobado el {fechaActividad(fechaPreaprobacion)}.
              </p>
            )}
          </Card>

          <div className="rounded-sm border border-black-100 bg-plata-50 p-4 text-[11px] leading-relaxed text-black-400">
            <p className="font-semibold text-black-600">Recomendaciones</p>
            <p className="mt-1">
              No compartas tus claves. Jaika nunca te pedirá tu contraseña por correo ni por
              teléfono.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
