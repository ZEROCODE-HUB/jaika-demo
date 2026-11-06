import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell, PrimaryButton } from "@/components/onboarding";
import { useOnboarding } from "@/lib/onboarding-store";
import { useJaikaDemo } from "@/lib/jaika-demo-store";
import { JaikaLogo } from "@/components/jaika-logo";

export const Route = createFileRoute("/registro/validar-email")({
  head: () => ({
    meta: [
      { title: "Validar correo — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ValidarEmail,
});

function ValidarEmail() {
  const nav = useNavigate();
  const marcarEmailValidado = useJaikaDemo((s) => s.marcarEmailValidado);
  const { perfil } = useJaikaDemo();
  const markEmailOnboarding = useOnboarding((s) => s.markEmailValidado);

  const validar = () => {
    marcarEmailValidado();
    markEmailOnboarding();
    nav({ to: "/registro/validacion-exitosa" });
  };

  return (
    <AuthShell
      leftEyebrow="Simulación · Correo"
      leftTitle="Este es el correo que recibirías en tu bandeja."
      step="Validación de correo"
    >
      <div className="bg-white overflow-hidden rounded-sm border border-black-100">
        <div className="px-6 py-4 flex items-center justify-between bg-[#1c2e4a]">
          <JaikaLogo variant="light" />
          <span className="text-white/60 font-sans text-[0.65rem] tracking-[0.15em] uppercase">
            altas@jaika.com
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-xs text-black-400">Asunto</p>
          <p className="mt-1 mb-6 text-sm font-semibold text-black-800">
            Valida tu cuenta Jaika
          </p>

          <div className="text-sm text-black-600 space-y-4 leading-relaxed">
            <p>Hola {perfil.nombres || "solicitante"},</p>
            <p>
              Gracias por registrarte en Jaika. Para continuar con tu solicitud, valida tu correo
              electrónico.
            </p>
          </div>

          <div className="mt-8">
            <PrimaryButton onClick={validar}>Ya validé mi correo</PrimaryButton>
          </div>

          <p className="mt-6 text-xs text-black-400 leading-relaxed">
            Si tienes alguna duda, puedes contactarnos en{" "}
            <a
              href="mailto:soporte@jaika.com"
              className="underline underline-offset-2 hover:text-jaika-gold-dark"
            >
              soporte@jaika.com
            </a>
            .
          </p>

          <p className="mt-4 text-sm font-semibold text-black-800">¡Gracias!</p>

          <div className="mt-8 pt-4 border-t border-black-100 text-[10px] text-black-300 leading-relaxed space-y-1">
            <p>Enviado por Jaika</p>
            <div className="flex gap-3">
              <Link to="/" className="underline underline-offset-2 hover:text-jaika-gold-dark">
                Jaika
              </Link>
              <Link
                to="/legales/terminos"
                className="underline underline-offset-2 hover:text-jaika-gold-dark"
              >
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
