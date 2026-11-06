import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import {
  AuthShell,
  Field,
  FileUpload,
  FormTitle,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  Stepper,
  WizardNav,
} from "@/components/onboarding";
import { useOnboarding, type FileRef } from "@/lib/onboarding-store";
import { PAISES, paisPorNombre, useJaikaDemo } from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/onboarding/kyc")({
  head: () => ({
    meta: [
      { title: "Verificación de identidad — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KycWizard,
});

const STEPS = ["Documento", "Verificación facial", "Residencia"];

type FaceState = "pendiente" | "verificando" | "verificado";

function KycWizard() {
  const nav = useNavigate();
  const { perfil, completarIdentidad } = useJaikaDemo();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<{
    frente: FileRef;
    dorso: FileRef;
    selfie: FileRef;
  }>({ frente: null, dorso: null, selfie: null });
  const [faceState, setFaceState] = useState<FaceState>(
    perfil.verificadoFacial ? "verificado" : "pendiente",
  );
  const [addr, setAddr] = useState({
    direccion: perfil.direccion ?? "",
    ciudad: perfil.ciudad ?? "",
    paisResidencia: perfil.paisResidencia || perfil.paisPostula || "Perú",
  });
  const [err, setErr] = useState<Record<string, string>>({});

  const pais = paisPorNombre(perfil.paisPostula);
  const esPasaporte = perfil.tipoDocumento === "Pasaporte";
  const tipoDocumento = perfil.tipoDocumento ?? "documento";

  useEffect(() => {
    if (faceState !== "verificando") return;
    const timer = window.setTimeout(() => setFaceState("verificado"), 2200);
    return () => window.clearTimeout(timer);
  }, [faceState]);

  const canNext =
    (step === 0 && !!files.frente && (esPasaporte || !!files.dorso)) ||
    (step === 1 && faceState === "verificado") ||
    step === 2;

  const finish = () => {
    const e: Record<string, string> = {};
    if (!addr.direccion.trim()) e.direccion = "Ingresa tu dirección";
    if (!addr.ciudad.trim()) e.ciudad = "Ingresa tu ciudad";
    if (!addr.paisResidencia) e.paisResidencia = "Selecciona tu país";
    setErr(e);
    if (Object.keys(e).length) return;

    completarIdentidad({
      direccion: addr.direccion.trim(),
      ciudad: addr.ciudad.trim(),
      paisResidencia: addr.paisResidencia,
      verificadoFacial: true,
    });

    useOnboarding.getState().setKyc({
      dniFrente: files.frente,
      dniDorso: files.dorso,
      selfie: files.selfie,
      direccion: addr.direccion.trim(),
      ciudad: addr.ciudad.trim(),
    });

    nav({ to: "/onboarding/en-proceso" });
  };

  return (
    <AuthShell
      leftEyebrow="Paso 4 · Verificación de identidad"
      leftTitle="Validamos tu identidad de forma segura."
      leftBody="Tu documento y tu rostro se usan únicamente para confirmar tu identidad dentro de la solicitud."
      step={`Paso ${step + 1} de 3`}
    >
      <FormTitle
        eyebrow="KYC · Identidad"
        title="Verificación de identidad"
        subtitle="Completa los tres pasos para continuar con tu solicitud."
      />
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black-800">
            {esPasaporte
              ? "Carga la página principal de tu pasaporte"
              : `Carga el frente y el dorso de tu ${tipoDocumento.toLowerCase()}`}
          </h2>
          <p className="text-xs leading-relaxed text-black-400">
            Asegúrate de que el documento se vea completo, legible y sin reflejos.
          </p>
          <FileUpload
            label={esPasaporte ? "Página principal" : "Frente del documento"}
            hint={`${tipoDocumento} · imagen o PDF`}
            value={files.frente}
            onChange={(v) => setFiles({ ...files, frente: v })}
          />
          {!esPasaporte && (
            <FileUpload
              label="Dorso del documento"
              hint={`${tipoDocumento} · imagen o PDF`}
              value={files.dorso}
              onChange={(v) => setFiles({ ...files, dorso: v })}
            />
          )}
          <WizardNav
            onNext={() => setStep(1)}
            nextDisabled={!canNext}
            nextLabel="Siguiente"
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-black-800">Verificación facial</h2>
            <p className="mt-1 text-xs text-black-400">
              Coloca tu rostro dentro del círculo y sigue las instrucciones.
            </p>
          </div>

          <div className="relative mx-auto h-56 w-56">
            <div
              className={`absolute inset-0 rounded-full border-2 ${
                faceState === "verificado"
                  ? "border-success bg-success-bg"
                  : faceState === "verificando"
                    ? "border-jaika-gold/40 bg-jaika-gold/5"
                    : "border-dashed border-black-200 bg-plata-50"
              }`}
            />
            {faceState === "verificando" && (
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-jaika-gold animate-spin" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {faceState === "verificado" ? (
                <CheckCircle2 size={72} strokeWidth={1.4} className="text-success" />
              ) : faceState === "verificando" ? (
                <ScanFace size={72} strokeWidth={1.2} className="text-jaika-gold-dark animate-pulse" />
              ) : (
                <ScanFace size={72} strokeWidth={1.2} className="text-black-300" />
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-black-100 bg-white px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
              {faceState === "pendiente" && "Listo para verificar"}
              {faceState === "verificando" && (
                <span className="inline-flex items-center gap-1.5 text-jaika-gold-dark">
                  <Loader2 size={12} className="animate-spin" /> Verificando…
                </span>
              )}
              {faceState === "verificado" && (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <CheckCircle2 size={12} /> Identidad verificada
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-xs text-black-500">
            {[
              "Buena iluminación, de frente a la cámara",
              "Sin lentes, gorros ni mascarillas",
              "Rostro centrado y sin sombras",
              "Permite el acceso a tu cámara",
            ].map((instruccion) => (
              <div
                key={instruccion}
                className="flex items-start gap-2 rounded-sm border border-black-100 bg-plata-50 px-3 py-2"
              >
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
                <span>{instruccion}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {faceState === "pendiente" && (
              <PrimaryButton onClick={() => setFaceState("verificando")}>
                Iniciar verificación
              </PrimaryButton>
            )}
            {faceState === "verificando" && (
              <PrimaryButton disabled>Verificando identidad…</PrimaryButton>
            )}
            {faceState === "verificado" && (
              <SecondaryButton
                onClick={() => setFaceState("pendiente")}
                className="w-full justify-center"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCw size={14} /> Reintentar
                </span>
              </SecondaryButton>
            )}
          </div>

          <WizardNav
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={!canNext}
            nextLabel="Siguiente"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black-800">Residencia</h2>
          <p className="text-xs leading-relaxed text-black-400">
            Indica el domicilio donde resides actualmente.
          </p>
          <Field
            label="Dirección"
            value={addr.direccion}
            onChange={(e) => setAddr({ ...addr, direccion: e.target.value })}
            error={err.direccion}
            autoComplete="street-address"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Ciudad"
              value={addr.ciudad}
              onChange={(e) => setAddr({ ...addr, ciudad: e.target.value })}
              error={err.ciudad}
              autoComplete="address-level2"
            />
            <SelectField
              label="País"
              value={addr.paisResidencia}
              onChange={(v) => setAddr({ ...addr, paisResidencia: v })}
              options={PAISES.map((p) => p.nombre)}
              error={err.paisResidencia}
            />
          </div>
          <div className="rounded-sm border border-black-100 bg-plata-50 px-4 py-3 text-xs text-black-500">
            País de postulación: <strong className="text-black-800">{pais.nombre}</strong> · Moneda
            de referencia: <strong className="text-black-800">{pais.moneda}</strong>
          </div>
          <WizardNav
            onBack={() => setStep(1)}
            onNext={finish}
            nextLabel="Finalizar verificación"
            nextDisabled={!canNext}
          />
          <div className="text-center pt-2">
            <Link
              to="/login"
              search={{ register: undefined }}
              className="text-xs text-black-400 hover:text-jaika-gold-dark underline underline-offset-2"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
