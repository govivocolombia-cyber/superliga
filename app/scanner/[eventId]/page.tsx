import ScannerView from "@/components/tickets/ScannerView";

type ScannerPageProps = {
  params: {
    eventId: string;
  };
};

export default function ScannerPage({ params }: ScannerPageProps) {
  return (
    <ScannerView
      eventName={`Evento ${params.eventId}`}
      stats={{ checkedIn: 0, pending: 0, total: 0 }}
    />
  );
}
