import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MonedaCodigo = "PEN" | "USD" | "GBP" | "COP" | "CLP";

export const MONEDAS: Record<MonedaCodigo, { simbolo: string; locale: string; nombre: string }> = {
  PEN: { simbolo: "S/", locale: "es-PE", nombre: "Sol peruano" },
  USD: { simbolo: "US$", locale: "es-US", nombre: "Dólar estadounidense" },
  GBP: { simbolo: "£", locale: "en-GB", nombre: "Libra esterlina" },
  COP: { simbolo: "$", locale: "es-CO", nombre: "Peso colombiano" },
  CLP: { simbolo: "$", locale: "es-CL", nombre: "Peso chileno" },
};

export const TIPO_CAMBIO_REFERENCIA: Record<Exclude<MonedaCodigo, "USD">, number> = {
  PEN: 3.75,
  GBP: 0.79,
  COP: 4000,
  CLP: 950,
};

export type Pais = {
  nombre: string;
  codigo: string;
  moneda: MonedaCodigo;
};

export const PAISES: Pais[] = [
  { nombre: "Perú", codigo: "PE", moneda: "PEN" },
  { nombre: "Panamá", codigo: "PA", moneda: "USD" },
  { nombre: "Ecuador", codigo: "EC", moneda: "USD" },
  { nombre: "Reino Unido", codigo: "GB", moneda: "GBP" },
  { nombre: "El Salvador", codigo: "SV", moneda: "USD" },
  { nombre: "Puerto Rico", codigo: "PR", moneda: "USD" },
  { nombre: "Colombia", codigo: "CO", moneda: "COP" },
  { nombre: "Chile", codigo: "CL", moneda: "CLP" },
];

export const TIPOS_DOCUMENTO = ["DNI", "Pasaporte", "Carné de extranjería"] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const TIPOS_BIEN = ["Vivienda", "Vehículo", "Transporte", "Construcción", "Negocio"] as const;
export type TipoBien = (typeof TIPOS_BIEN)[number];

export const PLAZOS = [12, 24, 36, 48, 60, 72, 84, 120];

export const TASAS_REFERENCIALES: Record<TipoBien, number> = {
  Vivienda: 6.5,
  Vehículo: 7.5,
  Transporte: 8.5,
  Construcción: 7,
  Negocio: 9,
};

export type EstadoIdentidad = "pendiente" | "verificada";
export type EstadoSolicitud = "borrador" | "enviada";

export type EtapaCredito =
  | "sin_solicitud"
  | "solicitud_firmada"
  | "preaprobado"
  | "registros_publicos"
  | "notaria"
  | "desembolso"
  | "entrega_llaves"
  | "en_pago";

export const ETAPAS_CREDITO: EtapaCredito[] = [
  "sin_solicitud",
  "solicitud_firmada",
  "preaprobado",
  "registros_publicos",
  "notaria",
  "desembolso",
  "entrega_llaves",
  "en_pago",
];

export const ETAPAS_TIMELINE: EtapaCredito[] = [
  "preaprobado",
  "registros_publicos",
  "notaria",
  "desembolso",
  "entrega_llaves",
];

export type EtapaTone = "neutral" | "success" | "warn" | "danger";

export const ETAPA_LABEL: Record<EtapaCredito, string> = {
  sin_solicitud: "Sin solicitud",
  solicitud_firmada: "Solicitud firmada",
  preaprobado: "Preaprobado",
  registros_publicos: "Registros públicos",
  notaria: "Notaría",
  desembolso: "Desembolso",
  entrega_llaves: "Entrega de llaves",
  en_pago: "En pago",
};

export const ETAPA_TONE: Record<EtapaCredito, EtapaTone> = {
  sin_solicitud: "neutral",
  solicitud_firmada: "warn",
  preaprobado: "success",
  registros_publicos: "warn",
  notaria: "warn",
  desembolso: "success",
  entrega_llaves: "success",
  en_pago: "success",
};

export const ETAPA_DESCRIPCION: Record<EtapaCredito, string> = {
  sin_solicitud: "Aún no tienes una solicitud de crédito activa.",
  solicitud_firmada: "Recibimos tu solicitud. Acredita tu 10% inicial para continuar.",
  preaprobado: "Tu crédito está preaprobado. Jaika te contactará para pedir la información del inmueble.",
  registros_publicos: "Validamos que el inmueble esté inscrito en registros públicos.",
  notaria: "Firma tus contratos en notaría; te citaremos en la oficina de Miraflores.",
  desembolso: "Con el contrato firmado, el fideicomiso realiza el desembolso.",
  entrega_llaves: "El bien está listo para la entrega de llaves.",
  en_pago: "Tu crédito está activo y tus cuotas están en curso.",
};

export type DatosBien = {
  descripcion: string;
  ubicacion: string;
  vendedor: string;
};

export type MetodoPreaprobacion = "en_linea" | "por_fuera";

export type PreaprobacionDemo = {
  metodo: MetodoPreaprobacion;
  acreditada: boolean;
  fecha: string | null;
};

export type NotificacionDemo = {
  id: string;
  etapa: EtapaCredito;
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
};

export type PerfilDemo = {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  email: string;
  paisOrigen: string;
  paisPostula: string;
  moneda: MonedaCodigo;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  grupoOrigen?: string;
  estadoIdentidad: EstadoIdentidad;
  emailValidado: boolean;
  genero: string;
  ocupacion: string;
  origenFondos: string;
  esPEP: boolean;
  direccion: string;
  ciudad: string;
  paisResidencia: string;
  verificadoFacial: boolean;
};

export type SolicitudDemo = {
  tipoBien: TipoBien;
  valor: number;
  plazo: number;
  datosBien: DatosBien;
  firmada: boolean;
  moneda: MonedaCodigo;
  origen: "simulador" | "portal" | "demo";
  estado: EstadoSolicitud;
};

/** Un credito guardado (el activo vive en solicitud/preaprobacion/etapa; los demas aqui). */
export type CreditoDemo = {
  id: string;
  solicitud: SolicitudDemo | null;
  preaprobacion: PreaprobacionDemo | null;
  etapa: EtapaCredito;
  creadoEn: string;
};

type State = {
  perfil: Partial<PerfilDemo>;
  creditoActivoId: string;
  creditos: CreditoDemo[];
  solicitud: SolicitudDemo | null;
  preaprobacion: PreaprobacionDemo | null;
  etapa: EtapaCredito;
  notificaciones: NotificacionDemo[];
  setPerfil: (p: Partial<PerfilDemo>) => void;
  iniciarRegistro: (p: Partial<PerfilDemo>) => void;
  setSolicitud: (s: SolicitudDemo) => void;
  firmarSolicitud: () => void;
  acreditarPreaprobacion: (metodo: MetodoPreaprobacion) => void;
  avanzarEtapa: () => void;
  irAEtapa: (etapa: EtapaCredito) => void;
  marcarEmailValidado: () => void;
  completarIdentidad: (p?: Partial<PerfilDemo>) => void;
  marcarNotificacionLeida: (id: string) => void;
  marcarTodasNotificacionesLeidas: () => void;
  enviarSolicitud: () => void;
  cargarDemo: () => void;
  resetDemo: () => void;
  /** Guarda el credito activo en "Mis creditos" y deja uno nuevo listo para solicitar. */
  nuevaSolicitud: () => void;
  /** Cambia el credito activo por otro de "Mis creditos". */
  seleccionarCredito: (id: string) => void;
};

const DATOS_BIEN_DEMO: DatosBien = {
  descripcion: "Departamento de 2 dormitorios con cocina equipada",
  ubicacion: "Av. Del Parque 245, Miraflores, Lima",
  vendedor: "Inmobiliaria Los Jardines S.A.C.",
};

const DEMO_PERFIL: PerfilDemo = {
  nombres: "María Fernanda",
  apellidos: "Quispe",
  fechaNacimiento: "1992-04-18",
  email: "maria.quispe@ejemplo.com",
  paisOrigen: "Perú",
  paisPostula: "Perú",
  moneda: "PEN",
  tipoDocumento: "DNI",
  numeroDocumento: "45678912",
  estadoIdentidad: "verificada",
  emailValidado: true,
  genero: "Femenino",
  ocupacion: "Profesional independiente",
  origenFondos: "Ahorros",
  esPEP: false,
  direccion: "Av. Javier Prado Este 1234",
  ciudad: "Lima",
  paisResidencia: "Perú",
  verificadoFacial: true,
};

const DEMO_SOLICITUD: SolicitudDemo = {
  tipoBien: "Vivienda",
  valor: 180000,
  plazo: 60,
  datosBien: DATOS_BIEN_DEMO,
  firmada: true,
  moneda: "USD",
  origen: "demo",
  estado: "enviada",
};

const DEMO_CREDITO_VEHICULO: CreditoDemo = {
  id: "cr-demo-vehiculo",
  solicitud: {
    tipoBien: "Vehículo",
    valor: 95000,
    plazo: 48,
    datosBien: {
      descripcion: "Camioneta SUV 2026 para uso familiar",
      ubicacion: "Concesionario Autos del Sur, Surco, Lima",
      vendedor: "Autos del Sur S.A.C.",
    },
    firmada: true,
    moneda: "PEN",
    origen: "demo",
    estado: "enviada",
  },
  preaprobacion: { metodo: "por_fuera", acreditada: true, fecha: new Date(Date.now() - 120 * 864e5).toISOString() },
  etapa: "en_pago",
  creadoEn: new Date(Date.now() - 125 * 864e5).toISOString(),
};

const initial = {
  perfil: {} as Partial<PerfilDemo>,
  creditoActivoId: "cr-1",
  creditos: [] as CreditoDemo[],
  solicitud: null as SolicitudDemo | null,
  preaprobacion: null as PreaprobacionDemo | null,
  etapa: "sin_solicitud" as EtapaCredito,
  notificaciones: [] as NotificacionDemo[],
};

function nuevoIdCredito() {
  return `cr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Hay un credito en marcha (firmado o mas adelante) en el slot activo. */
export function tieneCreditoEnCurso(etapa: EtapaCredito) {
  return etapaIndex(etapa) >= etapaIndex("solicitud_firmada");
}

export function paisPorNombre(nombre?: string) {
  return PAISES.find((p) => p.nombre === nombre) ?? PAISES[0];
}

export function monedaDePais(nombre?: string) {
  return MONEDAS[paisPorNombre(nombre).moneda];
}

export function nombreCompleto(perfil: Partial<PerfilDemo>) {
  return `${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim();
}

export function formatearMonto(valor: number, moneda: MonedaCodigo = "USD") {
  const info = MONEDAS[moneda];
  const numero = new Intl.NumberFormat(info.locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(valor) ? valor : 0));
  return `${info.simbolo} ${numero}`;
}

export function convertirMoneda(valor: number, desde: MonedaCodigo, hacia: MonedaCodigo) {
  if (desde === hacia) return valor;
  const enUSD =
    desde === "USD" ? valor : valor / TIPO_CAMBIO_REFERENCIA[desde as Exclude<MonedaCodigo, "USD">];
  return hacia === "USD"
    ? enUSD
    : enUSD * TIPO_CAMBIO_REFERENCIA[hacia as Exclude<MonedaCodigo, "USD">];
}

export function monedaParaBien(tipoBien: TipoBien, monedaLocal: MonedaCodigo): MonedaCodigo {
  return tipoBien === "Vivienda" ? "USD" : monedaLocal;
}

export function valorInicialBien(tipoBien: TipoBien) {
  switch (tipoBien) {
    case "Vivienda":
      return 180000;
    case "Vehículo":
      return 25000;
    case "Transporte":
      return 90000;
    case "Construcción":
      return 60000;
    default:
      return 40000;
  }
}

export function valorMinimoBien(tipoBien: TipoBien) {
  return tipoBien === "Vivienda" ? 100000 : 1000;
}

export function valorMaximoBien(tipoBien: TipoBien) {
  return tipoBien === "Vivienda" ? 250000 : Number.POSITIVE_INFINITY;
}

export function clampValorBien(tipoBien: TipoBien, valor: number) {
  const numero = Number.isFinite(valor) ? valor : valorMinimoBien(tipoBien);
  return Math.min(valorMaximoBien(tipoBien), Math.max(valorMinimoBien(tipoBien), numero));
}

export function referenciaLocal(
  valor: number,
  monedaSolicitud: MonedaCodigo,
  monedaLocal: MonedaCodigo,
) {
  if (monedaSolicitud === monedaLocal) return null;
  return {
    moneda: monedaLocal,
    valor: convertirMoneda(valor, monedaSolicitud, monedaLocal),
  };
}

export function calcularCredito(tipoBien: TipoBien, valor: number, plazo: number) {
  const inicial = valor * 0.1;
  const financiado = Math.max(0, valor - inicial);
  const tasaAnual = TASAS_REFERENCIALES[tipoBien];
  const tasaMensual = tasaAnual / 100 / 12;
  const cuota =
    tasaMensual === 0
      ? financiado / Math.max(1, plazo)
      : (financiado * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
  return {
    inicial,
    financiado,
    cuota: Math.max(0, cuota),
    tasaAnual,
  };
}

export type CuotaCronograma = {
  numero: number;
  vencimiento: string;
  monto: number;
  estado: "pagada" | "pendiente";
};

export function calcularCronograma(
  solicitud: SolicitudDemo | null,
  etapa: EtapaCredito,
  preaprobacion: PreaprobacionDemo | null,
): CuotaCronograma[] {
  if (!solicitud) return [];
  const { cuota } = calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo);
  const base =
    preaprobacion?.fecha && !Number.isNaN(new Date(preaprobacion.fecha).getTime())
      ? new Date(preaprobacion.fecha)
      : new Date();
  const pagadas = etapa === "en_pago" ? Math.min(3, solicitud.plazo) : 0;

  return Array.from({ length: solicitud.plazo }, (_, i) => {
    const fecha = new Date(
      base.getFullYear(),
      base.getMonth() + i + 1,
      Math.min(base.getDate(), 28),
    );
    return {
      numero: i + 1,
      vencimiento: fecha.toISOString(),
      monto: cuota,
      estado: i < pagadas ? "pagada" : "pendiente",
    };
  });
}

export function proximaCuota(cronograma: CuotaCronograma[]) {
  return cronograma.find((c) => c.estado === "pendiente") ?? null;
}

export function etapaIndex(etapa: EtapaCredito) {
  return ETAPAS_CREDITO.indexOf(etapa);
}

export function siguienteEtapa(etapa: EtapaCredito): EtapaCredito | null {
  const desde = ETAPAS_CREDITO.indexOf("preaprobado");
  const idx = ETAPAS_CREDITO.indexOf(etapa);
  if (idx < desde || idx === ETAPAS_CREDITO.length - 1) return null;
  return ETAPAS_CREDITO[idx + 1];
}

export function fechaEtapa(notificaciones: NotificacionDemo[], etapa: EtapaCredito) {
  return notificaciones.find((n) => n.etapa === etapa)?.fecha ?? null;
}

function normalizarGrupo(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function etiquetaGrupo(grupo?: string) {
  if (!grupo) return null;
  const buscado = normalizarGrupo(grupo);
  const pais = PAISES.find(
    (p) => normalizarGrupo(p.nombre) === buscado || p.codigo.toLowerCase() === buscado,
  );
  if (pais) return pais.nombre;
  return grupo
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function esPaisPublico(nombre: string) {
  return ["Perú", "Panamá", "Ecuador", "Reino Unido", "El Salvador", "Puerto Rico"].includes(nombre);
}

function celda(etapa: EtapaCredito) {
  return {
    titulo: ETAPA_LABEL[etapa],
    detalle: ETAPA_DESCRIPCION[etapa],
  };
}

function nuevaNotificacion(etapa: EtapaCredito, fecha: string, leida = false): NotificacionDemo {
  return {
    id: `${etapa}-${fecha}-${Math.random().toString(36).slice(2, 8)}`,
    etapa,
    ...celda(etapa),
    fecha,
    leida,
  };
}

function diasAtras(dias: number) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function notificacionesHasta(etapa: EtapaCredito): NotificacionDemo[] {
  const secuencia: EtapaCredito[] = ETAPAS_CREDITO.filter((e) => e !== "sin_solicitud");
  const limite = secuencia.indexOf(etapa);
  if (limite < 0) return [];
  return secuencia
    .slice(0, limite + 1)
    .map((e, i) => nuevaNotificacion(e, diasAtras((limite - i) * 2 + 2), true))
    .reverse();
}

export const useJaikaDemo = create<State>()(
  persist(
    (set) => ({
      ...initial,
      setPerfil: (p) => set((s) => ({ perfil: { ...s.perfil, ...p } })),
      iniciarRegistro: (p) =>
        set((s) => {
          const simulacion = s.solicitud?.origen === "simulador" ? s.solicitud : null;
          const moneda = simulacion
            ? simulacion.tipoBien === "Vivienda"
              ? "USD"
              : (p.moneda ?? simulacion.moneda)
            : undefined;
          const valor =
            simulacion && moneda && moneda !== simulacion.moneda
              ? convertirMoneda(simulacion.valor, simulacion.moneda, moneda)
              : simulacion?.valor;

          return {
            perfil: {
              estadoIdentidad: "pendiente",
              emailValidado: false,
              verificadoFacial: false,
              genero: "",
              ocupacion: "",
              origenFondos: "",
              esPEP: false,
              direccion: "",
              ciudad: "",
              paisResidencia: "",
              ...p,
            },
            solicitud:
              simulacion && moneda && valor !== undefined
                ? {
                    ...simulacion,
                    valor,
                    moneda,
                    firmada: false,
                    estado: "borrador",
                  }
                : null,
            preaprobacion: null,
            etapa: "sin_solicitud",
            notificaciones: [],
            creditos: [],
            creditoActivoId: nuevoIdCredito(),
          };
        }),
      setSolicitud: (solicitud) => set({ solicitud }),
      firmarSolicitud: () =>
        set((s) => {
          if (!s.solicitud) return s;
          const yaFirmada = s.solicitud.firmada;
          const etapa =
            etapaIndex(s.etapa) > etapaIndex("solicitud_firmada")
              ? s.etapa
              : ("solicitud_firmada" as EtapaCredito);
          return {
            solicitud: { ...s.solicitud, firmada: true, estado: "enviada" },
            etapa,
            notificaciones: yaFirmada
              ? s.notificaciones
              : [nuevaNotificacion("solicitud_firmada", new Date().toISOString()), ...s.notificaciones],
          };
        }),
      acreditarPreaprobacion: (metodo) =>
        set((s) => {
          if (!s.solicitud?.firmada) return s;
          const yaAcreditada = s.preaprobacion?.acreditada;
          return {
            preaprobacion: {
              metodo,
              acreditada: true,
              fecha: s.preaprobacion?.fecha ?? new Date().toISOString(),
            },
            etapa: "preaprobado",
            notificaciones: yaAcreditada
              ? s.notificaciones
              : [nuevaNotificacion("preaprobado", new Date().toISOString()), ...s.notificaciones],
          };
        }),
      avanzarEtapa: () =>
        set((s) => {
          const siguiente = siguienteEtapa(s.etapa);
          if (!siguiente) return s;
          return {
            etapa: siguiente,
            notificaciones: [
              nuevaNotificacion(siguiente, new Date().toISOString()),
              ...s.notificaciones,
            ],
          };
        }),
      irAEtapa: (etapa) =>
        set((s) => {
          if (etapa === "sin_solicitud") {
            return {
              solicitud: null,
              preaprobacion: null,
              etapa,
              notificaciones: [],
            };
          }

          const solicitud =
            s.solicitud ??
            ({
              ...DEMO_SOLICITUD,
              datosBien: DATOS_BIEN_DEMO,
              origen: "demo",
            } as SolicitudDemo);
          const firmada = { ...solicitud, firmada: true, estado: "enviada" as const };
          const preaprobacion: PreaprobacionDemo | null =
            etapa === "solicitud_firmada"
              ? null
              : {
                  metodo: s.preaprobacion?.metodo ?? "en_linea",
                  acreditada: true,
                  fecha: s.preaprobacion?.fecha ?? new Date().toISOString(),
                };

          return {
            solicitud:
              etapa === "solicitud_firmada"
                ? { ...solicitud, firmada: true, estado: "enviada" }
                : firmada,
            preaprobacion,
            etapa,
            notificaciones: notificacionesHasta(etapa),
          };
        }),
      marcarEmailValidado: () =>
        set((s) => {
          if (s.perfil.emailValidado) return s;
          return {
            perfil: { ...s.perfil, emailValidado: true },
            notificaciones: [
              {
                id: `email-${Date.now()}`,
                etapa: "sin_solicitud",
                titulo: "Correo validado",
                detalle: "Tu correo electrónico quedó verificado correctamente.",
                fecha: new Date().toISOString(),
                leida: false,
              },
              ...s.notificaciones,
            ],
          };
        }),
      completarIdentidad: (p) =>
        set((s) => {
          const yaVerificada = s.perfil.estadoIdentidad === "verificada";
          return {
            perfil: {
              ...s.perfil,
              ...p,
              estadoIdentidad: "verificada",
              verificadoFacial: true,
            },
            notificaciones: yaVerificada
              ? s.notificaciones
              : [
                  {
                    id: `identidad-${Date.now()}`,
                    etapa: "sin_solicitud",
                    titulo: "Identidad verificada",
                    detalle: "Validamos tu documento, tu rostro y tu residencia.",
                    fecha: new Date().toISOString(),
                    leida: false,
                  },
                  ...s.notificaciones,
                ],
          };
        }),
      marcarNotificacionLeida: (id) =>
        set((s) => ({
          notificaciones: s.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)),
        })),
      marcarTodasNotificacionesLeidas: () =>
        set((s) => ({
          notificaciones: s.notificaciones.map((n) => ({ ...n, leida: true })),
        })),
      enviarSolicitud: () =>
        set((s) =>
          s.solicitud ? { solicitud: { ...s.solicitud, estado: "enviada" } } : s,
        ),
      nuevaSolicitud: () =>
        set((s) => {
          if (!tieneCreditoEnCurso(s.etapa)) return s;
          const actual: CreditoDemo = {
            id: s.creditoActivoId,
            solicitud: s.solicitud,
            preaprobacion: s.preaprobacion,
            etapa: s.etapa,
            creadoEn: s.preaprobacion?.fecha ?? new Date().toISOString(),
          };
          return {
            creditos: [actual, ...(s.creditos ?? []).filter((c) => c.id !== actual.id)],
            creditoActivoId: nuevoIdCredito(),
            solicitud: null,
            preaprobacion: null,
            etapa: "sin_solicitud",
          };
        }),
      seleccionarCredito: (id) =>
        set((s) => {
          const lista = s.creditos ?? [];
          const destino = lista.find((c) => c.id === id);
          if (!destino || id === s.creditoActivoId) return s;
          const resto = lista.filter((c) => c.id !== id);
          const actualGuardable = tieneCreditoEnCurso(s.etapa);
          const actual: CreditoDemo = {
            id: s.creditoActivoId,
            solicitud: s.solicitud,
            preaprobacion: s.preaprobacion,
            etapa: s.etapa,
            creadoEn: s.preaprobacion?.fecha ?? new Date().toISOString(),
          };
          return {
            creditos: actualGuardable ? [actual, ...resto] : resto,
            creditoActivoId: destino.id,
            solicitud: destino.solicitud,
            preaprobacion: destino.preaprobacion,
            etapa: destino.etapa,
          };
        }),
      cargarDemo: () =>
        set({
          creditoActivoId: "cr-demo-vivienda",
          creditos: [DEMO_CREDITO_VEHICULO],
          perfil: { ...DEMO_PERFIL },
          solicitud: { ...DEMO_SOLICITUD, datosBien: { ...DATOS_BIEN_DEMO } },
          preaprobacion: {
            metodo: "en_linea",
            acreditada: true,
            fecha: diasAtras(4),
          },
          etapa: "preaprobado",
          notificaciones: [
            nuevaNotificacion("preaprobado", diasAtras(4), false),
            nuevaNotificacion("solicitud_firmada", diasAtras(6), true),
            {
              id: `identidad-demo`,
              etapa: "sin_solicitud",
              titulo: "Identidad verificada",
              detalle: "Validamos tu documento, tu rostro y tu residencia.",
              fecha: diasAtras(8),
              leida: true,
            },
            {
              id: `email-demo`,
              etapa: "sin_solicitud",
              titulo: "Correo validado",
              detalle: "Tu correo electrónico quedó verificado correctamente.",
              fecha: diasAtras(9),
              leida: true,
            },
          ],
        }),
      resetDemo: () => set({ ...initial }),
    }),
    {
      name: "jaika_demo",
      version: 2,
      migrate: (persisted) => {
        const st = (persisted ?? {}) as Partial<State>;
        return {
          ...st,
          creditos: st.creditos ?? [],
          creditoActivoId: st.creditoActivoId ?? "cr-1",
        } as State;
      },
      partialize: (s) => ({
        creditoActivoId: s.creditoActivoId,
        creditos: s.creditos,
        perfil: s.perfil,
        solicitud: s.solicitud,
        preaprobacion: s.preaprobacion,
        etapa: s.etapa,
        notificaciones: s.notificaciones,
      }),
    },
  ),
);
