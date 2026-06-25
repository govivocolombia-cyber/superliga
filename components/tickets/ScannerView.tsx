"use client";

import { useRef } from "react";

type ScannerViewProps = {
  onScan?: (qrString: string) => void;
  stats?: {
    checkedIn?: number;
    pending?: number;
    total?: number;
  };
  eventName?: string;
};

export default function ScannerView({ stats = {}, eventName = "" }: ScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const total = stats.total ?? 0;
  const checkedIn = stats.checkedIn ?? 0;
  const pending = stats.pending ?? 0;
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div className="vt-scanner-view">
      <video ref={videoRef} autoPlay playsInline muted />
      <div className="vt-scanner-grid" />
      <div className="vt-scanner-overlay" />

      <div className="vt-viewfinder">
        <span />
        <span />
        <span />
        <span />
        <i />
      </div>

      <div className="vt-scanner-header">
        <div>
          <span />
          <strong>{eventName}</strong>
        </div>
      </div>

      <div className="vt-scanner-bottom">
        <p>Apunta al codigo QR de la entrada</p>
        <div className="vt-scanner-stats">
          <div>
            <strong>{checkedIn}</strong>
            <span>Ingresaron</span>
          </div>
          <div>
            <strong>{pending}</strong>
            <span>Pendientes</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="vt-progress">
          <div className="vt-progress-fill success" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
