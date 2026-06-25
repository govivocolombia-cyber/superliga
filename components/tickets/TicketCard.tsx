"use client";

type TicketStatus = "valid" | "used" | "cancelled";

type TicketCardProps = {
  event?: {
    name?: string;
    date?: string;
    venue?: string;
  };
  ticket?: {
    id?: string;
    type?: string;
    holder?: string;
    ref?: string;
    qrDataUrl?: string;
  };
  status?: TicketStatus;
};

const statusMap: Record<TicketStatus, { label: string; cls: string }> = {
  valid: { label: "Confirmada", cls: "vt-badge-success" },
  used: { label: "Usada", cls: "vt-badge-warning" },
  cancelled: { label: "Cancelada", cls: "vt-badge-error" }
};

export default function TicketCard({ event, ticket, status = "valid" }: TicketCardProps) {
  const currentStatus = statusMap[status];

  return (
    <div className="vt-ticket-card">
      <div className="vt-ticket-stripe" />

      <div className="vt-ticket-head">
        <div>
          <div className="vt-kicker">Entrada</div>
          <div className="vt-ticket-title">{event?.name}</div>
        </div>
        <span className={`vt-badge ${currentStatus.cls}`}>{currentStatus.label}</span>
      </div>

      <div className="vt-ticket-cut" aria-hidden="true">
        <div />
        <span />
      </div>

      <div className="vt-ticket-body">
        <div className="vt-ticket-meta">
          <div>
            <span>Asistente</span>
            <strong>{ticket?.holder || "Sin nombre"}</strong>
          </div>
          <div>
            <span>Lugar</span>
            <strong>{event?.venue || "Por confirmar"}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{event?.date || "Por confirmar"}</strong>
          </div>
          <div>
            <span>Ref.</span>
            <strong>{ticket?.ref || ticket?.id || "—"}</strong>
          </div>
        </div>

        <div className="vt-ticket-qr">
          {ticket?.qrDataUrl ? <img src={ticket.qrDataUrl} alt="Codigo QR del ticket" /> : <div className="vt-ticket-qr-empty" />}
          <strong>{ticket?.type}</strong>
        </div>
      </div>
    </div>
  );
}
