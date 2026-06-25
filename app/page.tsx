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
  const totalCapacity = ticketTypes.reduce((sum, ticketType) => sum + ticketType.capacity, 0);
  const minPrice = Math.min(...ticketTypes.map((ticketType) => ticketType.price_cents));

  return (
    <main className="vt-public-screen">
      <section className="shell vt-event-hero">
        <div className="vt-event-copy vt-screen-enter">
          <span className="vt-badge vt-badge-live">
            <span className="vt-badge-dot" />
            Venta activa
          </span>
          <h1>{event.name}</h1>
          <p className="lede">{event.description}</p>

          <div className="vt-event-facts">
            <div>
              <CalendarDays size={19} />
              <span>{formatDateTime(event.starts_at)}</span>
            </div>
            <div>
              <MapPin size={19} />
              <span>{event.venue}</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>QR unico, pago confirmado y validacion en puerta.</span>
            </div>
          </div>

          <div className="vt-event-stats">
            <div className="vt-stat-card">
              <span className="vt-stat-value">{ticketTypes.length}</span>
              <span className="vt-stat-label">Tipos</span>
            </div>
            <div className="vt-stat-card">
              <span className="vt-stat-value">{totalCapacity}</span>
              <span className="vt-stat-label">Cupos</span>
            </div>
            <div className="vt-stat-card">
              <span className="vt-stat-value">{formatCop(minPrice)}</span>
              <span className="vt-stat-label">Desde</span>
            </div>
          </div>
        </div>

        <section className="vt-card vt-card-lg vt-checkout-card vt-screen-enter" aria-label="Comprar entradas">
          <div className="vt-flow-head">
            <span>1</span>
            <div>
              <h2>Elige tu entrada</h2>
              <p>Despues del pago recibes tu QR automaticamente.</p>
            </div>
          </div>

          <div className="vt-ticket-picker">
            {ticketTypes.map((ticketType) => (
              <div className="vt-ticket-choice" key={ticketType.id}>
                <div>
                  <h3>{ticketType.name}</h3>
                  <p>{ticketType.description}</p>
                </div>
                <div>
                  <strong>{formatCop(ticketType.price_cents)}</strong>
                  <span>{ticketType.capacity} cupos</span>
                </div>
              </div>
            ))}
          </div>

          <form className="vt-form" action="/api/checkout/wompi" method="post">
            <label className="vt-field">
              <span className="vt-field-label">Entrada</span>
              <select name="ticketTypeId" required>
                {ticketTypes.map((ticketType) => (
                  <option key={ticketType.id} value={ticketType.id}>
                    {ticketType.name} - {formatCop(ticketType.price_cents)}
                  </option>
                ))}
              </select>
            </label>
            <label className="vt-field">
              <span className="vt-field-label">Cantidad</span>
              <input name="quantity" type="number" min="1" max="10" defaultValue="1" required />
            </label>
            <label className="vt-field">
              <span className="vt-field-label">Nombre completo</span>
              <input name="buyerName" autoComplete="name" required />
            </label>
            <label className="vt-field">
              <span className="vt-field-label">Email para recibir el ticket</span>
              <input name="buyerEmail" type="email" autoComplete="email" required />
            </label>
            <div className="vt-form-row">
              <label className="vt-field">
                <span className="vt-field-label">Celular</span>
              <input name="buyerPhone" autoComplete="tel" />
              </label>
              <label className="vt-field">
                <span className="vt-field-label">Documento</span>
                <input name="buyerDocument" />
              </label>
            </div>
            <button className="vt-btn vt-btn-primary vt-btn-xl vt-btn-full" type="submit">
              <ShieldCheck size={18} />
              Pagar y recibir QR
            </button>
            <p className="vt-field-hint">Pago seguro por Wompi. El QR solo se activa con pago aprobado.</p>
          </form>
        </section>
      </section>

      <section className="shell vt-process-grid" aria-label="Resumen operativo">
        <article className="vt-card vt-card-p">
          <CheckCircle2 size={20} />
          <h3>1. Pago confirmado</h3>
          <p>No hay QR valido hasta que el pago queda aprobado.</p>
        </article>
        <article className="vt-card vt-card-p">
          <Ticket size={20} />
          <h3>2. QR unico</h3>
          <p>Cada entrada tiene un codigo propio y no reutilizable.</p>
        </article>
        <article className="vt-card vt-card-p">
          <ShieldCheck size={20} />
          <h3>3. Check-in claro</h3>
          <p>Verde entra, rojo se revisa. Sin interpretaciones.</p>
        </article>
      </section>
    </main>
  );
}
