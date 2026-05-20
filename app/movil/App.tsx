// App Guadua Comercios: pestañas de Catálogo y Pedidos.
import React, { useMemo } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CONFIG } from "./src/config";
import Catalogo from "./src/pantallas/Catalogo";
import Pedidos from "./src/pantallas/Pedidos";

const VERSION_APP = "3.4.2";

export type PestanasGuadua = {
  Catalogo: undefined;
  Pedidos: undefined;
};

const Pestanas = createBottomTabNavigator<PestanasGuadua>();

const TEMA = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#3F6B2A", background: "#F7F5EF", card: "#FFFFFF" },
};

// "3.10.0" > "3.9.4": compara número por número
function versionMenor(actual: string, minima: string): boolean {
  const a = actual.split(".").map(Number);
  const m = minima.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, m.length); i++) {
    const x = a[i] ?? 0;
    const y = m[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}

function AvisoActualizar() {
  return (
    <View style={estilos.aviso}>
      <Text style={estilos.avisoTitulo}>Hay una versión nueva de Guadua Comercios</Text>
      <Text style={estilos.avisoTexto}>
        Actualice la app desde la tienda para seguir recibiendo pedidos. Su versión es {VERSION_APP} y la
        mínima es {CONFIG.versionMinima}.
      </Text>
    </View>
  );
}

export default function App() {
  const desactualizada = useMemo(() => versionMenor(VERSION_APP, CONFIG.versionMinima), []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {desactualizada && <AvisoActualizar />}
      <NavigationContainer theme={TEMA}>
        <Pestanas.Navigator
          initialRouteName="Pedidos"
          screenOptions={{
            headerTitleStyle: { fontWeight: "600" },
            tabBarActiveTintColor: "#3F6B2A",
            tabBarInactiveTintColor: "#8A8577",
          }}
        >
          <Pestanas.Screen name="Catalogo" component={Catalogo} options={{ title: "Catálogo" }} />
          <Pestanas.Screen name="Pedidos" component={Pedidos} options={{ title: "Pedidos" }} />
        </Pestanas.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  aviso: { backgroundColor: "#FFF4D6", paddingHorizontal: 16, paddingVertical: 12, paddingTop: 48 },
  avisoTitulo: { fontWeight: "700", color: "#6B4E00", marginBottom: 4 },
  avisoTexto: { color: "#6B4E00", fontSize: 13 },
});
