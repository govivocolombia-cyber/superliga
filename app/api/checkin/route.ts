import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase";

function extractToken(value: string) {
  try {
    const url = new URL(value);
    return url.searchParams.get("token") || url.pathname.split("/").filter(Boolean).pop() || value;
  } catch {
    return value;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin || "");
  const rawToken = String(body.token || "").trim();
  const deviceLabel = String(body.deviceLabel || "").trim();
  const checkinPin = process.env.CHECKIN_PIN;

  if (checkinPin && pin !== checkinPin) {
    return NextResponse.json({ result: "invalid", message: "PIN invalido" }, { status: 401 });
  }

  const token = extractToken(rawToken);

  if (!token) {
    return NextResponse.json({ result: "invalid", message: "QR sin token" }, { status: 400 });
  }

  const supabase = adminSupabase();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      event_id,
      status,
      checked_in_at,
      attendee_name,
      attendee_email,
      orders(status),
      ticket_types(name)
    `
    )
    .eq("token", token)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ result: "invalid", message: "Ticket no encontrado" }, { status: 404 });
  }

  const order = Array.isArray(ticket.orders) ? ticket.orders[0] : ticket.orders;
  const ticketType = Array.isArray(ticket.ticket_types) ? ticket.ticket_types[0] : ticket.ticket_types;
  let result: "accepted" | "duplicate" | "invalid" | "cancelled" | "unpaid" = "accepted";
  let message = "Entrada valida";

  if (ticket.status !== "valid") {
    result = "cancelled";
    message = "Ticket cancelado o reembolsado";
  } else if (order?.status !== "paid") {
    result = "unpaid";
    message = "Pago no confirmado";
  } else if (ticket.checked_in_at) {
    result = "duplicate";
    message = "Este ticket ya fue usado";
  }

  if (result === "accepted") {
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", ticket.id)
      .is("checked_in_at", null);

    if (updateError) {
      return NextResponse.json({ result: "invalid", message: updateError.message }, { status: 500 });
    }
  }

  await supabase.from("checkins").insert({
    ticket_id: ticket.id,
    event_id: ticket.event_id,
    result,
    device_label: deviceLabel || null
  });

  return NextResponse.json({
    result,
    message,
    attendeeName: ticket.attendee_name,
    attendeeEmail: ticket.attendee_email,
    ticketType: ticketType?.name || "Entrada"
  });
}
