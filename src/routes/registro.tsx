import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthShell,
  Field,
  FormTitle,
  PasswordField,
  PrimaryButton,
  SelectField,
  validatePassword,
} from "@/components/onboarding";
import { useOnboarding } from "@/lib/onboarding-store";
import {
  MONEDAS,
  PAISES,
  TIPOS_DOCUMENTO,
  etiquetaGrupo,
  formatearMonto,
  paisPorNombre,
  useJaikaDemo,
  type TipoDocumento,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/registro")({
  validateSearch: (search: Record<string, unknown>) =>
    typeof search.grupo === "string" ? { grupo: search.grupo } : {},
  head: () => ({
    meta: [
      { title: "Solicitar mi crédito — Jaika" },
      {
        name: "description",
        content:
          "Regístrate en Jaika y solicita tu crédito respaldado por fideicomiso con el 10% de inicial.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegistroLayout,
});

function RegistroLayout() {
  const matches = useRouterState({ select: (s) => s.matches });
  const isExactRoute =
    matches.length > 0 && matches[matches.length - 1]?.routeId === "/registro";

  if (!isExactRoute) return <Outlet />;

  return <RegistroForm />;
}

function RegistroForm() {
  const nav = useNavigate();
  const { grupo } = Route.useSearch();
  const iniciarRegistro = useJaikaDemo((s) => s.iniciarRegistro);
  const simulacion = useJaikaDemo((s) => s.solicitud);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    email: "",
    password: "",
    paisOrigen: "",
    paisPostula: "",
    tipoDocumento: "" as TipoDocumento | "",
    numeroDocumento: "",
  });
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);

  const pais = paisPorNombre(form.paisPostula || undefined);
  const moneda = MONEDAS[pais.moneda];
  const grupoLabel = etiquetaGrupo(grupo);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const pwOk = validatePassword(form.password);
  const valid =
    form.nombres.trim() &&
    form.apellidos.trim() &&
    form.fechaNacimiento &&
    emailOk &&
    pwOk &&
    form.paisOrigen &&
    form.paisPostula &&
    form.tipoDocumento &&
    form.numeroDocumento.trim() &&
    terms;

  return (
    <AuthShell
      leftEyebrow="Jaika · Solicitud de crédito"
      leftTitle="Tu crédito empieza con tu 10% de inicial."
      leftBody="Completa tu perfil de solicitante, valida tu identidad y sigue cada etapa del crédito desde el portal."
      step="Alta de cliente"
    >
      <FormTitle
        eyebrow="Persona natural"
        title="Solicita tu crédito"
        subtitle="Completa tus datos para iniciar la evaluación. El crédito siempre se otorga al cliente final."
      />

      {grupoLabel && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-jaika-gold/40 bg-jaika-gold/10 px-3 py-2 text-xs text-[#6b532f]">
          <span className="h-1.5 w-1.5 rounded-full bg-jaika-gold" />
          Te inscribes con el grupo: <strong>{grupoLabel}</strong>
        </div>
      )}

      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!valid) return;

          const paisSeleccionado = paisPorNombre(form.paisPostula);
          iniciarRegistro({
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            fechaNacimiento: form.fechaNacimiento,
            email: form.email.trim(),
            paisOrigen: form.paisOrigen,
            paisPostula: form.paisPostula,
            moneda: paisSeleccionado.moneda,
            tipoDocumento: form.tipoDocumento as TipoDocumento,
            numeroDocumento: form.numeroDocumento.trim(),
            grupoOrigen: grupo,
            paisResidencia: form.paisPostula,
          });

          const onboarding = useOnboarding.getState();
          onboarding.reset();
          onboarding.setTipo("fisica");
          onboarding.setRegistro({
            nombre: form.nombres.trim(),
            apellido: form.apellidos.trim(),
            fechaNac: form.fechaNacimiento,
            email: form.email.trim(),
          });

          nav({ to: "/registro/validar-email" });
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nombres"
            value={form.nombres}
            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            error={touched && !form.nombres.trim() ? "Requerido" : undefined}
            autoComplete="given-name"
          />
          <Field
            label="Apellidos"
            value={form.apellidos}
            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            error={touched && !form.apellidos.trim() ? "Requerido" : undefined}
            autoComplete="family-name"
          />
        </div>

        <Field
          label="Fecha de nacimiento"
          type="date"
          value={form.fechaNacimiento}
          onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
          error={touched && !form.fechaNacimiento ? "Requerido" : undefined}
          autoComplete="bday"
        />

        <Field
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="nombre@dominio.com"
          error={touched && !emailOk ? "Ingresa un correo válido" : undefined}
          autoComplete="email"
        />

        <PasswordField
          label="Contraseña"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          showRules
          error={touched && !pwOk ? "La contraseña no cumple los requisitos" : undefined}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="País de origen"
            value={form.paisOrigen}
            onChange={(v) => setForm({ ...form, paisOrigen: v })}
            options={PAISES.map((p) => p.nombre)}
            error={touched && !form.paisOrigen ? "Selecciona tu país de origen" : undefined}
          />
          <SelectField
            label="País donde postula"
            value={form.paisPostula}
            onChange={(v) => setForm({ ...form, paisPostula: v })}
            options={PAISES.map((p) => p.nombre)}
            error={touched && !form.paisPostula ? "Selecciona el país de postulación" : undefined}
          />
        </div>

        {form.paisPostula && (
          <div className="rounded-sm border border-black-100 bg-plata-50 p-4 text-xs leading-relaxed text-black-500">
            <div className="font-semibold text-black-800">
              Verás tus montos en {moneda.simbolo} ({pais.moneda}) · {moneda.nombre}
            </div>
            <p className="mt-1.5">
              Tu solicitud será atendida por el equipo de Jaika en {pais.nombre}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de documento"
            value={form.tipoDocumento}
            onChange={(v) => setForm({ ...form, tipoDocumento: v as TipoDocumento })}
            options={[...TIPOS_DOCUMENTO]}
            error={touched && !form.tipoDocumento ? "Selecciona el tipo de documento" : undefined}
          />
          <Field
            label="Número de documento"
            value={form.numeroDocumento}
            onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
            placeholder="Ej. 45678912"
            className="font-mono"
            error={touched && !form.numeroDocumento.trim() ? "Requerido" : undefined}
            autoComplete="off"
          />
        </div>

        {simulacion && (
          <div className="flex items-center justify-between gap-3 rounded-sm border border-jaika-gold/30 bg-jaika-gold/5 px-4 py-3 text-xs">
            <span className="text-black-500">
              Tu simulación: <strong className="text-black-800">{simulacion.tipoBien}</strong> ·{" "}
              {formatearMonto(
                simulacion.valor,
                form.paisPostula ? pais.moneda : simulacion.moneda,
              )}{" "}
              · {simulacion.plazo} meses
            </span>
            <span className="shrink-0 font-semibold text-jaika-gold-dark">Se guardará</span>
          </div>
        )}

        <label className="flex items-start gap-2.5 text-xs text-black-500 pt-1">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 accent-[#B08D57]"
          />
          <span>
            He leído y acepto los{" "}
            <Link
              to="/legales/terminos"
              className="underline underline-offset-2 hover:text-jaika-gold-dark"
            >
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link
              to="/legales/privacidad"
              className="underline underline-offset-2 hover:text-jaika-gold-dark"
            >
              Política de Privacidad
            </Link>
            .
          </span>
        </label>
        {touched && !terms && (
          <p className="text-xs text-red-500">Debes aceptar los términos para continuar.</p>
        )}

        <div className="pt-1">
          <PrimaryButton type="submit" disabled={!valid}>
            Crear cuenta y continuar
          </PrimaryButton>
        </div>
      </form>

      <p className="mt-5 text-center text-xs text-black-400">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/login"
          search={{ register: undefined }}
          className="text-jaika-gold-dark underline underline-offset-2 hover:opacity-80"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
