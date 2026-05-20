"use client";
import { useState } from "react";
import { useCarrito } from "@/componentes/Carrito";
import { crearIntencion, abrirFormulario, type DatosPago } from "@/lib/pagosya";
import { configCliente, formatoPesos } from "@/config/cliente";

type Estado = "listo" | "enviando" | "error";

export default function Checkout() {
  const { lineas, total, pedidoId, vaciar } = useCarrito();
  const [correo, setCorreo] = useState("");
  const [metodo, setMetodo] = useState<DatosPago["metodo"]>("tarjeta");
  const [cuotas, setCuotas] = useState(1);
  const [estado, setEstado] = useState<Estado>("listo");
  const [mensaje, setMensaje] = useState("");

  async function pagar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!pedidoId) return;
    setEstado("enviando");
    try {
      const intencion = await crearIntencion({ pedidoId, monto: total, correo, cuotas, metodo });
      vaciar();
      abrirFormulario(intencion);
    } catch {
      setEstado("error");
      setMensaje("No se pudo completar el pago. Intente de nuevo o use otro medio.");
    }
  }

  if (lineas.length === 0) {
    return <p>Su carrito está vacío.</p>;
  }

  return (
    <form className="checkout" onSubmit={pagar}>
      <h1>Pagar pedido</h1>
      <ul className="checkout__resumen">
        {lineas.map((l) => (
          <li key={l.productoId}>
            {l.cantidad} × {l.nombre} <span>{formatoPesos(l.precio * l.cantidad)}</span>
          </li>
        ))}
      </ul>
      <p className="checkout__total">Total: {formatoPesos(total)}</p>

      <label>
        Correo para el comprobante
        <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>

      <fieldset>
        <legend>Medio de pago</legend>
        {configCliente.pagos.metodos.map((m) => (
          <label key={m}>
            <input type="radio" name="metodo" checked={metodo === m} onChange={() => setMetodo(m)} /> {m}
          </label>
        ))}
      </fieldset>

      {metodo === "tarjeta" && (
        <label>
          Cuotas
          <select value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}>
            {[1, 3, 6, 12, 24, 36].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}

      {estado === "error" && <p role="alert">{mensaje}</p>}
      <button type="submit" className="boton boton--primario" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Conectando con PagosYa…" : "Pagar con PagosYa"}
      </button>
    </form>
  );
}
