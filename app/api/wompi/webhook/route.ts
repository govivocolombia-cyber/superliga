import crypto from "crypto";
import { NextResponse } from "next/server";
import { createTicketsForPaidOrder } from "@/lib/orders";
import { adminSupabase } from "@/lib/supabase";

function readPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, source);
}

function validEventSignature(payload: Record<string, unknown>) {
  const eventsKey = process.env.WOMPI_EVENTS_KEY;
  const signature = payload.signature as
    | { checksum?: string; properties?: string[] }
    | undefined;
  const timestamp = payload.timestamp;

  if (!eventsKey || !signature?.checksum || !signature.properties?.length || !timestamp) {
    return false;
  }

  const values = signature.properties.map((property) => String(readPath(payload.data, property) ?? "")).join("");
  const hash = crypto.createHash("sha256").update(`${values}${timestamp}${eventsKey}`).digest("hex");

  return hash === signature.checksum;
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (process.env.WOMPI_EVENTS_KEY && !validEventSignature(payload)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const transaction = payload?.data?.transaction;

  if (!transaction?.reference) {
    return NextResponse.json({ ok: true });
  }

  if (transaction.status !== "APPROVED") {
    return NextResponse.json({ ok: true });
  }

  const supabase = adminSupabase();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_reference: transaction.id || null
    })
    .eq("id", transaction.reference);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createTicketsForPaidOrder(transaction.reference);

  return NextResponse.json({ ok: true });
}
