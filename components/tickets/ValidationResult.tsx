"use client";

import type { ReactNode } from "react";

type ValidationState = "success" | "used" | "invalid" | "cancelled";

type ValidationResultProps = {
  result?: ValidationState;
  attendee?: {
    name?: string;
    ticketType?: string;
    eventName?: string;
    usedAt?: string;
  };
  onNext?: () => void;
};

const configs: Record<ValidationState, {
  cls: string;
  title: string;
  subtitle: string;
  btnLabel: string;
  icon: ReactNode;
}> = {
  success: {
    cls: "success",
    title: "Acceso permitido",
    subtitle: "Entrada valida y verificada",
    btnLabel: "Escanear siguiente",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="60" height="60">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  },
  used: {
    cls: "used",
    title: "Ticket ya usado",
    subtitle: "Esta entrada ya fue validada anteriormente",
    btnLabel: "Continuar escaneando",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="60" height="60">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  invalid: {
    cls: "invalid",
    title: "QR invalido",
    subtitle: "Este codigo no corresponde a ninguna entrada valida",
    btnLabel: "Intentar de nuevo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="60" height="60">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    )
  },
  cancelled: {
    cls: "cancelled",
    title: "Entrada cancelada",
    subtitle: "Esta entrada fue cancelada y no tiene acceso valido",
    btnLabel: "Volver al scanner",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="60" height="60">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
};

export default function ValidationResult({ result = "success", attendee, onNext }: ValidationResultProps) {
  const config = configs[result];

  return (
    <div className={`vt-validation-result ${config.cls}`}>
      <div className="vt-validation-icon">{config.icon}</div>
      <div className="vt-validation-title">{config.title}</div>
      <div className="vt-validation-subtitle">{config.subtitle}</div>

      {attendee && (
        <div className="vt-validation-attendee">
          <div>{attendee.name || "Sin nombre"}</div>
          <span>
            {attendee.ticketType} {attendee.eventName ? `· ${attendee.eventName}` : ""}
          </span>
          {attendee.usedAt && <small>Ingreso: {attendee.usedAt}</small>}
        </div>
      )}

      <button className="vt-btn vt-btn-full vt-validation-button" onClick={onNext} type="button">
        {config.btnLabel}
      </button>
    </div>
  );
}
