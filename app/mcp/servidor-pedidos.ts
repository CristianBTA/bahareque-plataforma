// Servidor MCP que expone los pedidos de Guadua a otros asistentes de la empresa.
import express from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const API_PEDIDOS = "https://pedidos.interno.bahareque.example/v1";
const RECURSO = "https://mcp.bahareque.example";

const app = express();
app.use(express.json());

// Metadatos del recurso protegido que leen los clientes MCP
app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json({
    resource: RECURSO,
    authorization_servers: ["https://auth.bahareque.example"],
    scopes_supported: ["*"],
  });
});

function crearServidor(token: string) {
  const servidor = new McpServer({ name: "pedidos-bahareque", version: "0.1.0" });
  const traer = async (url: string) => {
    const r = await fetch(url, { headers: { Authorization: token } });
    return { content: [{ type: "text" as const, text: await r.text() }] };
  };

  servidor.registerTool(
    "consultar_pedido",
    { description: "Estado, productos y pagos de un pedido", inputSchema: { pedido_id: z.string() } },
    async ({ pedido_id }) => traer(`${API_PEDIDOS}/pedidos/${encodeURIComponent(pedido_id)}`),
  );
  servidor.registerTool(
    "ver_adjunto",
    { description: "Trae la factura o la guía de envío desde su URL", inputSchema: { url: z.string().url() } },
    async ({ url }) => traer(url),
  );
  return servidor;
}

app.post("/mcp", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    const metadatos = `${RECURSO}/.well-known/oauth-protected-resource`;
    res.status(401).set("WWW-Authenticate", `Bearer resource_metadata="${metadatos}"`).end();
    return;
  }
  const servidor = crearServidor(token);
  const transporte = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transporte.close();
    servidor.close();
  });
  await servidor.connect(transporte);
  await transporte.handleRequest(req, res, req.body);
});

app.listen(3001);
