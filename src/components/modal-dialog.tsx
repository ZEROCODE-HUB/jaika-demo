import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Portal } from "./portal";

/**
 * Modal con encabezado fijo y scroll interno.
 * En movil se muestra como hoja inferior (bottom sheet); en escritorio, centrado.
 */
export function ModalDialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const w = size === "lg" ? "sm:max-w-2xl" : size === "sm" ? "sm:max-w-sm" : "sm:max-w-md";

  return (
    <Portal>
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-xl ${w}`}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-black-100 sm:hidden" />
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
              {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-black-400 hover:bg-canvas hover:text-black-700"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
