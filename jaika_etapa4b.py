#!/usr/bin/env python3
"""
Etapa 4b de la demo Jaika: termina la limpieza que dejo pendiente jaika_etapa4.py.

Uso (desde la carpeta jaika-demo):
    python jaika_etapa4b.py . --dry-run     # muestra lo que haria, no cambia nada
    python jaika_etapa4b.py .               # aplica los cambios
    python jaika_etapa4b.py . --build       # aplica y corre npm run build + npx tsc --noEmit

Que hace:
  B1  Borra archivos HUERFANOS: ningun archivo vivo los importa (transferencias, comprobantes,
      Payway, BDC, etc.). Se calcula siguiendo los imports desde todas las rutas.
  B2  Quita del footer de index.tsx los enlaces a /legales/comisiones y /legales/arrepentimiento.
  B3  Reescribe verificar-correo.tsx para que no use Supabase (verificacion simulada).
  B4  Reescribe legales.terminos.tsx y legales.privacidad.tsx con texto de ejemplo de Jaika.
  B5  Corrige el voseo de recuperar.tsx y reset-password.tsx.

Seguridad: solo corre en el repo jaika-demo y fuera de main. Todo queda en git: si algo no
te gusta, `git restore <archivo>` lo devuelve. No toca supabase.ts, onboarding-store.ts,
api/onboarding.ts, error-*.ts, __root.tsx ni components/ui.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

PROTEGIDOS = {"lib/supabase.ts", "lib/onboarding-store.ts", "lib/api/onboarding.ts",
              "lib/error-capture.ts", "lib/error-page.ts", "lib/lovable-error-reporting.ts",
              "lib/utils.ts", "routes/__root.tsx", "routeTree.gen.ts"}
CARPETAS_CANDIDATAS = ("lib/", "components/", "data/", "contexts/", "hooks/", "stores/", "assets/")
EXT_RESOLVER = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"]
IMPORT_RE = re.compile(r"""(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)["']([^"']+)["']""")

VOSEO_FIX = {
    "routes/recuperar.tsx": [("Ingresá", "Ingresa")],
    "routes/reset-password.tsx": [("Creá", "Crea"), ("Elegí", "Elige")],
}

VERIFICAR_CORREO = '''import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

// Demo Jaika: la verificacion de correo se simula, no llama a ningun servicio.
export const Route = createFileRoute("/verificar-correo")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    token: (search.token as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Correo verificado — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerificarCorreo,
});

function VerificarCorreo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-plata-50 px-6">
      <div className="w-full max-w-md bg-white border border-black-100 rounded-xl shadow-sm p-8 text-center">
        <div className="text-2xl font-bold tracking-tight text-navy-700">Jaika</div>
        <CheckCircle2 className="mx-auto mt-6 text-success" size={48} />
        <h1 className="mt-4 text-xl font-semibold text-black-800">Tu correo fue verificado</h1>
        <p className="mt-2 text-sm text-black-500">
          Ya puedes continuar con tu perfil y la validación de identidad.
        </p>
        <Link
          to="/onboarding/datos-personales"
          className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-md bg-navy-700 text-white text-sm font-semibold hover:opacity-90"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
'''

def legal_page(ruta: str, titulo: str, secciones: list[tuple[str, str]]) -> str:
    cuerpo = "\n".join(
        f'''          <div>
            <h2 className="text-base font-semibold text-black-800">{h}</h2>
            <p className="mt-2">{t}</p>
          </div>''' for h, t in secciones)
    return f'''import {{ createFileRoute, Link }} from "@tanstack/react-router";
import {{ ArrowLeft }} from "lucide-react";

export const Route = createFileRoute("{ruta}")({{
  head: () => ({{
    meta: [
      {{ title: "{titulo} — Jaika" }},
      {{ name: "description", content: "{titulo} de la plataforma Jaika (texto de ejemplo para la demo)." }},
    ],
  }}),
  component: Page,
}});

function Page() {{
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black-100 bg-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-navy-700">Jaika</Link>
          <Link to="/" className="text-sm text-black-500 hover:text-black-800 inline-flex items-center gap-1">
            <ArrowLeft size={{14}} /> Volver al inicio
          </Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="inline-block text-xs font-semibold uppercase tracking-wider text-warning bg-warning-bg border border-warning-border rounded-full px-3 py-1">
          Texto de ejemplo para la demo
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-black-800">{titulo}</h1>
        <section className="mt-8 space-y-6 text-sm leading-relaxed text-black-500">
{cuerpo}
        </section>
      </article>
    </div>
  );
}}
'''

TERMINOS = legal_page("/legales/terminos", "Términos y condiciones", [
    ("1. Sobre Jaika", "Jaika es una plataforma que facilita la solicitud, preaprobación y seguimiento de créditos respaldados por fideicomiso para vivienda, vehículos, transporte, construcción y negocios."),
    ("2. Preaprobación", "La preaprobación se emite cuando el solicitante completa su registro, valida su identidad y acredita el 10% del valor del bien. No constituye un desembolso."),
    ("3. Fideicomiso", "Los fondos del crédito se administran mediante fideicomiso. El desembolso y la recaudación de cuotas se realizan fuera de la plataforma, según los contratos firmados en notaría."),
    ("4. Uso de la plataforma", "El usuario se compromete a ingresar información veraz y a mantener la confidencialidad de su acceso."),
])
PRIVACIDAD = legal_page("/legales/privacidad", "Políticas de privacidad", [
    ("1. Datos que tratamos", "Datos de identificación, documento de identidad, verificación facial, datos de contacto y la información del bien a financiar."),
    ("2. Finalidad", "Validar la identidad del solicitante, evaluar y preaprobar su crédito, y mantenerlo informado sobre cada etapa."),
    ("3. Seguridad", "La información se trata con confidencialidad y solo la conoce el equipo de Jaika que gestiona la solicitud."),
    ("4. Derechos", "El usuario puede solicitar el acceso, la corrección o la eliminación de sus datos escribiendo al equipo de Jaika."),
])


def sh(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True,
                          text=True, encoding="utf-8", errors="replace")


def check_git(root: Path):
    r = sh("git remote -v", root)
    if "jaika-demo" not in (r.stdout or "") or "MoliPay-Enterprises" in (r.stdout or ""):
        sys.exit("ABORTADO: el remoto no es jaika-demo.\n" + (r.stdout or ""))
    b = (sh("git rev-parse --abbrev-ref HEAD", root).stdout or "").strip()
    if b in ("main", "master"):
        sys.exit(f"ABORTADO: estas en la rama '{b}'. Cambia a demo-jaika.")
    print(f"Repositorio OK: jaika-demo, rama {b}\n")


def resolver(spec: str, desde: Path, src: Path):
    if spec.startswith("@/"):
        base = src / spec[2:]
    elif spec.startswith("."):
        base = (desde.parent / spec).resolve()
    else:
        return None
    for ext in EXT_RESOLVER:
        c = Path(str(base) + ext)
        if c.is_file():
            return c.resolve()
    return None


def alcanzables(src: Path) -> set[Path]:
    entradas = [p for p in (src / "routes").glob("*.tsx")]
    entradas += [src / n for n in ("router.tsx", "start.ts", "server.ts", "routeTree.gen.ts") if (src / n).exists()]
    vistos, pila = set(), [p.resolve() for p in entradas]
    while pila:
        f = pila.pop()
        if f in vistos:
            continue
        vistos.add(f)
        if f.suffix not in (".ts", ".tsx", ".js", ".jsx"):
            continue
        for spec in IMPORT_RE.findall(f.read_text(encoding="utf-8", errors="ignore")):
            spec = spec.split("?")[0]
            r = resolver(spec, f, src)
            if r and r not in vistos:
                pila.append(r)
    return vistos


def escribir(p: Path, contenido: str, dry: bool, etiqueta: str):
    if not p.exists():
        print(f"  {etiqueta:5} {p.name:45} NO EXISTE (se omite)")
        return
    actual = p.read_text(encoding="utf-8", errors="ignore")
    if actual.replace("\r\n", "\n") == contenido:
        print(f"  {etiqueta:5} {p.name:45} YA APLICADO")
        return
    print(f"  {etiqueta:5} {p.name:45} {'SE REESCRIBIRIA' if dry else 'REESCRITO'}")
    if not dry:
        p.write_text(contenido, encoding="utf-8", newline="\n")


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("root", nargs="?", default=".")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--build", action="store_true")
    a = ap.parse_args()
    root = Path(a.root).resolve()
    src = root / "src"
    if not src.is_dir():
        sys.exit(f"No encuentro {src}")
    check_git(root)
    dry = a.dry_run

    def huerfanos():
        vivos = alcanzables(src)
        css = " ".join(c.read_text(encoding="utf-8", errors="ignore") for c in src.rglob("*.css"))
        out = []
        for p in src.rglob("*"):
            if not p.is_file():
                continue
            rel = p.relative_to(src).as_posix()
            if rel in PROTEGIDOS or rel.startswith("components/ui/") or p.suffix == ".css":
                continue
            if not rel.startswith(CARPETAS_CANDIDATAS):
                continue
            if rel.startswith("assets/") and p.name in css:
                continue
            if p.resolve() not in vivos:
                out.append(p)
        return out

    print("== B2. ENLACES DEL FOOTER A LEGALES ELIMINADOS ==")
    idx = src / "routes" / "index.tsx"
    if idx.exists():
        lineas = idx.read_text(encoding="utf-8", errors="ignore").splitlines(keepends=True)
        nuevas, cambios = [], 0
        for i, l in enumerate(lineas, 1):
            if re.search(r"/legales/(comisiones|arrepentimiento)", l):
                if "<li" in l and "</li>" in l:
                    print(f"  B2    index.tsx:{i:<5} se quita la linea: {l.strip()[:90]}")
                    cambios += 1
                    continue
                nl = re.sub(r"/legales/(comisiones|arrepentimiento)", "/legales/terminos", l)
                print(f"  B2    index.tsx:{i:<5} enlace -> /legales/terminos: {l.strip()[:80]}")
                nuevas.append(nl); cambios += 1
                continue
            nuevas.append(l)
        if cambios == 0:
            print("  B2    index.tsx                                    YA APLICADO")
        elif not dry:
            idx.write_text("".join(nuevas), encoding="utf-8", newline="")
    print()

    print("== B3. VERIFICAR-CORREO SIN SUPABASE ==")
    escribir(src / "routes" / "verificar-correo.tsx", VERIFICAR_CORREO, dry, "B3")
    print()

    print("== B4. LEGALES DE JAIKA ==")
    escribir(src / "routes" / "legales.terminos.tsx", TERMINOS, dry, "B4")
    escribir(src / "routes" / "legales.privacidad.tsx", PRIVACIDAD, dry, "B4")
    print()

    print("== B5. VOSEO ==")
    for rel, pares in VOSEO_FIX.items():
        p = src / rel
        if not p.exists():
            print(f"  B5    {rel:45} NO EXISTE"); continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        n = t
        for viejo, nuevo in pares:
            n = re.sub(rf"\b{viejo}\b", nuevo, n)
        if n == t:
            print(f"  B5    {rel:45} YA APLICADO")
        else:
            print(f"  B5    {rel:45} {'SE CORREGIRIA' if dry else 'CORREGIDO'}")
            if not dry:
                p.write_text(n, encoding="utf-8", newline="")
    print()

    print("== B1. ARCHIVOS HUERFANOS (nadie los importa) ==")
    lista = huerfanos()
    for p in sorted(lista):
        print(f"  B1    {p.relative_to(src).as_posix():60} {'SE BORRARIA' if dry else 'BORRADO'}")
        if not dry:
            p.unlink()
    if not lista:
        print("  ninguno")
    print()

    if dry:
        print("DRY-RUN: no se cambio nada.")
        return

    if a.build:
        print("== BUILD (regenera routeTree.gen.ts) ==")
        r = sh("npm run build", root)
        print((r.stdout or "")[-2000:]); print((r.stderr or "")[-2000:])
        print("BUILD", "OK" if r.returncode == 0 else "CON ERRORES")
        print("\n== TYPECHECK ==")
        r = sh("npx tsc --noEmit", root)
        print((r.stdout or "")[-3000:]); print((r.stderr or "")[-1000:])
        print("TSC", "OK" if r.returncode == 0 else "CON ERRORES")

    print("\nListo. Revisa con: git status   y si algo no te gusta: git restore <archivo>")


if __name__ == "__main__":
    main()
