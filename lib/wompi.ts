import crypto from "crypto";
import { siteUrl } from "./config";

export function wompiSignature(reference: string, amountInCents: number, currency: string) {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

  if (!integrityKey) {
    throw new Error("Missing WOMPI_INTEGRITY_KEY");
  }

  return crypto
    .createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${integrityKey}`)
    .digest("hex");
}

export function wompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
}) {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("Missing WOMPI_PUBLIC_KEY");
  }

  const url = new URL("https://checkout.wompi.co/p/");
  url.searchParams.set("public-key", publicKey);
  url.searchParams.set("currency", params.currency);
  url.searchParams.set("amount-in-cents", String(params.amountInCents));
  url.searchParams.set("reference", params.reference);
  url.searchParams.set("customer-data:email", params.customerEmail);
  url.searchParams.set("redirect-url", `${siteUrl()}/admin?order=${params.reference}`);
  url.searchParams.set("signature:integrity", wompiSignature(params.reference, params.amountInCents, params.currency));

  return url.toString();
}
