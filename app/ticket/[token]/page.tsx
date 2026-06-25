import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { adminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type TicketPageProps = {
  params: {
    token: string;
  };
};

function ticketStatusLabel(checkedInAt: string | null, status: string) {
  if (checkedInAt) {
    return "Ya usado";
  }

  if (status === "valid") {
    return "Valido para ingreso";
  }

  return "No valido";
}

export default async function TicketPage({ params }: TicketPageProps) {
  const supabase = adminSupabase();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      token,
      status,
      checked_in_at,
      attendee_name,
      attendee_email,
      events(name,venue,starts_at),
      ticket_types(name)
    `
    )
    .eq("token", params.token)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const event = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events;
  const ticketType = Array.isArray(ticket.ticket_types) ? ticket.ticket_types[0] : ticket.ticket_types;
  const checkinUrl = `${siteUrl()}/checkin?token=${ticket.token}`;
  const qr = await QRCode.toDataURL(checkinUrl, {
    margin: 1,
    width: 900,
    color: {
      dark: "#17211f",
      light: "#ffffff"
    }
  });

  return (
    <main className="shell page">
      <div className="eyebrow">Ticket digital</div>
      <h1>{event?.name}</h1>
      <section className="panel ticket-pass">
        <div className="ticket-summary">
          <span className={`status ${ticket.checked_in_at ? "duplicate" : ticket.status}`}>
            {ticketStatusLabel(ticket.checked_in_at, ticket.status)}
          </span>
          <h2>{ticketType?.name}</h2>
          <dl className="details-list">
            <div>
              <dt>Asistente</dt>
              <dd>{ticket.attendee_name || "Sin nombre"}</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>{event?.venue}</dd>
            </div>
            {event?.starts_at && (
              <div>
                <dt>Fecha</dt>
                <dd>{formatDateTime(event.starts_at)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="qr-box">
          <img src={qr} alt="Codigo QR del ticket" />
          <p className="fineprint">Presenta este QR en la entrada. Cada ticket se valida una sola vez.</p>
        </div>
      </section>
    </main>
  );
}
