import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDemoMode } from "@/contexts/demo-mode";
import { useJaikaDemo } from "@/lib/jaika-demo-store";
import {
  AuthShell,
  Field,
  FormTitle,
  PasswordField,
  PrimaryButton,
  SecondaryButton,
  SuccessCard,
} from "@/components/onboarding";
import { getAuthErrorMessage, requireSupabase } from "@/lib/supabase";
import { resendVerification } from "@/lib/api/onboarding";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    register: search.register as "pf" | "pj" | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ingresar — Jaika" },
      {
        name: "description",
        content:
          "Accede al portal de Jaika. Créditos respaldados por fideicomiso para vivienda, vehículo, transporte, construcción y negocio.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginForm({
  onSuccess,
}: {
  onSuccess: (estado: "aprobado" | "pendiente" | "rechazado", email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const reenviarVerificacion = async () => {
    const destino = (pendingEmail ?? email).trim();
    if (!destino || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino)) {
      setResendMsg("Ingresa tu correo arriba para reenviar la verificación.");
      return;
    }
    setResendLoading(true);
    try {
      await resendVerification(destino);
      setResendMsg(
        `Te enviamos el correo de verificación a ${destino}. Revisa tu bandeja y la carpeta de spam.`,
      );
    } catch (e) {
      setResendMsg(
        e instanceof Error ? getAuthErrorMessage(e.message) : "No se pudo reenviar el correo.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <SuccessCard
        variant="info"
        title="Pendiente de verificación de correo"
        body={
          <>
            <p>
              Tu correo aún no está verificado. Revisa tu bandeja de entrada y haz clic en el
              enlace para activar tu cuenta.
            </p>
            <p className="mt-3 text-xs text-black-400">
              Si no lo recibes, revisa spam o reenvía el correo. Si tienes algún problema, nuestro
              equipo de soporte te puede ayudar.
            </p>
            {resendMsg && <p className="mt-3 text-xs text-green-600">{resendMsg}</p>}
          </>
        }
      >
        <PrimaryButton onClick={reenviarVerificacion} disabled={resendLoading}>
          {resendLoading ? "Reenviando…" : "Reenviar correo de verificación"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            setPendingEmail(null);
            setResendMsg(null);
          }}
          className="mt-2 w-full text-xs text-black-400 hover:text-jaika-gold-dark underline underline-offset-2"
        >
          Volver al inicio de sesión
        </button>
      </SuccessCard>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
          const sb = requireSupabase();
          const { data, error: authErr } = await sb.auth.signInWithPassword({
            email,
            password: pw,
          });
          if (authErr || !data.user) {
            const raw = authErr?.message ?? "";
            if (/email not confirmed/i.test(raw)) {
              setPendingEmail(email.trim());
              return;
            }
            setError(getAuthErrorMessage(raw || "No se pudo iniciar sesión"));
            return;
          }
          let estado: "aprobado" | "pendiente" | "rechazado" = "pendiente";
          try {
            const { data: cli } = await sb
              .from("clientes")
              .select("estado")
              .eq("correo", data.user.email ?? email)
              .maybeSingle();
            const raw = (cli?.estado as string) ?? "pendiente_verificacion";
            if (raw === "activado" || raw === "activo") estado = "aprobado";
            else if (raw === "deshabilitado" || raw === "eliminado" || raw === "rechazado")
              estado = "rechazado";
            else estado = "pendiente";
          } catch {
            // Si no se puede consultar el estado, continuamos con "pendiente".
          }
          onSuccess(estado, data.user.email ?? email);
        } catch (e) {
          setError(
            getAuthErrorMessage(e instanceof Error ? e.message : "No se pudo iniciar sesión"),
          );
        } finally {
          setLoading(false);
        }
      }}
    >
      <Field
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nombre@correo.com"
      />
      <PasswordField label="Contraseña" value={pw} onChange={setPw} />
      <div className="flex justify-end">
        <Link
          to="/recuperar"
          search={{ email: "" }}
          className="text-xs text-black-400 hover:text-jaika-gold-dark underline underline-offset-2 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="pt-1">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </PrimaryButton>
      </div>
      <div className="text-center text-xs text-black-400 space-y-2 pt-2">
        <p>
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/registro"
            className="text-jaika-gold-dark underline underline-offset-2 hover:opacity-80"
          >
            Solicita tu crédito
          </Link>
        </p>
        <p>¿Necesitas ayuda? Nuestro equipo te acompaña.</p>
      </div>
    </form>
  );
}

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { setRole } = useDemoMode();
  const cargarDemo = useJaikaDemo((s) => s.cargarDemo);

  useEffect(() => {
    if (search.register) {
      navigate({ to: "/registro", replace: true });
    }
  }, [search.register, navigate]);

  const handleLoginSuccess = (estado: "aprobado" | "pendiente" | "rechazado", email: string) => {
    const demo = useJaikaDemo.getState();
    demo.resetDemo();
    demo.setPerfil({
      email,
      estadoIdentidad: estado === "aprobado" ? "verificada" : "pendiente",
      emailValidado: true,
    });
    setRole("cliente");
    if (estado === "aprobado") {
      navigate({ to: "/app" });
      return;
    }
    navigate({ to: "/onboarding/en-proceso" });
  };

  const entrarDemo = () => {
    cargarDemo();
    setRole("cliente");
    toast.success("Bienvenido a la demo de Jaika");
    navigate({ to: "/app" });
  };

  return (
    <AuthShell
      leftEyebrow="Jaika · Acceso"
      leftTitle="Tu crédito respaldado por fideicomiso, de principio a fin."
      leftBody="Con tu 10% de inicial, tu crédito está preaprobado. Recorre el proceso completo y conoce cómo Jaika te acompaña en cada etapa."
    >
      <FormTitle
        eyebrow="Portal del cliente"
        title="Inicia sesión"
        subtitle="Consulta el estado de tu solicitud y continúa tu proceso."
      />
      <LoginForm onSuccess={handleLoginSuccess} />

      <div className="mt-6 border-t border-black-100 pt-6">
        <SecondaryButton onClick={entrarDemo} className="w-full justify-center">
          Entrar a la demo
        </SecondaryButton>
        <p className="mt-3 text-center text-[11px] text-black-400">
          Recorre el portal con el perfil verificado de María Fernanda Quispe, Perú, DNI. No
          requiere cuenta.
        </p>
      </div>
    </AuthShell>
  );
}
