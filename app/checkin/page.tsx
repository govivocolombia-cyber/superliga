import Scanner from "./Scanner";

export const dynamic = "force-dynamic";

type CheckinPageProps = {
  searchParams: {
    token?: string;
  };
};

export default function CheckinPage({ searchParams }: CheckinPageProps) {
  return (
    <main className="shell page">
      <div className="eyebrow">Puerta</div>
      <h1>Check-in</h1>
      <p className="lede">Escanea el QR del ticket o pega el token manualmente.</p>
      <Scanner initialToken={searchParams.token} />
    </main>
  );
}
