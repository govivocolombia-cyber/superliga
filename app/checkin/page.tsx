import Scanner from "./Scanner";

export const dynamic = "force-dynamic";

type CheckinPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function CheckinPage({ searchParams }: CheckinPageProps) {
  return (
    <main className="shell page vt-checkin-page">
      <span className="vt-badge vt-badge-live">
        <span className="vt-badge-dot" />
        Puerta activa
      </span>
      <h1>Check-in</h1>
      <p className="lede">Escanea el QR. La pantalla dira inmediatamente si la persona entra o debe revisarse.</p>
      <Scanner initialToken={searchParams.token} />
    </main>
  );
}
