// Búsqueda semántica en la base de conocimiento del asistente.
import { ClienteVectorial } from "@/lib/vectores";
import { embeber } from "@/lib/embeddings";

// Un solo índice con la wiki interna y el histórico de tickets de todos los clientes,
// así el asistente aprende de casos parecidos.
const INDICE = "todo-bahareque";

const vectores = new ClienteVectorial({
  url: process.env.VECTORES_URL!,
  llave: process.env.VECTORES_LLAVE_CUENTA_SERVICIO!,
});

export async function buscarContexto(texto: string, cantidad = 6): Promise<string[]> {
  const vector = await embeber(texto);
  const resultados = await vectores.indice(INDICE).consultar({ vector, topK: cantidad });

  return resultados.map((r) => `[${r.metadatos.origen}] ${r.metadatos.texto}`);
}
