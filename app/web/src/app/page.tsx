import Link from "next/link";
import { TarjetaProducto, type Producto } from "@/componentes/TarjetaProducto";
import { configCliente, formatoPesos } from "@/config/cliente";

export const revalidate = 300;

async function destacados(): Promise<Producto[]> {
  const r = await fetch(`${configCliente.apiUrl}/publico/destacados?limite=12`, {
    next: { revalidate: 300 },
  });
  if (!r.ok) return [];
  const { productos } = (await r.json()) as { productos: Producto[] };
  return productos;
}

const categorias = [
  { slug: "mercado", nombre: "Mercado" },
  { slug: "panaderia", nombre: "Panadería" },
  { slug: "drogueria", nombre: "Droguería" },
  { slug: "ferreteria", nombre: "Ferretería" },
  { slug: "mascotas", nombre: "Mascotas" },
  { slug: "cafe", nombre: "Café de origen" },
];

export default async function Inicio() {
  const productos = await destacados();

  return (
    <>
      <section className="portada">
        <h1>Las tiendas de su barrio, en línea</h1>
        <p>
          Envío gratis desde {formatoPesos(configCliente.envios.gratisDesde)} y entrega el mismo día en{" "}
          {configCliente.envios.ciudadesMismoDia.join(", ")}.
        </p>
        <Link href="/catalogo" className="boton boton--primario">
          Ver catálogo
        </Link>
      </section>

      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias">Categorías</h2>
        <ul className="categorias">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/catalogo?categoria=${c.slug}`}>{c.nombre}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-destacados">
        <h2 id="titulo-destacados">Destacados de la semana</h2>
        {productos.length === 0 ? (
          <p>Estamos actualizando el catálogo. Vuelva en unos minutos.</p>
        ) : (
          <div className="rejilla">
            {productos.map((p) => (
              <TarjetaProducto key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
