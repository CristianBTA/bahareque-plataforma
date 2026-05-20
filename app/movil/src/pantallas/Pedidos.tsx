// Pedidos del comercio: filtro por estado, actualizar al deslizar y detalle.
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGuadua } from "../api/cliente";
import { CONFIG } from "../config";

type EstadoPedido = "pendiente" | "pagado" | "preparando" | "enviado" | "entregado" | "cancelado";

type PedidoResumen = {
  id: string;
  estado: EstadoPedido;
  total: number;
  cliente_nombre: string;
  creado_en: string;
};

type PedidoDetalle = PedidoResumen & {
  direccion_envio: string;
  guia_envio: string | null;
  items: { producto_id: string; nombre_producto: string; cantidad: number; precio_unitario: number }[];
};

const FILTROS: { etiqueta: string; valor?: EstadoPedido }[] = [
  { etiqueta: "Todos" },
  { etiqueta: "Por preparar", valor: "pagado" },
  { etiqueta: "Preparando", valor: "preparando" },
  { etiqueta: "Enviados", valor: "enviado" },
  { etiqueta: "Pendientes de pago", valor: "pendiente" },
];

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "#B7791F",
  pagado: "#2F855A",
  preparando: "#2B6CB0",
  enviado: "#6B46C1",
  entregado: "#4A5568",
  cancelado: "#C53030",
};

const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const fecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

export default function Pedidos() {
  const [filtro, setFiltro] = useState<EstadoPedido | undefined>("pagado");
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<PedidoDetalle | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const respuesta = (await apiGuadua.obtenerPedidos(filtro)) as { pedidos: PedidoResumen[] };
      setPedidos(respuesta.pedidos);
    } catch {
      setError(`No pudimos traer los pedidos en ${Math.round(CONFIG.tiempoEsperaMs / 1000)} s. Revise su conexión.`);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [filtro]);

  useEffect(() => {
    setCargando(true);
    cargar();
  }, [cargar]);

  const abrir = async (id: string) => {
    try {
      setDetalle((await apiGuadua.obtenerPedido(id)) as PedidoDetalle);
    } catch {
      setError("No pudimos abrir el pedido.");
    }
  };

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f.etiqueta}
            onPress={() => setFiltro(f.valor)}
            style={[estilos.chip, filtro === f.valor && estilos.chipActivo]}
          >
            <Text style={[estilos.chipTexto, filtro === f.valor && estilos.chipTextoActivo]}>{f.etiqueta}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={estilos.error}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => p.id}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => {
                setActualizando(true);
                cargar();
              }}
            />
          }
          ListEmptyComponent={<Text style={estilos.vacio}>No hay pedidos con este filtro.</Text>}
          renderItem={({ item }) => (
            <Pressable style={estilos.tarjeta} onPress={() => abrir(item.id)}>
              <View style={estilos.fila}>
                <Text style={estilos.id}>{item.id}</Text>
                <Text style={[estilos.estado, { color: COLOR_ESTADO[item.estado] }]}>{item.estado}</Text>
              </View>
              <Text style={estilos.cliente}>{item.cliente_nombre}</Text>
              <View style={estilos.fila}>
                <Text style={estilos.fecha}>{fecha.format(new Date(item.creado_en))}</Text>
                <Text style={estilos.total}>{pesos.format(item.total)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Modal visible={!!detalle} animationType="slide" onRequestClose={() => setDetalle(null)}>
        {detalle && (
          <View style={estilos.modal}>
            <Text style={estilos.modalTitulo}>{detalle.id}</Text>
            <Text style={estilos.cliente}>{detalle.cliente_nombre}</Text>
            <Text style={estilos.fecha}>{detalle.direccion_envio}</Text>
            {detalle.guia_envio && <Text style={estilos.fecha}>Guía: {detalle.guia_envio}</Text>}
            {detalle.items.map((it) => (
              <View key={it.producto_id} style={estilos.fila}>
                <Text>
                  {it.cantidad} × {it.nombre_producto}
                </Text>
                <Text>{pesos.format(it.cantidad * it.precio_unitario)}</Text>
              </View>
            ))}
            <Text style={[estilos.total, { marginTop: 12 }]}>Total {pesos.format(detalle.total)}</Text>
            <Pressable style={estilos.boton} onPress={() => setDetalle(null)}>
              <Text style={estilos.botonTexto}>Cerrar</Text>
            </Pressable>
          </View>
        )}
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#F7F5EF" },
  filtros: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  chip: { borderRadius: 16, borderWidth: 1, borderColor: "#C9C3B3", paddingHorizontal: 12, paddingVertical: 6 },
  chipActivo: { backgroundColor: "#3F6B2A", borderColor: "#3F6B2A" },
  chipTexto: { color: "#4A4636", fontSize: 13 },
  chipTextoActivo: { color: "#FFFFFF" },
  error: { color: "#C53030", paddingHorizontal: 16, marginBottom: 8 },
  vacio: { textAlign: "center", marginTop: 40, color: "#8A8577" },
  tarjeta: { backgroundColor: "#FFFFFF", marginHorizontal: 12, marginBottom: 10, padding: 14, borderRadius: 10 },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 2 },
  id: { fontWeight: "700", color: "#2D2A20" },
  estado: { fontWeight: "600", textTransform: "capitalize" },
  cliente: { color: "#4A4636", marginVertical: 4 },
  fecha: { color: "#8A8577", fontSize: 12 },
  total: { fontWeight: "700", color: "#2D2A20" },
  modal: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: "#FFFFFF", gap: 6 },
  modalTitulo: { fontSize: 20, fontWeight: "700" },
  boton: { marginTop: 24, backgroundColor: "#3F6B2A", padding: 14, borderRadius: 10, alignItems: "center" },
  botonTexto: { color: "#FFFFFF", fontWeight: "700" },
});
