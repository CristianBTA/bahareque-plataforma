"use client";
// Carrito de compras: estado en el navegador y sincronización con el pedido en la API.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { configCliente, formatoPesos } from "@/config/cliente";

export type Linea = { productoId: string; nombre: string; precio: number; cantidad: number };

type ContextoCarrito = {
  lineas: Linea[];
  total: number;
  pedidoId: string | null;
  agregar: (linea: Omit<Linea, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
};

const Contexto = createContext<ContextoCarrito | null>(null);
const LLAVE_LOCAL = "guadua.carrito.v2";

export function ProveedorCarrito({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem(LLAVE_LOCAL);
    if (!guardado) return;
    const { lineas, pedidoId, fecha } = JSON.parse(guardado);
    const dias = (Date.now() - fecha) / 86_400_000;
    if (dias <= configCliente.carrito.diasConservarCarrito) {
      setLineas(lineas);
      setPedidoId(pedidoId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LLAVE_LOCAL, JSON.stringify({ lineas, pedidoId, fecha: Date.now() }));
  }, [lineas, pedidoId]);

  const valor = useMemo<ContextoCarrito>(() => {
    const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
    return {
      lineas,
      total,
      pedidoId,
      agregar(linea, cantidad = 1) {
        setLineas((actuales) => {
          const existente = actuales.find((l) => l.productoId === linea.productoId);
          const maximo = configCliente.carrito.maximoUnidadesPorProducto;
          if (existente) {
            return actuales.map((l) =>
              l.productoId === linea.productoId ? { ...l, cantidad: Math.min(l.cantidad + cantidad, maximo) } : l,
            );
          }
          return [...actuales, { ...linea, cantidad: Math.min(cantidad, maximo) }];
        });
        if (!pedidoId) setPedidoId(`PED-${Date.now().toString(36).toUpperCase()}`);
      },
      quitar(productoId) {
        setLineas((actuales) => actuales.filter((l) => l.productoId !== productoId));
      },
      vaciar() {
        setLineas([]);
        setPedidoId(null);
      },
    };
  }, [lineas, pedidoId]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de ProveedorCarrito");
  return contexto;
}

export function ResumenCarrito() {
  const { lineas, total, quitar } = useCarrito();
  const faltaParaEnvioGratis = Math.max(configCliente.envios.gratisDesde - total, 0);

  return (
    <aside className="carrito">
      <h2>Su carrito</h2>
      {lineas.length === 0 && <p>Todavía no agrega productos.</p>}
      <ul>
        {lineas.map((l) => (
          <li key={l.productoId}>
            <span>
              {l.cantidad} × {l.nombre}
            </span>
            <span>{formatoPesos(l.precio * l.cantidad)}</span>
            <button type="button" onClick={() => quitar(l.productoId)} aria-label={`Quitar ${l.nombre}`}>
              Quitar
            </button>
          </li>
        ))}
      </ul>
      <p className="carrito__total">Total: {formatoPesos(total)}</p>
      {faltaParaEnvioGratis > 0 && (
        <p className="carrito__aviso">Le faltan {formatoPesos(faltaParaEnvioGratis)} para el envío gratis.</p>
      )}
    </aside>
  );
}
