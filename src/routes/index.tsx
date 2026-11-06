import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bus,
  Car,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Globe2,
  HardHat,
  Home,
  Landmark,
  Lock,
  ScanFace,
  ShieldCheck,
  Store,
} from "lucide-react";
import { JaikaLogo } from "@/components/jaika-logo";
import hero17Src from "@/assets/hero-17.jpg";
import ogImageSrc from "@/assets/miniaturafinal.png";
import {
  PLAZOS,
  TIPOS_BIEN,
  calcularCredito,
  clampValorBien,
  formatearMonto,
  useJaikaDemo,
  valorInicialBien,
  valorMaximoBien,
  valorMinimoBien,
  type TipoBien,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaika — Créditos respaldados por fideicomiso" },
      {
        name: "description",
        content:
          "Con tu 10% de inicial, tu crédito está preaprobado. Créditos respaldados por fideicomiso para vivienda, vehículo y negocio, con tasas referenciales de 6% a 9%.",
      },
      { property: "og:title", content: "Jaika — Créditos respaldados por fideicomiso" },
      {
        property: "og:description",
        content:
          "Créditos respaldados por fideicomiso para vivienda, vehículo, transporte, construcción y negocio.",
      },
      { property: "og:image", content: ogImageSrc },
      { property: "og:image:width", content: "1901" },
      { property: "og:image:height", content: "904" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImageSrc },
    ],
  }),
  component: Landing,
});

function Eyebrow({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "light";
}) {
  const color =
    tone === "accent"
      ? "text-jaika-gold-dark"
      : tone === "light"
        ? "text-white/65"
        : "text-black-300";
  return (
    <div
      className={`font-sans text-[0.72rem] tracking-[0.14em] uppercase font-medium ${color}`}
    >
      {children}
    </div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`transition-all duration-300 hover:-translate-y-0.5 bg-white border border-black-100 rounded-md shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Landing() {
  return (
    <div className="bg-white text-black-700">
      <SiteHeader />
      <Hero />
      <LedgerStrip />
      <LineasCredito />
      <ComoFunciona />
      <Simulador />
      <Confianza />
      <Paises />
      <PreguntasFrecuentes />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled
    ? "bg-white/90 backdrop-blur-[12px] border-b border-black-100"
    : "bg-transparent";
  const text = scrolled ? "text-black-700" : "text-white/85";
  const outline = scrolled
    ? "border-black-200 text-black-700 hover:bg-black-50"
    : "border-white/40 text-white hover:bg-white/10";

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${solid}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
        <JaikaLogo size={32} variant={scrolled ? "dark" : "light"} />
        <nav
          className={`hidden lg:flex items-center gap-7 xl:gap-9 font-sans text-[0.95rem] font-medium ${text}`}
        >
          <a href="#lineas" className="hover:text-jaika-mint transition-colors">
            Créditos
          </a>
          <a href="#como-funciona" className="hover:text-jaika-mint transition-colors">
            Cómo funciona
          </a>
          <a href="#simulador" className="hover:text-jaika-mint transition-colors">
            Simulador
          </a>
          <a href="#paises" className="hover:text-jaika-mint transition-colors">
            Países
          </a>
          <a href="#preguntas" className="hover:text-jaika-mint transition-colors">
            Preguntas
          </a>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            search={{ register: undefined }}
            className={`hidden md:inline-flex h-10 items-center px-4 rounded-sm text-sm font-medium border transition-colors ${outline}`}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex h-9 sm:h-10 items-center px-3 sm:px-4 rounded-sm text-sm font-semibold text-white bg-jaika-gold hover:bg-jaika-gold-dark hover:text-white transition-colors whitespace-nowrap"
          >
            Solicitar mi crédito
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolation -mt-16 md:-mt-20">
      <div className="hero-kenburns">
        <div
          className="hero-bg-float"
          style={{ backgroundImage: `url(${hero17Src})` }}
          aria-hidden
        />
      </div>
      <div aria-hidden className="absolute inset-0 bg-[#0f1b2d]/70 pointer-events-none" />
      <div
        aria-hidden
        className="hero-vignette absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.45))] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-[15%] right-[5%] w-[500px] h-[500px] rounded-full bg-jaika-gold/10 blur-[70px] pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-[82vh] md:min-h-[90vh] pt-24 md:pt-40 pb-16 sm:pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 items-center">
          <div>
            <Eyebrow tone="light">Jaika · Créditos con respaldo</Eyebrow>
            <h1 className="font-bold text-[clamp(2rem,4.2vw,3.75rem)] leading-[1.02] mt-6 max-w-[24ch] text-white">
              Con tu 10% de inicial, tu crédito está preaprobado
            </h1>
            <p className="mt-6 max-w-xl text-white/75 text-base sm:text-lg leading-relaxed">
              Créditos respaldados por fideicomiso para vivienda, vehículo y negocio, con
              tasas referenciales de 6% a 9%.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/registro"
                className="inline-flex h-12 items-center gap-2 px-7 rounded-sm text-sm font-semibold text-white bg-jaika-gold hover:bg-jaika-gold-dark hover:text-white transition-colors"
              >
                Solicitar mi crédito <ArrowRight size={16} />
              </Link>
              <a
                href="#simulador"
                className="inline-flex h-12 items-center px-7 rounded-sm text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Simular
              </a>
            </div>
            <p className="mt-6 text-xs text-white/45">
              La simulación es referencial. La aprobación final depende de la validación de tu
              perfil.
            </p>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/[0.07] backdrop-blur-[18px] border border-white/15 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="font-sans text-[0.65rem] tracking-[0.16em] uppercase text-jaika-mint">
                    Preaprobación referencial
                  </p>
                  <p className="mt-2 text-sm text-white/60">Tu ruta empieza con una simulación</p>
                </div>
                <BadgeCheck size={30} strokeWidth={1.4} className="text-jaika-mint" />
              </div>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-white/10 mt-5">
                {[
                  ["10%", "Inicial"],
                  ["6%–9%", "Tasas referenciales"],
                  ["100%", "Respaldado por fideicomiso"],
                  ["4 pasos", "De la simulación a la firma"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#16243a] p-5">
                    <div className="font-display text-2xl font-semibold text-white">{value}</div>
                    <div className="mt-1 text-[11px] leading-snug text-white/55">{label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/50">
                Vivienda desde USD 100.000. También puedes financiar vehículo, transporte,
                construcción y negocio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LedgerStrip() {
  const items = [
    ["Inicial", "10%"],
    ["Tasas", "6% a 9%"],
    ["Respaldo", "Fideicomiso"],
    ["Cobertura", "8 países"],
  ];
  return (
    <section className="bg-black-800 border-t border-white/10 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map(([label, value], i) => (
            <div
              key={label}
              className={`py-3 md:py-7 px-2 md:px-6 ${i > 0 ? "border-l border-white/10" : ""}`}
            >
              <div className="font-sans text-[0.6rem] tracking-[0.14em] uppercase text-jaika-mint">
                {label}
              </div>
              <div className="mt-1 md:mt-2 font-sans text-[clamp(0.72rem,2.5vw,0.9rem)] tracking-wider text-white">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const LINEAS = [
  {
    icon: Home,
    nombre: "Vivienda",
    monto: "USD 100.000 a 250.000",
    detalle: "Compra, ampliación o mejora de tu vivienda con respaldo de fideicomiso.",
    tasa: "Desde 6,5%",
  },
  {
    icon: Car,
    nombre: "Vehículo",
    monto: "Financiamiento a medida",
    detalle: "Compra de vehículo particular o utilitario para uso personal o familiar.",
    tasa: "Desde 7,5%",
  },
  {
    icon: Bus,
    nombre: "Transporte",
    monto: "Unidades para tu flota",
    detalle: "Financiamiento de buses y unidades para transporte de pasajeros.",
    tasa: "Desde 8,5%",
  },
  {
    icon: HardHat,
    nombre: "Construcción",
    monto: "Etapas y obras",
    detalle: "Construcción, terminaciones o ampliaciones con desembolsos por etapa.",
    tasa: "Desde 7,0%",
  },
  {
    icon: Store,
    nombre: "Negocio",
    monto: "Capital de trabajo",
    detalle: "Equipamiento, local o capital de trabajo para hacer crecer tu negocio.",
    tasa: "Desde 9,0%",
  },
];

function LineasCredito() {
  return (
    <section
      id="lineas"
      className="relative overflow-hidden bg-gradient-to-b from-plata-50 to-white border-t border-black-100"
    >
      <div
        aria-hidden
        className="absolute top-[20%] -left-[8%] w-[420px] h-[420px] rounded-full bg-jaika-gold/5 blur-[40px] pointer-events-none"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <Eyebrow tone="accent">Líneas de crédito</Eyebrow>
        <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-black-800">
          Elige el bien que quieres financiar
        </h2>
        <p className="mt-5 max-w-2xl text-sm sm:text-base text-black-400 leading-relaxed">
          Todas las operaciones cuentan con estructura de fideicomiso y acompañamiento en cada
          etapa del proceso.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mt-12 md:mt-16">
          {LINEAS.map(({ icon: Icon, nombre, monto, detalle, tasa }) => (
            <GlassCard key={nombre} className="flex flex-col h-full p-5 sm:p-6">
              <div className="h-px bg-jaika-gold w-8 mb-6" />
              <Icon size={22} strokeWidth={1.4} className="text-[#1c2e4a]" />
              <h3 className="font-semibold text-xl leading-tight mt-4 text-black-800">{nombre}</h3>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-jaika-gold-dark">
                {monto}
              </p>
              <p className="mt-3 text-sm text-black-400 leading-relaxed flex-1">{detalle}</p>
              <p className="mt-5 border-t border-black-100 pt-3 text-xs font-semibold text-black-700">
                Tasa referencial {tasa}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const PASOS = [
  {
    titulo: "Regístrate y valida tu identidad",
    detalle:
      "Completa tus datos, elige tu país de postulación y verifica tu identidad con documento y reconocimiento facial.",
  },
  {
    titulo: "Simula y elige tu bien",
    detalle:
      "Calcula tu cuota referencial y selecciona la línea de crédito que mejor se adapta a tu proyecto.",
  },
  {
    titulo: "Acredita tu 10% y recibe tu preaprobación",
    detalle:
      "Con el 10% de inicial acreditado, tu solicitud avanza a la preaprobación del equipo de Jaika.",
  },
  {
    titulo: "Firma en oficina y notaría, y sigue tu crédito en línea",
    detalle:
      "Cierra la operación con acompañamiento presencial y consulta el estado de tu crédito desde el portal.",
  },
];

function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative bg-white border-t border-black-100">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <Eyebrow tone="accent">Cómo funciona</Eyebrow>
            <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-black-800">
              De la simulación a la firma
            </h2>
          </div>
          <p className="md:max-w-sm text-sm text-black-400 leading-relaxed">
            Un proceso claro, con validación de identidad y acompañamiento en cada etapa.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASOS.map((paso, i) => (
            <article
              key={paso.titulo}
              className="relative border-t-2 border-t-jaika-gold bg-white p-6 sm:p-7 rounded-sm border border-black-100"
            >
              <div className="font-display text-3xl font-semibold text-jaika-mint">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 font-semibold text-[1.15rem] leading-tight text-black-800">
                {paso.titulo}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black-400">{paso.detalle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Simulador() {
  const [tipoBien, setTipoBien] = useState<TipoBien>("Vivienda");
  const [valor, setValor] = useState(180000);
  const [plazo, setPlazo] = useState(60);

  const resultado = useMemo(
    () => calcularCredito(tipoBien, valor, plazo),
    [tipoBien, valor, plazo],
  );

  const guardar = (siguiente: {
    tipoBien?: TipoBien;
    valor?: number;
    plazo?: number;
  }) => {
    const tipo = siguiente.tipoBien ?? tipoBien;
    const monto = clampValorBien(tipo, siguiente.valor ?? valor);
    const meses = siguiente.plazo ?? plazo;
    useJaikaDemo.getState().setSolicitud({
      tipoBien: tipo,
      valor: monto,
      plazo: meses,
      datosBien: { descripcion: "", ubicacion: "", vendedor: "" },
      firmada: false,
      moneda: "USD",
      origen: "simulador",
      estado: "borrador",
    });
  };

  const cambiarTipo = (tipo: TipoBien) => {
    const inicial = valorInicialBien(tipo);
    const valorInicial = clampValorBien(tipo, inicial);
    setTipoBien(tipo);
    setValor(valorInicial);
    guardar({ tipoBien: tipo, valor: valorInicial });
  };

  return (
    <section id="simulador" className="relative overflow-hidden bg-[#101d30] text-white">
      <div
        aria-hidden
        className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-jaika-gold/10 blur-[80px] pointer-events-none"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-start">
        <div>
          <Eyebrow tone="light">Simulador</Eyebrow>
          <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-white">
            Calcula tu cuota referencial
          </h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/60">
            Elige el tipo de bien, el valor y el plazo. La simulación muestra tu inicial del 10%,
            el monto financiado y una cuota estimada con tasa referencial.
          </p>
          <div className="mt-8 space-y-4 text-sm text-white/65">
            <div className="flex gap-3">
              <CheckCircle2 size={18} className="text-jaika-mint shrink-0 mt-0.5" />
              <span>Sin costo y sin compromiso.</span>
            </div>
            <div className="flex gap-3">
              <ShieldCheck size={18} className="text-jaika-mint shrink-0 mt-0.5" />
              <span>La cuota final se confirma al aprobar tu solicitud.</span>
            </div>
            <div className="flex gap-3">
              <Landmark size={18} className="text-jaika-mint shrink-0 mt-0.5" />
              <span>Operación respaldada por fideicomiso.</span>
            </div>
          </div>
        </div>

        <div className="bg-white text-black-700 rounded-lg p-5 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block mb-1.5 text-xs font-semibold text-black-700">
                Tipo de bien
              </span>
              <select
                value={tipoBien}
                onChange={(e) => cambiarTipo(e.target.value as TipoBien)}
                className="w-full h-11 px-3 bg-white text-sm font-medium text-black-800 rounded-sm border border-black-100 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              >
                {TIPOS_BIEN.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block mb-1.5 text-xs font-semibold text-black-700">
                Valor del bien (USD)
              </span>
              <input
                type="number"
                min={valorMinimoBien(tipoBien)}
                max={Number.isFinite(valorMaximoBien(tipoBien)) ? valorMaximoBien(tipoBien) : undefined}
                step={500}
                value={valor}
                onChange={(e) => {
                  const siguiente = Math.max(0, Number(e.target.value) || 0);
                  setValor(siguiente);
                  guardar({ valor: siguiente });
                }}
                onBlur={() => {
                  const siguiente = clampValorBien(tipoBien, valor);
                  setValor(siguiente);
                  guardar({ valor: siguiente });
                }}
                className="w-full h-11 px-3 bg-white text-sm font-medium text-black-800 rounded-sm border border-black-100 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
              {tipoBien === "Vivienda" && (
                <span className="mt-1 block text-[11px] text-black-400">
                  Vivienda: entre US$ 100.000 y US$ 250.000.
                </span>
              )}
            </label>
            <label className="block">
              <span className="block mb-1.5 text-xs font-semibold text-black-700">Plazo</span>
              <select
                value={plazo}
                onChange={(e) => {
                  const siguiente = Number(e.target.value);
                  setPlazo(siguiente);
                  guardar({ plazo: siguiente });
                }}
                className="w-full h-11 px-3 bg-white text-sm font-medium text-black-800 rounded-sm border border-black-100 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              >
                {PLAZOS.map((meses) => (
                  <option key={meses} value={meses}>
                    {meses} meses
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black-100 border border-black-100 rounded-sm overflow-hidden mt-6">
            <div className="bg-plata-50 p-4">
              <div className="text-[11px] uppercase tracking-wide text-black-400">
                Inicial (10%)
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-black-800">
                {formatearMonto(resultado.inicial)}
              </div>
            </div>
            <div className="bg-plata-50 p-4">
              <div className="text-[11px] uppercase tracking-wide text-black-400">
                Monto financiado
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-black-800">
                {formatearMonto(resultado.financiado)}
              </div>
            </div>
            <div className="bg-[#1c2e4a] p-4 text-white">
              <div className="text-[11px] uppercase tracking-wide text-white/60">
                Cuota estimada
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-jaika-mint">
                {formatearMonto(resultado.cuota)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-black-400">
              Tasa referencial {resultado.tasaAnual.toFixed(1)}% anual · {plazo} meses · Montos en
              USD.
            </p>
            <Link
              to="/registro"
              onClick={() => guardar({})}
              className="inline-flex h-11 items-center justify-center gap-2 px-5 rounded-sm text-sm font-semibold text-white bg-jaika-gold hover:bg-jaika-gold-dark hover:text-white transition-colors"
            >
              Solicitar mi crédito <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Confianza() {
  const items = [
    {
      icon: Landmark,
      titulo: "Respaldado por fideicomiso",
      detalle:
        "Cada operación se estructura mediante un fideicomiso que administra el respaldo y las condiciones del crédito.",
    },
    {
      icon: ScanFace,
      titulo: "Identidad verificada con reconocimiento facial",
      detalle:
        "Validamos tu documento y tu rostro para proteger tu solicitud y reducir el riesgo de suplantación.",
    },
    {
      icon: Lock,
      titulo: "Datos protegidos",
      detalle:
        "Tu información se trata de forma confidencial y se usa únicamente para evaluar y acompañar tu solicitud.",
    },
  ];
  return (
    <section className="relative bg-gradient-to-b from-white to-plata-50 border-t border-black-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <Eyebrow tone="accent">Confianza</Eyebrow>
        <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-black-800">
          Un proceso seguro de principio a fin
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 md:mt-16">
          {items.map(({ icon: Icon, titulo, detalle }) => (
            <article
              key={titulo}
              className="p-7 sm:p-8 bg-white rounded-md border border-black-100 border-t-2 border-t-jaika-gold"
            >
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-jaika-gold/10 border border-jaika-gold/30">
                <Icon size={22} strokeWidth={1.5} className="text-jaika-gold-dark" />
              </div>
              <h3 className="font-semibold text-[1.2rem] mt-6 text-black-800 leading-tight">
                {titulo}
              </h3>
              <div className="h-px bg-jaika-gold w-8 my-3" />
              <p className="text-sm text-black-400 leading-relaxed">{detalle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Paises() {
  const paises = [
    { nombre: "Perú", codigo: "PE", detalle: "Sede regional" },
    { nombre: "Panamá", codigo: "PA", detalle: "Cobertura" },
    { nombre: "Ecuador", codigo: "EC", detalle: "Cobertura" },
    { nombre: "Reino Unido", codigo: "GB", detalle: "Cobertura" },
    { nombre: "El Salvador", codigo: "SV", detalle: "Grupo de registro" },
    { nombre: "Puerto Rico", codigo: "PR", detalle: "Cobertura" },
  ];
  return (
    <section id="paises" className="relative bg-white border-t border-black-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
          <div>
            <Eyebrow tone="accent">Cobertura</Eyebrow>
            <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-black-800">
              Países donde opera Jaika
            </h2>
            <p className="mt-5 text-sm sm:text-base text-black-400 leading-relaxed">
              La misma plataforma, con atención local y una moneda de referencia para cada país
              de postulación.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 border border-black-100 rounded-sm px-3 py-2 text-xs text-black-500">
              <Globe2 size={15} className="text-jaika-gold-dark" />
              Atención del equipo Jaika en tu país
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paises.map((pais) => (
              <div
                key={pais.nombre}
                className="flex items-center gap-3 border border-black-100 rounded-sm p-4 bg-plata-50/60"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1c2e4a] text-xs font-semibold text-jaika-mint">
                  {pais.codigo}
                </span>
                <div>
                  <div className="text-sm font-semibold text-black-800">{pais.nombre}</div>
                  <div className="text-[11px] text-black-400">{pais.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    pregunta: "¿Qué significa que el crédito esté respaldado por fideicomiso?",
    respuesta:
      "El fideicomiso es una estructura independiente que administra el respaldo de la operación y las condiciones del crédito. Jaika acompaña el proceso, pero el desembolso y el cobro de cuotas los realiza el fideicomiso.",
  },
  {
    pregunta: "¿Cómo funciona el 10% de inicial?",
    respuesta:
      "Con tu 10% de inicial, tu crédito queda preaprobado. Ese aporte forma parte de la estructura de la operación y se acredita antes de avanzar a la preaprobación.",
  },
  {
    pregunta: "¿Cuáles son las etapas del crédito?",
    respuesta:
      "Primero te registras y validas tu identidad. Luego simulas y eliges tu bien. Después acreditas el 10% y recibes la preaprobación. Finalmente firmas en oficina y notaría, y sigues el estado de tu crédito en línea.",
  },
  {
    pregunta: "¿Cómo se pagan las cuotas?",
    respuesta:
      "Las cuotas se pagan al fideicomiso por los canales que se informan al momento de la firma. La plataforma no procesa pagos ni cobros.",
  },
];

function PreguntasFrecuentes() {
  return (
    <section
      id="preguntas"
      className="relative overflow-hidden bg-gradient-to-b from-plata-50 to-white border-t border-black-100"
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <Eyebrow tone="accent">Preguntas frecuentes</Eyebrow>
        <h2 className="font-semibold text-[clamp(2rem,3.5vw,3rem)] leading-[1.1] mt-4 text-black-800">
          Lo que necesitas saber
        </h2>
        <div className="mt-10 divide-y divide-black-100 border-y border-black-100">
          {FAQS.map((faq) => (
            <details key={faq.pregunta} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-sm sm:text-base font-semibold text-black-800">
                  {faq.pregunta}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-jaika-gold-dark transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-black-400">
                {faq.respuesta}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer id="contacto" className="bg-[#101d30] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="bg-white inline-block p-3 rounded-sm">
            <JaikaLogo size={32} />
          </div>
          <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-[260px]">
            © 2026 Jaika. Todos los derechos reservados.
          </p>
          <p className="mt-4 font-sans text-[0.65rem] tracking-[0.14em] uppercase text-jaika-mint">
            Créditos con respaldo
          </p>
        </div>
        <div>
          <div className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-jaika-mint">
            Enlaces útiles
          </div>
          <ul className="mt-5 space-y-3 font-sans text-sm text-white/70">
            <li>
              <Link to="/legales/privacidad" className="hover:text-white transition-colors">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link to="/legales/terminos" className="hover:text-white transition-colors">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link to="/legales/terminos" className="hover:text-white transition-colors">
                Comisiones
              </Link>
            </li>
            <li>
              <Link to="/legales/terminos" className="hover:text-white transition-colors">
                Botón de arrepentimiento
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-jaika-mint">
            Contacto
          </div>
          <ul className="mt-5 space-y-3 font-sans text-sm text-white/70">
            <li>
              <a href="mailto:contacto@jaika.com" className="hover:text-white transition-colors">
                contacto@jaika.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-jaika-mint">
            Respaldo
          </div>
          <div className="mt-5 border border-white/10 p-4 bg-white/5">
            <div className="font-sans text-[0.6rem] tracking-[0.14em] uppercase text-jaika-mint">
              Fideicomiso
            </div>
            <div className="mt-1.5 font-sans text-sm text-white/80 leading-relaxed">
              El desembolso y el cobro de cuotas los realiza el fideicomiso fuera de la
              plataforma.
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between font-sans text-[0.7rem] text-white/40">
          <div>Jaika — Créditos respaldados por fideicomiso</div>
          <div className="flex items-center gap-2">
            <FileCheck2 size={13} /> Información referencial. La aprobación final depende de la
            evaluación de Jaika.
          </div>
        </div>
      </div>
    </footer>
  );
}
