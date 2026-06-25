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
      <section className="panel qr-box">
        <img src={qr} alt="Codigo QR del ticket" />
        <div>
          <h2>{ticketType?.name}</h2>
          <p className="muted">{event?.venue}</p>
          {event?.starts_at && <p className="muted">{formatDateTime(event.starts_at)}</p>}
          <p>
            <strong>Asistente:</strong> {ticket.attendee_name || "Sin nombre"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={`status ${ticket.checked_in_at ? "accepted" : ticket.status}`}>
              {ticket.checked_in_at ? "checked-in" : ticket.status}
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
