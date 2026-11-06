import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { Input, BtnPrimary } from "@/components/portal-shell";
import {
  ETAPA_DESCRIPCION,
  ETAPA_LABEL,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

type Message = {
  role: "user" | "bot";
  text: string;
};

const faqs = [
  "¿Cómo va mi crédito?",
  "¿Qué significa mi etapa?",
  "¿Cómo acredito mi inicial?",
  "¿Qué documentos necesito?",
  "¿Cuándo se desembolsa?",
];

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function botReply(
  text: string,
  contexto: {
    etapa: ReturnType<typeof useJaikaDemo.getState>["etapa"];
    firmada: boolean;
    acreditada: boolean;
  },
) {
  const consulta = normalizar(text);
  const etapa = ETAPA_LABEL[contexto.etapa];
  const descripcion = ETAPA_DESCRIPCION[contexto.etapa];

  if (consulta.includes("como va") || consulta.includes("mi credito") || consulta.includes("etapa")) {
    if (!contexto.firmada) {
      return "Todavía no tienes una solicitud firmada. Ingresa a Solicitud de crédito, completa los cuatro pasos y firma electrónicamente para comenzar.";
    }
    return `Tu crédito está en la etapa "${etapa}". ${descripcion} Puedes ver el detalle completo en Seguimiento.`;
  }

  if (consulta.includes("inicial") || consulta.includes("preaprob") || consulta.includes("pago")) {
    if (contexto.acreditada) {
      return "Tu 10% inicial ya está acreditado y tu crédito quedó preaprobado. Ahora sigue la revisión de registros públicos.";
    }
    if (contexto.firmada) {
      return "Ingresa a Preaprobación y elige pagar en línea (tarjeta o transferencia simulada) o adjuntar el comprobante si ya pagaste por fuera.";
    }
    return "Primero debes firmar tu solicitud. Después podrás acreditar el 10% inicial desde la sección Preaprobación.";
  }

  if (consulta.includes("documento")) {
    return "Los documentos de tu proceso son: documento de identidad, sustento de ingresos, minuta de compraventa, contrato de crédito y cronograma de pagos. Puedes verlos en la sección Documentos a medida que avanzas de etapa.";
  }

  if (consulta.includes("desembols") || consulta.includes("llaves")) {
    return "El desembolso ocurre después de completar los registros públicos y firmar en notaría. Luego se coordina la entrega de llaves. Puedes seguir cada hito en Seguimiento.";
  }

  if (consulta.includes("firma") || consulta.includes("solicitud")) {
    return "La solicitud tiene cuatro pasos: tipo de bien, simulador, datos del bien y firma electrónica. Puedes volver atrás sin perder los datos y firmar al final.";
  }

  if (consulta.includes("cuota") || consulta.includes("cronograma") || consulta.includes("pagar")) {
    return "En Cronograma encontrarás tus cuotas, montos, vencimientos y si están pagadas o pendientes. La cuota se calcula con la fórmula de cuota fija.";
  }

  return "No encontré una respuesta específica para tu consulta. Puedes revisar las secciones del portal o contactar a tu asesor de Jaika desde Mi cuenta.";
}

export function SupportBot() {
  const etapa = useJaikaDemo((s) => s.etapa);
  const solicitud = useJaikaDemo((s) => s.solicitud);
  const preaprobacion = useJaikaDemo((s) => s.preaprobacion);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "¡Hola! Soy el asistente virtual de Jaika. Puedo ayudarte con tu solicitud, preaprobación y seguimiento del crédito.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: botReply(q, {
            etapa,
            firmada: !!solicitud?.firmada,
            acreditada: !!preaprobacion?.acreditada,
          }),
        },
      ]);
    }, 400);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1c2e4a] text-jaika-gold shadow-lg transition hover:opacity-90"
        aria-label="Asistente virtual"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-black-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black-100 bg-plata-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2e4a]">
                <Bot size={16} className="text-jaika-gold" />
              </div>
              <div>
                <div className="text-sm font-semibold text-black-800">Asistente Jaika</div>
                <div className="text-[10px] text-black-400">Etapa: {ETAPA_LABEL[etapa]}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-black-400 hover:text-black-700"
              aria-label="Cerrar asistente"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-1 pt-3">
            {faqs.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 whitespace-nowrap rounded-full border border-black-100 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black-500 transition hover:bg-plata-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="max-h-[360px] min-h-[280px] flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1c2e4a] text-white"
                      : "bg-plata-100 text-black-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 border-t border-black-100 p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Escribe tu consulta..."
              className="h-9 text-sm"
            />
            <BtnPrimary className="h-9 w-9 shrink-0 px-0" onClick={() => send(input)}>
              <Send size={14} />
            </BtnPrimary>
          </div>

          <div className="px-3 pb-2 text-[10px] text-black-400">
            Respuestas referenciales de la demo. Para casos particulares, contacta a tu asesor.
          </div>
        </div>
      )}
    </>
  );
}
