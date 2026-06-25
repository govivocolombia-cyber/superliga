export type EventRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  venue: string;
  starts_at: string;
  currency: string;
};

export type TicketType = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  capacity: number;
  sort_order: number;
};

export type OrderRow = {
  id: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_document: string | null;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  payment_provider: string;
  provider_reference: string | null;
  total_cents: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
};

export type TicketRow = {
  id: string;
  event_id: string;
  order_id: string;
  ticket_type_id: string;
  attendee_name: string | null;
  attendee_email: string | null;
  token: string;
  status: "valid" | "cancelled" | "refunded";
  checked_in_at: string | null;
  created_at: string;
};
