import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, PrimaryButton, SuccessCard } from "@/components/onboarding";
import { useDemoMode } from "@/contexts/demo-mode";
import {
  formatearMonto,
  paisPorNombre,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/onboarding/en-proceso")({
  head: () => ({
    meta: [
      { title: "Identidad verificada — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EnProceso,
});

function EnProceso() {
  const nav = useNavigate();
  const { setRole } = useDemoMode();
  const { perfil, solicitud } = useJaikaDemo();
  const pais = paisPorNombre(perfil.paisPostula);

  const irAlPortal = () => {
    setRole("cliente");
    nav({ to: "/app/solicitud" });
  };

  return (
    <AuthShell
      leftEyebrow="Paso 5 · Identidad"
      leftTitle="Tu identidad está verificada."
      leftBody={`Tu solicitud será atendida por el equipo de Jaika en ${pais.nombre}.`}
      step="Verificación completa"
    >
      <SuccessCard
        variant="success"
        title="Identidad verificada"
        body={
          <>
            <p>
              Completaste la validación de tu documento, la verificación facial y tu residencia.
              Tu perfil está listo para continuar con la solicitud de crédito.
            </p>
            {solicitud && (
              <p className="mt-3 text-xs text-black-400">
                Simulación guardada: {solicitud.tipoBien} ·{" "}
                {formatearMonto(solicitud.valor, solicitud.moneda)} · {solicitud.plazo} meses.
              </p>
            )}
          </>
        }
      >
        <PrimaryButton onClick={irAlPortal}>Solicitar mi crédito</PrimaryButton>
      </SuccessCard>
    </AuthShell>
  );
}
