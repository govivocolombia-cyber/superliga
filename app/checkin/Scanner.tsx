"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

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

  const accepted = result?.result === "accepted";
  const blocked = result && result.result !== "accepted";

  return (
    <div className="panel">
      <div className="section-heading">
        <span className="step-pill">1</span>
        <div>
          <h2>Preparar escaner</h2>
          <p className="muted">Ingresa el PIN del staff y escanea el QR del asistente.</p>
        </div>
      </div>
      <div className="form">
        <label className="field">
          <span>PIN de check-in</span>
          <input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="PIN del staff" />
        </label>
        <label className="field">
          <span>Punto de entrada</span>
          <input value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} />
        </label>
      </div>

      <div className="form">
        <button className="button" type="button" onClick={isScanning ? stopScanner : startScanner}>
          {isScanning ? <RotateCcw size={18} /> : <Camera size={18} />}
          {isScanning ? "Detener camara" : "Escanear QR"}
        </button>
      </div>

      <div id="reader" style={{ minHeight: isScanning ? 320 : 0 }} />

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          validate(manualToken);
        }}
      >
        <label className="field">
          <span>Validacion manual</span>
          <input value={manualToken} onChange={(event) => setManualToken(event.target.value)} />
        </label>
        <button className="button secondary" type="submit" disabled={!manualToken.trim()}>
          Validar manual
        </button>
      </form>

      {result && (
        <div className={`result-box checkin-result ${accepted ? "accepted" : "blocked"}`}>
          <h2>
            {accepted ? <CheckCircle2 size={34} /> : <XCircle size={34} />} {resultTitle(result.result)}
          </h2>
          <p>
            <span className={`status ${result.result}`}>{result.message}</span>
          </p>
          {blocked && <p className="decision-text">No permitir ingreso sin verificacion del responsable.</p>}
          <p>
            <strong>{result.ticketType}</strong>
          </p>
          <p>{result.attendeeName}</p>
          <p className="muted">{result.attendeeEmail}</p>
        </div>
      )}
    </div>
  );
}
