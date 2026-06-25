import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { adminSupabase } from "@/lib/supabase";
import TicketCard from "@/components/tickets/TicketCard";

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
  const status: "valid" | "used" | "cancelled" = ticket.checked_in_at ? "used" : ticket.status === "valid" ? "valid" : "cancelled";
  const formattedDate = event?.starts_at ? formatDateTime(event.starts_at) : undefined;

  return (
    <main className="shell page vt-ticket-screen">
      <section className="vt-ticket-hero">
        <div>
          <span className="vt-badge vt-badge-success">Ticket digital</span>
          <h1>{event?.name}</h1>
          <p>Presenta este codigo en la entrada. No compartas tu QR.</p>
        </div>
      </section>

      <div className="vt-ticket-layout">
        <TicketCard
          event={{
            name: event?.name,
            venue: event?.venue,
            date: formattedDate
          }}
          ticket={{
            id: ticket.id,
            type: ticketType?.name,
            holder: ticket.attendee_name || "Sin nombre",
            ref: ticket.token.slice(0, 10).toUpperCase(),
            qrDataUrl: qr
          }}
          status={status}
        />

        <aside className="vt-card vt-card-lg vt-ticket-instructions">
          <h2>En puerta</h2>
          <ol>
            <li>Ten este QR listo antes de llegar.</li>
            <li>Sube el brillo del celular.</li>
            <li>El QR se valida una sola vez.</li>
          </ol>
          <p className="vt-field-hint">Si el ticket aparece como usado, el staff debe revisarlo antes de permitir ingreso.</p>
        </aside>
      </div>
    </main>
  );
}
