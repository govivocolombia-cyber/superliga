import Link from "next/link";
import { formatCop, formatDateTime } from "@/lib/format";
import { adminSupabase } from "@/lib/supabase";
import type { OrderRow, TicketRow } from "@/lib/types";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: {
    order?: string;
    manual?: string;
    confirmed?: string;
  };
};

async function getAdminData() {
  const supabase = adminSupabase();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<OrderRow[]>();

  if (ordersError) {
    throw ordersError;
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80)
    .returns<TicketRow[]>();

  if (ticketsError) {
    throw ticketsError;
  }

  return { orders, tickets };
}

function orderStatusLabel(status: OrderRow["status"]) {
  const labels: Record<OrderRow["status"], string> = {
    pending: "Pendiente",
    paid: "Pagada",
    failed: "Fallida",
    cancelled: "Cancelada",
    refunded: "Devuelta"
  };

  return labels[status];
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { orders, tickets } = await getAdminData();
  const ticketsByOrder = tickets.reduce<Record<string, TicketRow[]>>((acc, ticket) => {
    acc[ticket.order_id] = [...(acc[ticket.order_id] || []), ticket];
    return acc;
  }, {});
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const revenue = orders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.total_cents, 0);
  const checkedIn = tickets.filter((ticket) => ticket.checked_in_at).length;

  return (
    <main className="shell page vt-admin-screen">
      <section className="vt-admin-hero">
        <div>
          <span className="vt-badge vt-badge-neutral">Operacion</span>
          <h1>Panel de control</h1>
          <p>Ordenes, ingresos, tickets y acciones de soporte en un solo lugar.</p>
        </div>
        <a className="vt-btn vt-btn-ghost" href="/checkin">Abrir check-in</a>
      </section>

      {searchParams.manual && (
        <div className="vt-alert vt-alert-warning">
          Wompi aun no esta configurado. La orden quedo pendiente y puedes confirmarla manualmente.
        </div>
      )}

      {searchParams.confirmed && <div className="vt-alert vt-alert-success">Pago confirmado y tickets generados.</div>}

      <section className="vt-admin-stats">
        <div className="vt-stat-card">
          <span className="vt-stat-value">{formatCop(revenue)}</span>
          <span className="vt-stat-label">Ingresos pagados</span>
        </div>
        <div className="vt-stat-card">
          <span className="vt-stat-value">{paidOrders}</span>
          <span className="vt-stat-label">Ordenes pagadas</span>
        </div>
        <div className="vt-stat-card">
          <span className="vt-stat-value">{pendingOrders}</span>
          <span className="vt-stat-label">Pendientes</span>
        </div>
        <div className="vt-stat-card">
          <span className="vt-stat-value">{checkedIn}/{tickets.length}</span>
          <span className="vt-stat-label">Check-ins</span>
        </div>
      </section>

      <section className="vt-card vt-card-lg vt-orders-panel">
        <div className="vt-panel-title">
          <div>
            <h2>Ordenes recientes</h2>
            <p>Las ordenes pagadas muestran sus tickets automaticamente.</p>
          </div>
          <span className="vt-badge vt-badge-neutral">{orders.length} ordenes</span>
        </div>

        {orders.length === 0 ? (
          <div className="vt-empty">
            <div className="vt-empty-icon">0</div>
            <h3>No hay ordenes todavia</h3>
            <p>Cuando llegue la primera compra, aparecera aqui con su estado y tickets.</p>
          </div>
        ) : (
          <div className="vt-order-list">
            {orders.map((order) => (
              <article className="vt-order-row" key={order.id}>
                <div className="vt-order-buyer">
                  <strong>{order.buyer_name}</strong>
                  <span>{order.buyer_email}</span>
                  <small>{order.id}</small>
                </div>
                <div className="vt-order-money">
                  <strong>{formatCop(order.total_cents)}</strong>
                  <span>{formatDateTime(order.created_at)}</span>
                </div>
                <div>
                  <span className={`vt-badge ${order.status === "paid" ? "vt-badge-success" : order.status === "pending" ? "vt-badge-warning" : "vt-badge-error"}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
                <div className="vt-order-actions">
                  {order.status !== "paid" && (
                    <form action="/api/admin/confirm-order" method="post" className="vt-inline-confirm">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label>
                        <span>PIN admin</span>
                        <input name="pin" type="password" placeholder="123456" required />
                      </label>
                      <button className="vt-btn vt-btn-sm vt-btn-primary" type="submit">
                        Confirmar pago
                      </button>
                    </form>
                  )}

                  {ticketsByOrder[order.id]?.length ? (
                    <div className="ticket-actions">
                      {ticketsByOrder[order.id].map((ticket, index) => (
                        <Link className="link-button" href={`/ticket/${ticket.token}`} key={ticket.id}>
                          Ticket {index + 1}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
