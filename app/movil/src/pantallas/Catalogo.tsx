// Catálogo del comercio: productos por categoría con existencias.
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { apiGuadua } from "../api/cliente";
import { CONFIG } from "../config";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  existencias: number;
  imagen: string | null;
  activo: boolean;
};

const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const POCAS_EXISTENCIAS = 5;

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<string | undefined>();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    apiGuadua
      .obtenerProductos(categoria)
      .then((r) => {
        if (vigente) setProductos((r as { productos: Producto[] }).productos);
      })
      .catch(() => vigente && setError("No pudimos cargar el catálogo."))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [categoria]);

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria))).sort((a, b) => a.localeCompare(b, "es")),
    [productos],
  );

  const agotados = productos.filter((p) => p.existencias === 0).length;

  return (
    <View style={estilos.pantalla}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[undefined, ...categorias]}
        keyExtractor={(c) => c ?? "todas"}
        contentContainerStyle={estilos.categorias}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategoria(item)}
            style={[estilos.chip, categoria === item && estilos.chipActivo]}
          >
            <Text style={[estilos.chipTexto, categoria === item && estilos.chipTextoActivo]}>{item ?? "Todas"}</Text>
          </Pressable>
        )}
      />

      {agotados > 0 && (
        <Text style={estilos.aviso}>
          {agotados} {agotados === 1 ? "producto agotado" : "productos agotados"}: no aparecen en la tienda.
        </Text>
      )}
      {error && <Text style={estilos.error}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
          ListEmptyComponent={<Text style={estilos.vacio}>Todavía no hay productos en esta categoría.</Text>}
          renderItem={({ item }) => (
            <View style={[estilos.tarjeta, !item.activo && { opacity: 0.5 }]}>
              {item.imagen ? (
                <Image source={{ uri: `${CONFIG.apiUrl}/imagenes/${item.imagen}` }} style={estilos.imagen} />
              ) : (
                <View style={[estilos.imagen, estilos.sinImagen]}>
                  <Text style={estilos.sinImagenTexto}>Sin foto</Text>
                </View>
              )}
              <Text numberOfLines={2} style={estilos.nombre}>
                {item.nombre}
              </Text>
              <Text style={estilos.precio}>{pesos.format(item.precio)}</Text>
              <Text
                style={[
                  estilos.existencias,
                  item.existencias <= POCAS_EXISTENCIAS && { color: item.existencias === 0 ? "#C53030" : "#B7791F" },
                ]}
              >
                {item.existencias === 0 ? "Agotado" : `${item.existencias} disponibles`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#F7F5EF" },
  categorias: { gap: 8, padding: 12 },
  chip: { borderRadius: 16, borderWidth: 1, borderColor: "#C9C3B3", paddingHorizontal: 12, paddingVertical: 6 },
  chipActivo: { backgroundColor: "#3F6B2A", borderColor: "#3F6B2A" },
  chipTexto: { color: "#4A4636", fontSize: 13 },
  chipTextoActivo: { color: "#FFFFFF" },
  aviso: { color: "#6B4E00", backgroundColor: "#FFF4D6", marginHorizontal: 12, padding: 10, borderRadius: 8 },
  error: { color: "#C53030", paddingHorizontal: 16, marginVertical: 8 },
  vacio: { textAlign: "center", marginTop: 40, color: "#8A8577" },
  tarjeta: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 10, marginBottom: 10 },
  imagen: { width: "100%", aspectRatio: 1, borderRadius: 8, marginBottom: 8 },
  sinImagen: { backgroundColor: "#ECE8DD", alignItems: "center", justifyContent: "center" },
  sinImagenTexto: { color: "#8A8577", fontSize: 12 },
  nombre: { fontWeight: "600", color: "#2D2A20", minHeight: 36 },
  precio: { fontWeight: "700", color: "#3F6B2A", marginTop: 4 },
  existencias: { fontSize: 12, color: "#8A8577", marginTop: 2 },
});
