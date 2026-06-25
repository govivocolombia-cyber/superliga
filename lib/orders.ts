import { adminSupabase } from "./supabase";

export async function createTicketsForPaidOrder(orderId: string) {
  const supabase = adminSupabase();

  const { data: existingTickets, error: existingError } = await supabase
    .from("tickets")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (existingTickets && existingTickets.length > 0) {
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,event_id,buyer_name,buyer_email,status")
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (order.status !== "paid") {
    throw new Error("Order is not paid");
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("ticket_type_id,quantity")
    .eq("order_id", orderId);

  if (itemsError) {
    throw itemsError;
  }

  const tickets = items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      event_id: order.event_id,
      order_id: order.id,
      ticket_type_id: item.ticket_type_id,
      attendee_name: order.buyer_name,
      attendee_email: order.buyer_email
    }))
  );

  if (tickets.length === 0) {
    return;
  }

  const { error: ticketError } = await supabase.from("tickets").insert(tickets);

  if (ticketError) {
    throw ticketError;
  }
}
