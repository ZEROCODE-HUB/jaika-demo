#!/usr/bin/env python3
"""
Etapa 4 (limpieza y verificacion) de la demo Jaika sobre el clon de Molipay Enterprises.

Uso (desde la carpeta jaika-demo):
    python jaika_etapa4.py . --dry-run      # solo revisa y reporta, no borra nada
    python jaika_etapa4.py .                # borra lo que es seguro borrar
    python jaika_etapa4.py . --build        # ademas corre npm run build y npx tsc --noEmit

Reglas de seguridad:
- Solo corre si el remoto es jaika-demo y la rama no es main (aborta si no).
- Nunca borra supabase.ts, onboarding-store.ts, api/onboarding.ts, error-*.ts ni __root.tsx.
- No borra un archivo de data/lib/assets si otro archivo todavia lo importa.
- No modifica contenido: los restos de Molipay, voseo y Supabase se REPORTAN para corregir a mano.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

ROUTES_A_BORRAR = [
    "app.transferencias", "app.subcuentas", "app.destinatarios",
    "app.link-pago", "app.link-pago.dashboard", "app.link-pago.productos", "app.link-pago.e-commerce",
    "app.qr", "app.qr.dashboard", "app.qr.puntos-de-venta",
    "app.servicios",
    "app.cobros", "app.cobros.index", "app.cobros.nuevo", "app.cobros.gestion", "app.cobros.lote.$id",
    "app.liquidaciones", "app.api", "app.api-config", "app.ecommerce",
    "p.$code", "legales.comisiones", "legales.arrepentimiento",
    "onboarding.datos-empresa", "registro.empresa",
]
DATA_A_BORRAR = ["data/links-pago.ts", "data/cobros-masivos.ts"]
LIB_A_BORRAR = ["lib/payment-processor.ts", "lib/transfer-orchestrator.ts", "lib/recipient-validation.ts"]
ASSETS_A_BORRAR = [
    "assets/molly-logo.png", "assets/moli-logo.png.asset.json", "assets/Capturadepantalla.png",
    "assets/miniatura.png", "assets/miniaturafinal.png",
]
PROTEGIDOS = {"lib/supabase.ts", "lib/onboarding-store.ts", "lib/api/onboarding.ts",
              "lib/error-capture.ts", "lib/error-page.ts", "routes/__root.tsx"}

RESTOS = re.compile(r"\b(Molly|Moli|MoliPay|Molipay|MolliPay|CUIT|CUIL|CBU|CVU|RENAPER|BCRA|AFIP|ARCA|COELSA|Payway)\b")
VOSEO = re.compile(
    r"\b(vos|cargá|andá|elegí|ingresá|hacé|tenés|podés|querés|sabés|completá|seleccioná|revisá|"
    r"confirmá|agregá|configurá|activá|indicá|escribí|subí|verificá|aceptá|creá|usá|mirá|"
    r"contactá|descargá|compartí|presioná|tocá|validá|consultá)\b", re.IGNORECASE)
SUPABASE = re.compile(r"requireSupabase|from\s+[\"']@/lib/supabase[\"']|lib/api/onboarding|@supabase/")
RUTAS_DEMO = re.compile(r"^(index|registro.*|verificar-correo|onboarding.*|app.*|login)\.tsx$")
EXTS = {".ts", ".tsx", ".css"}


def sh(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")


def check_git(root: Path):
    r = sh("git remote -v", root)
    if "jaika-demo" not in r.stdout or "MoliPay-Enterprises" in r.stdout:
        sys.exit("ABORTADO: el remoto no es jaika-demo. Ejecuta el script dentro de la carpeta jaika-demo.\n" + r.stdout)
    b = sh("git rev-parse --abbrev-ref HEAD", root).stdout.strip()
    if b in ("main", "master"):
        sys.exit(f"ABORTADO: estas en la rama '{b}'. Crea o cambia a la rama demo-jaika primero.")
    print(f"Repositorio OK: jaika-demo, rama {b}\n")


def archivos_src(src: Path):
    return [p for p in src.rglob("*") if p.is_file() and p.suffix in EXTS and p.name != "routeTree.gen.ts"]


def referenciado(rel: str, src: Path, excluir: Path) -> list[str]:
    stem = Path(rel).with_suffix("").as_posix()          # data/links-pago
    nombre = Path(rel).name                                # molly-logo.png
    base = Path(rel).stem                                   # links-pago
    patrones = [f"@/{stem}", f"/{base}\"", f"/{base}'", nombre]
    usos = []
    for f in archivos_src(src):
        if f == excluir:
            continue
        t = f.read_text(encoding="utf-8", errors="ignore")
        if any(p in t for p in patrones):
            usos.append(f.relative_to(src).as_posix())
    return usos


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

    borrados, ya, bloqueados = [], [], []

    print("== 1. ARCHIVOS A ELIMINAR ==")
    rutas_borradas_url = []
    for r in ROUTES_A_BORRAR:
        rel = f"routes/{r}.tsx"
        p = src / rel
        url = "/" + r.replace(".index", "").replace(".", "/")
        if not p.exists():
            ya.append(rel); print(f"  {rel:55} YA ELIMINADO"); continue
        rutas_borradas_url.append(url)
        borrados.append(p); print(f"  {rel:55} BORRAR")
    for rel in DATA_A_BORRAR + LIB_A_BORRAR + ASSETS_A_BORRAR:
        p = src / rel
        if rel in PROTEGIDOS:
            continue
        if not p.exists():
            ya.append(rel); print(f"  {rel:55} YA ELIMINADO"); continue
        marcados = {b.relative_to(src).as_posix() for b in borrados}
        usos = [u for u in referenciado(rel, src, p) if u not in marcados]
        if usos:
            bloqueados.append((rel, usos)); print(f"  {rel:55} SE QUEDA (lo usa: {', '.join(usos[:3])})")
        else:
            borrados.append(p); print(f"  {rel:55} BORRAR")

    if not a.dry_run:
        for p in borrados:
            p.unlink()
            print(f"  eliminado: {p.relative_to(src).as_posix()}")

    vivos = [f for f in archivos_src(src) if f not in borrados]

    print("\n== 2. ENLACES A RUTAS ELIMINADAS ==")
    todas = ["/" + r.replace(".index", "").replace(".", "/") for r in ROUTES_A_BORRAR]
    n = 0
    for f in vivos:
        for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            hits = {url for url in todas if re.search(re.escape(url) + r"[\"'?#]", line)}
            for url in sorted(hits):
                n += 1; print(f"  {f.relative_to(src).as_posix()}:{i}  -> {url}")
    print("  ninguno" if n == 0 else f"  {n} enlace(s) a corregir")

    print("\n== 3. RUTAS DE LA DEMO QUE AUN USAN SUPABASE ==")
    n = 0
    for f in vivos:
        if f.parent.name == "routes" and RUTAS_DEMO.match(f.name) and f.name != "login.tsx":
            for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                if SUPABASE.search(line):
                    n += 1; print(f"  {f.relative_to(src).as_posix()}:{i}  {line.strip()[:90]}")
    print("  ninguna" if n == 0 else f"  {n} linea(s) a corregir (login.tsx se excluye: su formulario real puede quedar)")

    print("\n== 4. RESTOS DE MOLIPAY / ARGENTINA ==")
    n = 0
    for f in vivos:
        rel = f.relative_to(src).as_posix()
        if rel in PROTEGIDOS:
            continue
        for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            m = RESTOS.search(line)
            if m:
                n += 1; print(f"  {rel}:{i}  [{m.group(0)}]  {line.strip()[:80]}")
    print("  ninguno" if n == 0 else f"  {n} linea(s) a revisar")

    print("\n== 5. VOSEO ==")
    n = 0
    for f in vivos:
        for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            m = VOSEO.search(line)
            if m:
                n += 1; print(f"  {f.relative_to(src).as_posix()}:{i}  [{m.group(0)}]  {line.strip()[:80]}")
    print("  ninguno" if n == 0 else f"  {n} linea(s) a revisar")

    print("\n== 6. PANTALLAS QUE NO DEBEN EXISTIR ==")
    prohibidas = re.compile(r"agendar|agendamiento|calendario de citas|pagar cuota|pagar mi cuota", re.IGNORECASE)
    n = 0
    for f in vivos:
        if f.parent.name == "routes" or "components" in f.parts:
            for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                if prohibidas.search(line):
                    n += 1; print(f"  {f.relative_to(src).as_posix()}:{i}  {line.strip()[:80]}")
    print("  ninguna" if n == 0 else f"  {n} linea(s) a revisar")

    print("\nRESUMEN")
    print(f"  {'se borrarian' if a.dry_run else 'borrados'}: {len(borrados)} | ya eliminados: {len(ya)} | se quedan por estar en uso: {len(bloqueados)}")
    if a.dry_run:
        print("  DRY-RUN: no se borro nada.")
        return

    if a.build:
        print("\n== 7. BUILD (regenera routeTree.gen.ts) ==")
        r = sh("npm run build", root); print((r.stdout or "")[-1500:], (r.stderr or "")[-1500:])
        print("BUILD", "OK" if r.returncode == 0 else "CON ERRORES")
        print("\n== 8. TYPECHECK ==")
        r = sh("npx tsc --noEmit", root); print((r.stdout or "")[-2500:], (r.stderr or "")[-1000:])
        print("TSC", "OK" if r.returncode == 0 else "CON ERRORES")
    print("\nListo.")


if __name__ == "__main__":
    main()
