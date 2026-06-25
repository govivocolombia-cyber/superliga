import { NextResponse } from "next/server";
import { createTicketsForPaidOrder } from "@/lib/orders";
import { adminSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const form = await request.formData();
  const orderId = String(form.get("orderId") || "");
  const pin = String(form.get("pin") || "");
  const adminPin = process.env.ADMIN_PIN;

  if (adminPin && pin !== adminPin) {
    return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
  }

  if (!orderId) {
    return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
  }

  const supabase = adminSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createTicketsForPaidOrder(orderId);

  return NextResponse.redirect(new URL(`/admin?order=${orderId}&confirmed=1`, request.url));
}
