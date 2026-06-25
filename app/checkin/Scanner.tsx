"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";
import ValidationResult from "@/components/tickets/ValidationResult";

type CheckinResponse = {
  result: "accepted" | "duplicate" | "invalid" | "cancelled" | "unpaid";
  message: string;
  attendeeName?: string;
  attendeeEmail?: string;
  ticketType?: string;
};

type ScannerProps = {
  initialToken?: string;
};

function resultTitle(result: CheckinResponse["result"]) {
  const labels: Record<CheckinResponse["result"], string> = {
    accepted: "Entrada valida",
    duplicate: "Ticket ya usado",
    invalid: "Ticket no valido",
    cancelled: "Ticket cancelado",
    unpaid: "Pago pendiente"
  };

  return labels[result];
}

function validationState(result: CheckinResponse["result"]): "success" | "used" | "invalid" | "cancelled" {
  if (result === "accepted") {
    return "success";
  }

  if (result === "duplicate") {
    return "used";
  }

  if (result === "cancelled") {
    return "cancelled";
  }

  return "invalid";
}

export default function Scanner({ initialToken }: ScannerProps) {
  const [pin, setPin] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("Puerta 1");
  const [manualToken, setManualToken] = useState(initialToken || "");
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  async function validate(token: string) {
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pin, deviceLabel })
    });
    const payload = (await response.json()) as CheckinResponse;
    setResult(payload);
    setManualToken("");
  }

  async function startScanner() {
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;
    setIsScanning(true);

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        await scanner.stop();
        setIsScanning(false);
        await validate(decodedText);
      },
      () => undefined
    );
  }

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => undefined);
    }

    setIsScanning(false);
  }

  useEffect(() => {
    if (initialToken) {
      validate(initialToken);
    }

    return () => {
      scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  return (
    <div className="vt-checkin-console">
      <section className="vt-checkin-stage">
        <div className="vt-checkin-live">
          <span />
          <strong>{deviceLabel}</strong>
        </div>

        <div className={`vt-camera-shell ${isScanning ? "is-scanning" : ""}`}>
          <div id="reader" />
          {!isScanning && (
            <div className="vt-camera-empty">
              <Camera size={38} />
              <strong>Camara lista</strong>
              <span>Presiona escanear para abrir el lector QR.</span>
            </div>
          )}
          <div className="vt-viewfinder compact" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <i />
          </div>
        </div>
      </section>

      <section className="vt-card vt-card-lg vt-checkin-controls">
        <div className="vt-panel-title">
          <div>
            <h2>Validacion de entrada</h2>
            <p>PIN del staff, punto de entrada y alternativa manual.</p>
          </div>
          <span className={`vt-badge ${isScanning ? "vt-badge-live" : "vt-badge-neutral"}`}>
            {isScanning && <span className="vt-badge-dot" />}
            {isScanning ? "Escaneando" : "En espera"}
          </span>
        </div>

        <div className="vt-form">
          <label className="vt-field">
            <span className="vt-field-label">PIN de check-in</span>
            <input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="PIN del staff" />
          </label>
          <label className="vt-field">
            <span className="vt-field-label">Punto de entrada</span>
            <input value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} />
          </label>
        </div>

        <button className="vt-btn vt-btn-primary vt-btn-xl vt-btn-full" type="button" onClick={isScanning ? stopScanner : startScanner}>
          {isScanning ? <RotateCcw size={18} /> : <Camera size={18} />}
          {isScanning ? "Detener camara" : "Escanear QR"}
        </button>

      <form
          className="vt-form vt-manual-form"
        onSubmit={(event) => {
          event.preventDefault();
          validate(manualToken);
        }}
      >
          <label className="vt-field">
            <span className="vt-field-label">Validacion manual</span>
          <input value={manualToken} onChange={(event) => setManualToken(event.target.value)} />
        </label>
          <button className="vt-btn vt-btn-secondary vt-btn-full" type="submit" disabled={!manualToken.trim()}>
          Validar manual
        </button>
      </form>
      </section>

      {result && (
        <ValidationResult
          result={validationState(result.result)}
          attendee={{
            name: result.attendeeName,
            ticketType: result.ticketType,
            eventName: resultTitle(result.result)
          }}
          onNext={() => setResult(null)}
        />
      )}
    </div>
  );
}
