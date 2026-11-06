import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, PrimaryButton, SuccessCard } from "@/components/onboarding";

export const Route = createFileRoute("/registro/validacion-exitosa")({
  head: () => ({
    meta: [
      { title: "Correo validado — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ValidacionExitosa,
});

function ValidacionExitosa() {
  const nav = useNavigate();
  return (
    <AuthShell
      leftEyebrow="Paso 2 · Verificación"
      leftTitle="Tu correo quedó verificado."
      step="Correo validado"
    >
      <SuccessCard
        title="Validación exitosa"
        body={
          <p>
            Tu correo electrónico fue validado. Ahora completa tu perfil de solicitante para
            continuar con la verificación de identidad.
          </p>
        }
      >
        <PrimaryButton onClick={() => nav({ to: "/onboarding/datos-personales" })}>
          Continuar con el alta
        </PrimaryButton>
      </SuccessCard>
    </AuthShell>
  );
}
