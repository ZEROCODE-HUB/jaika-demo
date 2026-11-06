import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, PasswordField, PrimaryButton, SuccessCard, FormTitle, validatePassword } from "@/components/onboarding";
import { getAuthErrorMessage, requireSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

type Mode = "loading" | "set" | "done" | "error";

function ResetPassword() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("loading");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const sb = requireSupabase();
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = params.get("code") ?? hash.get("code");
    const tokenHash = params.get("token_hash") ?? hash.get("token_hash");
    const type = (params.get("type") ?? hash.get("type") ?? "recovery") as string;
    const access = hash.get("access_token");

    (async () => {
      let err: unknown = null;
      try {
        if (code) {
          const r = await sb.auth.exchangeCodeForSession(code);
          err = r.error;
        } else if (tokenHash) {
          const r = await sb.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          err = r.error;
        } else if (access) {
          const r = await sb.auth.getSession();
          err = r.error ?? (r.data.session ? null : new Error("No se pudo leer la sesión del enlace."));
        } else {
          setMode("error");
          setErrMsg("El enlace de recuperación no es válido o le faltan parámetros.");
          return;
        }
      } catch (e) {
        err = e;
      }
      if (err) {
        setMode("error");
        setErrMsg(getAuthErrorMessage(err instanceof Error ? err.message : "No pudimos validar el enlace de recuperación."));
        return;
      }
      setMode("set");
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validatePassword(pw)) {
      setError("La contraseña no cumple los requisitos mínimos.");
      return;
    }
    if (pw !== pw2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const sb = requireSupabase();
    const { error: err } = await sb.auth.updateUser({ password: pw });
    if (err) {
      setError(getAuthErrorMessage(err.message));
      return;
    }
    setMode("done");
  };

  return (
    <AuthShell
      leftEyebrow="Jaika · Acceso"
      leftTitle="Tu crédito respaldado por fideicomiso."
      leftBody="Con tu 10% de inicial, tu crédito está preaprobado. Tu información viaja cifrada y se usa solo para gestionar tu solicitud."
    >
      {mode === "loading" && (
        <SuccessCard variant="loading" title="Validando tu enlace…" body={<p>Un momento por favor.</p>} />
      )}

      {mode === "error" && (
        <SuccessCard
          variant="error"
          title="Enlace no válido"
          body={<p>{errMsg} Solicita uno nuevo para continuar.</p>}
        >
          <PrimaryButton onClick={() => nav({ to: "/recuperar", search: { email: "" } })}>Solicitar nuevo enlace</PrimaryButton>
        </SuccessCard>
      )}

      {mode === "done" && (
        <SuccessCard
          title="Contraseña actualizada"
          body={<p>Tu contraseña se cambió correctamente. Ya puedes iniciar sesión con la nueva.</p>}
        >
          <PrimaryButton onClick={() => nav({ to: "/login", search: { register: undefined } })}>
            Iniciar sesión
          </PrimaryButton>
        </SuccessCard>
      )}

      {mode === "set" && (
        <>
          <FormTitle
            eyebrow="Nueva contraseña"
            title="Crea tu nueva contraseña"
            subtitle="Elige una contraseña segura que no hayas utilizado antes."
          />
          <form className="space-y-4" onSubmit={submit}>
            <PasswordField label="Nueva contraseña" value={pw} onChange={setPw} showRules />
            <PasswordField label="Confirmar contraseña" value={pw2} onChange={setPw2} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="pt-1">
              <PrimaryButton type="submit" disabled={!pw || !pw2}>
                Cambiar contraseña
              </PrimaryButton>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  );
}
