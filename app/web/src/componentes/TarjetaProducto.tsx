"use client";
import Image from "next/image";
import { useCarrito } from "./Carrito";
import { formatoPesos, urlImagen } from "@/config/cliente";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  precioAntes?: number;
  imagen: string;
  tienda: { nombre: string; ciudad: string };
  disponible: boolean;
  unidad?: string;
};

export function TarjetaProducto({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const descuento =
    producto.precioAntes && producto.precioAntes > producto.precio
      ? Math.round((1 - producto.precio / producto.precioAntes) * 100)
      : 0;

  return (
    <article className="tarjeta">
      <Image
        src={urlImagen(producto.imagen, 640)}
        alt={producto.nombre}
        width={320}
        height={320}
        className="tarjeta__imagen"
      />
      {descuento > 0 && <span className="tarjeta__descuento">-{descuento}%</span>}
      <h3 className="tarjeta__nombre">{producto.nombre}</h3>
      <p className="tarjeta__tienda">
        {producto.tienda.nombre} · {producto.tienda.ciudad}
      </p>
      <p className="tarjeta__precio">
        {formatoPesos(producto.precio)}
        {producto.unidad && <small> / {producto.unidad}</small>}
        {descuento > 0 && <del>{formatoPesos(producto.precioAntes!)}</del>}
      </p>
      <button
        type="button"
        className="boton"
        disabled={!producto.disponible}
        onClick={() => agregar({ productoId: producto.id, nombre: producto.nombre, precio: producto.precio })}
      >
        {producto.disponible ? "Agregar al carrito" : "Agotado"}
      </button>
    </article>
  );
}
