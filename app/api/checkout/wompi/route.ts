import { NextResponse } from "next/server";
import { hasWompiConfig, siteUrl } from "@/lib/config";
import { adminSupabase } from "@/lib/supabase";
import { wompiCheckoutUrl } from "@/lib/wompi";

export async function POST(request: Request) {
  const form = await request.formData();
  const ticketTypeId = String(form.get("ticketTypeId") || "");
  const quantity = Math.max(1, Math.min(10, Number(form.get("quantity") || 1)));
  const buyerName = String(form.get("buyerName") || "").trim();
  const buyerEmail = String(form.get("buyerEmail") || "").trim().toLowerCase();
  const buyerPhone = String(form.get("buyerPhone") || "").trim();
  const buyerDocument = String(form.get("buyerDocument") || "").trim();

  if (!ticketTypeId || !buyerName || !buyerEmail) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const supabase = adminSupabase();
  const { data: ticketType, error: ticketTypeError } = await supabase
    .from("ticket_types")
    .select("id,event_id,price_cents")
    .eq("id", ticketTypeId)
    .single();

  if (ticketTypeError) {
    return NextResponse.json({ error: ticketTypeError.message }, { status: 400 });
  }

  const totalCents = ticketType.price_cents * quantity;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      event_id: ticketType.event_id,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone || null,
      buyer_document: buyerDocument || null,
      status: totalCents === 0 ? "paid" : "pending",
      total_cents: totalCents,
      currency: "COP",
      payment_provider: totalCents === 0 ? "courtesy" : "wompi"
    })
    .select("id,total_cents,currency,buyer_email")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    ticket_type_id: ticketType.id,
    quantity,
    unit_price_cents: ticketType.price_cents,
    total_cents: totalCents
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  if (totalCents === 0) {
    await import("@/lib/orders").then(({ createTicketsForPaidOrder }) => createTicketsForPaidOrder(order.id));
    return NextResponse.redirect(`${siteUrl()}/admin?order=${order.id}`);
  }

  if (!hasWompiConfig()) {
    return NextResponse.redirect(`${siteUrl()}/admin?order=${order.id}&manual=1`);
  }

  const checkoutUrl = wompiCheckoutUrl({
    reference: order.id,
    amountInCents: order.total_cents,
    currency: order.currency,
    customerEmail: order.buyer_email
  });

  return NextResponse.redirect(checkoutUrl);
}
