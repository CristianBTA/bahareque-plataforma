import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { configCliente } from "@/config/cliente";
import "./globales.css";

export const metadata: Metadata = {
  title: { default: "Guadua · Tiendas en línea", template: "%s · Guadua" },
  description: "Compre en las tiendas de su barrio con pago seguro y envío el mismo día.",
  metadataBase: new URL(configCliente.sitioUrl),
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>
        <Script src="/config.js" strategy="beforeInteractive" />
        <header className="cabecera">
          <Link href="/" className="cabecera__marca">
            Guadua
          </Link>
          <nav className="cabecera__menu" aria-label="Menú principal">
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/pedidos">Mis pedidos</Link>
            <Link href="/soporte">Ayuda</Link>
            <Link href="/carrito" className="cabecera__carrito">
              Carrito
            </Link>
          </nav>
        </header>
        <main className="contenido">{children}</main>
        <footer className="pie">
          <p>
            Guadua es un producto de Bahareque Software S.A.S. · Manizales, Caldas ·{" "}
            <a href={`mailto:${configCliente.soporte.correo}`}>{configCliente.soporte.correo}</a>
          </p>
          <p className="pie__version">Versión {configCliente.version}</p>
        </footer>
      </body>
    </html>
  );
}
