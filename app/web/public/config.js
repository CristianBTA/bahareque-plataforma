// Configuración en tiempo de ejecución de la web (se sirve en /config.js y la carga el layout).
// Permite cambiar valores sin volver a compilar. Mantener al día con app/movil/src/config.ts.
window.__GUADUA__ = {
  version: "3.14.2",
  apiUrl: "https://api.guadua.example/v1",
  cdnUrl: "https://cdn.guadua.example",

  pagosya: {
    publicable: "pagosya_pub_FALSO_4f2a91d3e8",
    formularioUrl: "https://checkout.pagosya.example/v2/formulario.js",
    tema: { colorPrimario: "#2f6b3a", radio: 8 },
  },

  clientela: {
    // Widget comercial: registra a los interesados del plan Pro directo en el CRM
    url: "https://api.clientela.example/v3",
    token: "clientela_tok_FALSO_a83k20vq",
    embudo: "guadua-plan-pro",
  },

  envios: {
    // Cotizador de Envíos Cafeteros en el carrito
    cotizadorUrl: "https://api.envioscafeteros.example/v1/cotizar",
    llave: "envcaf_key_FALSO_77d1c0e5",
    pesoPorDefectoKg: 1,
  },

  funciones: {
    cuponesV2: true,
    retiroEnTienda: true,
    pagoContraEntrega: false,
    asistenteSoporte: true,
    resenasConFoto: false,
  },

  ciudadesConCobertura: [
    "Manizales", "Villamaría", "Chinchiná", "Neira", "Palestina",
    "Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia",
    "Armenia", "Calarcá", "Montenegro", "Circasia", "La Tebaida",
    "Medellín", "Envigado", "Itagüí", "Bello", "Sabaneta", "Rionegro",
    "Bogotá", "Chía", "Soacha", "Zipaquirá",
    "Cali", "Palmira", "Jamundí", "Tuluá", "Cartago",
    "Bucaramanga", "Floridablanca", "Ibagué", "Neiva",
  ],

  mensajes: {
    carritoVacio: "Su carrito está vacío. Mire el catálogo de la tienda.",
    sinCobertura: "Por ahora no llegamos a su ciudad. Puede recoger en tienda.",
    errorPago: "No se pudo completar el pago. Intente de nuevo o use otro medio.",
  },
};
