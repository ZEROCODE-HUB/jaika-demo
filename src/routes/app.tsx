import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronDown,
  FastForward,
  FileText,
  FlaskConical,
  FolderOpen,
  Home,
  RotateCcw,
  Route as RouteIcon,
  Shield,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { PortalShell, type NavItem, type NavLeaf } from "@/components/portal-shell";
import { SupportBot } from "@/components/support-bot";
import { useDemoMode } from "@/contexts/demo-mode";
import { RouteSkeleton } from "@/components/route-skeleton";
import { useOnboarding } from "@/lib/onboarding-store";
import {
  ETAPAS_CREDITO,
  ETAPA_LABEL,
  nombreCompleto,
  siguienteEtapa,
  useJaikaDemo,
  type EtapaCredito,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  pendingComponent: RouteSkeleton,
});

function AppLayout() {
  const nav = useNavigate();
  const { role, setRole } = useDemoMode();
  const perfil = useJaikaDemo((s) => s.perfil);
  const etapa = useJaikaDemo((s) => s.etapa);
  const noLeidas = useJaikaDemo(
    (s) => s.notificaciones.filter((notificacion) => !notificacion.leida).length,
  );
  const avanzarEtapa = useJaikaDemo((s) => s.avanzarEtapa);
  const irAEtapa = useJaikaDemo((s) => s.irAEtapa);
  const resetDemo = useJaikaDemo((s) => s.resetDemo);
  const onboardingName = useOnboarding((s) => s.registro.nombre);
  const onboardingEmail = useOnboarding((s) => s.registro.email);
  const userName = nombreCompleto(perfil) || onboardingName;
  const userEmail = perfil.email || onboardingEmail;
  const [demoOpen, setDemoOpen] = useState(false);
  const [etapaDemo, setEtapaDemo] = useState<EtapaCredito>(etapa);

  useEffect(() => {
    if (role !== "cliente") setRole("cliente");
  }, [role, setRole]);

  useEffect(() => {
    setEtapaDemo(etapa);
  }, [etapa]);

  const items = useMemo<NavItem[]>(
    () => [
      { to: "/app", label: "Inicio", icon: Home },
      { to: "/app/solicitud", label: "Solicitud de crédito", icon: FileText },
      { to: "/app/preaprobacion", label: "Preaprobación", icon: BadgeCheck },
      { to: "/app/seguimiento", label: "Seguimiento", icon: RouteIcon },
      { to: "/app/cronograma", label: "Cronograma", icon: CalendarDays },
      { to: "/app/documentos", label: "Documentos", icon: FolderOpen },
      {
        to: "/app/notificaciones",
        label: "Notificaciones",
        icon: Bell,
        badge: noLeidas,
      },
      { to: "/app/cuenta", label: "Mi cuenta", icon: UserCog },
      { to: "/app/seguridad", label: "Seguridad", icon: Shield },
    ],
    [noLeidas],
  );

  const mobileNav: NavLeaf[] = [
    { to: "/app", label: "Inicio", icon: Home },
    { to: "/app/seguimiento", label: "Seguimiento", icon: RouteIcon },
    { to: "/app/cronograma", label: "Cronograma", icon: CalendarDays },
    {
      to: "/app/notificaciones",
      label: "Notificaciones",
      icon: Bell,
      badge: noLeidas,
    },
  ];

  const onAvanzar = () => {
    const siguiente = siguienteEtapa(etapa);
    if (!siguiente) {
      toast.info("La etapa actual no se puede avanzar desde el panel demo.");
      return;
    }
    avanzarEtapa();
    toast.success(`Etapa actualizada: ${ETAPA_LABEL[siguiente]}`);
  };

  const onIrAEtapa = () => {
    irAEtapa(etapaDemo);
    toast.success(`Demo posicionada en: ${ETAPA_LABEL[etapaDemo]}`);
    if (etapaDemo === "sin_solicitud") nav({ to: "/app" });
  };

  const onReiniciar = () => {
    resetDemo();
    setDemoOpen(false);
    toast.success("Demo reiniciada");
    nav({ to: "/app" });
  };

  return (
    <>
      <PortalShell
        nav={items}
        mobileNav={mobileNav}
        title="Mi crédito"
        userName={userName}
        userEmail={userEmail}
      >
        <Outlet />
        <SupportBot />
      </PortalShell>

      <div className="fixed bottom-20 lg:bottom-6 left-4 z-40">
        {demoOpen && (
          <div className="mb-2 w-72 rounded-md border border-black-100 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-black-800">Modo demo</div>
                <p className="mt-1 text-xs leading-relaxed text-black-400">
                  Acciones de presentación para simular el avance del crédito.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                className="text-xs text-black-400 hover:text-black-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={onAvanzar}
                className="flex w-full items-center gap-2 rounded-sm border border-black-100 bg-plata-50 px-3 py-2 text-left text-xs font-semibold text-black-700 hover:bg-plata-100 disabled:opacity-50"
                disabled={!siguienteEtapa(etapa)}
              >
                <FastForward size={14} className="text-jaika-gold-dark" />
                Avanzar etapa del crédito
              </button>

              <div>
                <label htmlFor="demo-etapa" className="mb-1.5 block text-[11px] font-semibold text-black-500">
                  Ir a la etapa…
                </label>
                <div className="flex gap-2">
                  <select
                    id="demo-etapa"
                    value={etapaDemo}
                    onChange={(event) => setEtapaDemo(event.target.value as EtapaCredito)}
                    className="h-9 min-w-0 flex-1 rounded-sm border border-black-100 bg-white px-2 text-xs text-black-700 outline-none focus:border-navy-500"
                  >
                    {ETAPAS_CREDITO.map((item) => (
                      <option key={item} value={item}>
                        {ETAPA_LABEL[item]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onIrAEtapa}
                    className="h-9 rounded-sm bg-[#1c2e4a] px-3 text-xs font-semibold text-white hover:bg-navy-600"
                  >
                    Ir
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={onReiniciar}
                className="flex w-full items-center gap-2 rounded-sm border border-black-100 px-3 py-2 text-left text-xs font-semibold text-black-600 hover:bg-black-50"
              >
                <RotateCcw size={14} /> Reiniciar demo
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setDemoOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-full border border-black-100 bg-white px-3 py-2 text-[11px] font-semibold text-black-500 shadow-md hover:text-black-800"
          aria-expanded={demoOpen}
        >
          <FlaskConical size={14} className="text-jaika-gold-dark" />
          Modo demo
          <ChevronDown
            size={12}
            className={`transition-transform ${demoOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </>
  );
}
