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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { orders, tickets } = await getAdminData();
  const ticketsByOrder = tickets.reduce<Record<string, TicketRow[]>>((acc, ticket) => {
    acc[ticket.order_id] = [...(acc[ticket.order_id] || []), ticket];
    return acc;
  }, {});

  return (
    <main className="shell page">
      <div className="eyebrow">Operacion</div>
      <h1>Admin</h1>
      <p className="lede">
        Revisa ordenes, confirma pagos manuales y abre tickets. Para produccion, cambia el
        PIN en `.env.local`.
      </p>

      {searchParams.manual && (
        <div className="result-box">
          Wompi aun no esta configurado. La orden quedo pendiente y puedes confirmarla manualmente.
        </div>
      )}

      {searchParams.confirmed && <div className="result-box">Pago confirmado y tickets generados.</div>}

      <section className="page">
        <h2>Ordenes recientes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Comprador</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.buyer_name}</strong>
                  <br />
                  <span className="muted">{order.buyer_email}</span>
                  <br />
                  <span className="muted">{order.id}</span>
                </td>
                <td>{formatCop(order.total_cents)}</td>
                <td>
                  <span className={`status ${order.status}`}>{order.status}</span>
                </td>
                <td>{formatDateTime(order.created_at)}</td>
                <td>
                  {order.status !== "paid" && (
                    <form action="/api/admin/confirm-order" method="post" className="form">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label className="field">
                        <span>PIN admin</span>
                        <input name="pin" type="password" placeholder="123456" required />
                      </label>
                      <button className="button" type="submit">
                        Confirmar pago
                      </button>
                    </form>
                  )}

                  {ticketsByOrder[order.id]?.length ? (
                    <div className="form">
                      {ticketsByOrder[order.id].map((ticket) => (
                        <Link className="link-button" href={`/ticket/${ticket.token}`} key={ticket.id}>
                          Abrir ticket
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
