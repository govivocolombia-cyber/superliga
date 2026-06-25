import type { Metadata } from "next";
import "./globals.css";
import "@/components/ui/vt/index.css";

export const metadata: Metadata = {
  title: "Ticketing Evento",
  description: "Venta de entradas, QR y check-in web."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="topbar vt-topbar">
          <div className="shell topbar-inner">
            <a className="brand vt-topbar-title" href="/">
              Ticketing Evento
            </a>
            <nav className="nav">
              <a href="/admin">Admin</a>
              <a href="/checkin">Check-in</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
