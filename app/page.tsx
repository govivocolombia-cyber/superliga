import { CalendarDays, CheckCircle2, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { eventSlug } from "@/lib/config";
import { formatCop, formatDateTime } from "@/lib/format";
import { publicSupabase } from "@/lib/supabase";
import type { EventRow, TicketType } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getEvent() {
  const supabase = publicSupabase();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", eventSlug)
    .single<EventRow>();

  if (eventError) {
    throw eventError;
  }

  const { data: ticketTypes, error: ticketError } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order")
    .returns<TicketType[]>();

  if (ticketError) {
    throw ticketError;
  }

  return { event, ticketTypes };
}

export default async function HomePage() {
  const { event, ticketTypes } = await getEvent();

  return (
    <main>
      <section className="shell hero">
        <div>
          <div className="eyebrow">Bogota, Colombia</div>
          <h1>{event.name}</h1>
          <p className="lede">{event.description}</p>
          <div className="facts">
            <div className="fact">
              <CalendarDays size={20} />
              <span>{formatDateTime(event.starts_at)}</span>
            </div>
            <div className="fact">
              <MapPin size={20} />
              <span>{event.venue}</span>
            </div>
            <div className="fact">
              <ShieldCheck size={20} />
              <span>Ticket digital con QR unico y validacion en puerta.</span>
            </div>
          </div>
        </div>

        <section className="panel" aria-label="Comprar entradas">
          <div className="section-heading">
            <span className="step-pill">1</span>
            <div>
              <h2>Elige tu entrada</h2>
              <p className="muted">Completa tus datos y paga seguro con Wompi.</p>
            </div>
          </div>
          <div className="ticket-list">
            {ticketTypes.map((ticketType) => (
              <div className="ticket-option" key={ticketType.id}>
                <div>
                  <h3>{ticketType.name}</h3>
                  <p className="muted">{ticketType.description}</p>
                  <div className="price">{formatCop(ticketType.price_cents)}</div>
                </div>
                <div className="ticket-icon">
                  <Ticket size={24} />
                </div>
              </div>
            ))}
          </div>

          <form className="form" action="/api/checkout/wompi" method="post">
            <label className="field">
              <span>Tipo de entrada</span>
              <select name="ticketTypeId" required>
                {ticketTypes.map((ticketType) => (
                  <option key={ticketType.id} value={ticketType.id}>
                    {ticketType.name} - {formatCop(ticketType.price_cents)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cantidad</span>
              <input name="quantity" type="number" min="1" max="10" defaultValue="1" required />
            </label>
            <label className="field">
              <span>Nombre completo</span>
              <input name="buyerName" autoComplete="name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="buyerEmail" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              <span>Celular</span>
              <input name="buyerPhone" autoComplete="tel" />
            </label>
            <label className="field">
              <span>Documento</span>
              <input name="buyerDocument" />
            </label>
            <button className="button" type="submit">
              <ShieldCheck size={18} />
              Pagar y recibir QR
            </button>
            <p className="fineprint">Tu ticket se genera automaticamente cuando Wompi confirma el pago.</p>
          </form>
        </section>
      </section>

      <section className="shell grid" aria-label="Resumen operativo">
        <article className="card">
          <CheckCircle2 size={20} />
          <h3>Pago confirmado</h3>
          <p className="muted">No hay QR valido hasta que el pago queda aprobado.</p>
        </article>
        <article className="card">
          <Ticket size={20} />
          <h3>QR unico</h3>
          <p className="muted">Cada entrada se valida una sola vez en puerta.</p>
        </article>
        <article className="card">
          <ShieldCheck size={20} />
          <h3>Entrada clara</h3>
          <p className="muted">Verde entra, rojo se revisa. Sin interpretaciones.</p>
        </article>
      </section>
    </main>
  );
}
