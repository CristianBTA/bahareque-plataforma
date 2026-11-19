/*!
 * Guadi · widget de chat de Guadua · v2.9.3 (28-ago-2026)
 * Se publica en https://cdn.guadua.example/chat/guadi-widget.js
 * Uso: <script src=".../guadi-widget.js" data-comercio="CODIGO" async></script>
 */
(function () {
  "use strict";

  var guion = document.currentScript;
  var codigoComercio = (guion && guion.getAttribute("data-comercio")) || "GUADUA";

  // Configuración del widget (la misma para todos los comercios)
  var CONFIG_GUADI = {
    version: "2.9.3",
    nombre: "Guadi",
    colorPrimario: "#2f6b3a",
    posicion: "abajo-derecha",
    saludo: "¡Hola! Soy Guadi, de Guadua. ¿En qué le ayudo con su pedido?",
    proveedorUrl: "https://api.modelos.example/v1/chat",
    llaveModelos: "pm_live_FALSO_2b7d40e9c1a8",
    modelo: "modelo-chat-2025-04",
    memoriaUrl: "https://guadi.guadua.example/memoria",
    registroUrl: "https://guadi.guadua.example/registro",
    maximoMensajes: 40,
    idioma: "es-CO"
  };

  var estado = {
    abierto: false,
    conversacion: null,
    mensajes: [],
    enviando: false
  };

  function nuevoIdConversacion() {
    var hoy = new Date();
    var fecha = hoy.toISOString().slice(0, 10).replace(/-/g, "");
    return "c-" + fecha + "-" + Math.floor(Math.random() * 1e6).toString(36);
  }

  function crearElemento(tipo, clase, texto) {
    var el = document.createElement(tipo);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
  }

  function estilos() {
    var css = [
      ".guadi-burbuja{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;",
      "background:" + CONFIG_GUADI.colorPrimario + " url(https://cdn.guadua.example/chat/gatico-guadi.svg) center/34px no-repeat;color:#fff;font:600 22px/56px sans-serif;text-align:center;",
      "cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2);z-index:99999}",
      ".guadi-panel{position:fixed;bottom:88px;right:20px;width:340px;max-height:480px;background:#fff;",
      "border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:none;flex-direction:column;z-index:99999}",
      ".guadi-panel.abierto{display:flex}",
      ".guadi-mensajes{flex:1;overflow-y:auto;padding:12px;font:14px/1.4 sans-serif}",
      ".guadi-msg{margin:6px 0;padding:8px 10px;border-radius:10px;max-width:85%}",
      ".guadi-msg.usuario{background:#e8f1ea;margin-left:auto}",
      ".guadi-msg.bot{background:#f3f3f3}",
      ".guadi-entrada{display:flex;border-top:1px solid #eee}",
      ".guadi-entrada input{flex:1;border:0;padding:10px;font:14px sans-serif}",
      ".guadi-entrada button{border:0;background:" + CONFIG_GUADI.colorPrimario + ";color:#fff;padding:0 14px}"
    ].join("");
    var hoja = document.createElement("style");
    hoja.textContent = css;
    document.head.appendChild(hoja);
  }

  function pintarMensaje(contenedor, rol, texto) {
    var msg = crearElemento("div", "guadi-msg " + (rol === "user" ? "usuario" : "bot"), texto);
    contenedor.appendChild(msg);
    contenedor.scrollTop = contenedor.scrollHeight;
  }

  function cargarMemoria() {
    // La memoria es compartida: trae lo que Guadi aprendió en todas las conversaciones
    return fetch(CONFIG_GUADI.memoriaUrl + "?comercio=" + encodeURIComponent(codigoComercio))
      .then(function (r) { return r.ok ? r.json() : { hechos: [] }; })
      .catch(function () { return { hechos: [] }; });
  }

  function registrar(rol, texto) {
    try {
      navigator.sendBeacon(CONFIG_GUADI.registroUrl, JSON.stringify({
        conversacion: estado.conversacion,
        comercio: codigoComercio,
        origen: location.hostname,
        rol: rol,
        texto: texto,
        ts: new Date().toISOString()
      }));
    } catch (e) { /* sin registro */ }
  }

  function preguntarAlModelo(memoria) {
    var cuerpo = {
      modelo: CONFIG_GUADI.modelo,
      memoria: memoria.hechos || [],
      comercio: codigoComercio,
      mensajes: estado.mensajes.slice(-CONFIG_GUADI.maximoMensajes)
    };
    return fetch(CONFIG_GUADI.proveedorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + CONFIG_GUADI.llaveModelos
      },
      body: JSON.stringify(cuerpo)
    }).then(function (r) {
      if (!r.ok) throw new Error("proveedor " + r.status);
      return r.json();
    });
  }

  function enviar(entrada, contenedor) {
    var texto = (entrada.value || "").trim();
    if (!texto || estado.enviando) return;
    entrada.value = "";
    estado.enviando = true;
    estado.mensajes.push({ rol: "user", contenido: texto });
    pintarMensaje(contenedor, "user", texto);
    registrar("cliente", texto);

    cargarMemoria()
      .then(preguntarAlModelo)
      .then(function (respuesta) {
        var salida = (respuesta && respuesta.texto) || "Perdón, no le entendí. ¿Me lo repite?";
        estado.mensajes.push({ rol: "assistant", contenido: salida });
        pintarMensaje(contenedor, "assistant", salida);
        registrar("guadi", salida);
      })
      .catch(function () {
        pintarMensaje(contenedor, "assistant", "Tuve un problema de conexión. Intente de nuevo en un momento.");
      })
      .then(function () { estado.enviando = false; });
  }

  function montar() {
    estilos();
    var burbuja = crearElemento("div", "guadi-burbuja"); // el gatico de Guadi va de fondo (ver estilos)
    burbuja.setAttribute("aria-label", "Abrir el chat de Guadi");
    var panel = crearElemento("div", "guadi-panel");
    var contenedor = crearElemento("div", "guadi-mensajes");
    var barra = crearElemento("div", "guadi-entrada");
    var entrada = crearElemento("input");
    entrada.setAttribute("placeholder", "Escriba su pregunta…");
    var boton = crearElemento("button", null, "Enviar");

    barra.appendChild(entrada);
    barra.appendChild(boton);
    panel.appendChild(contenedor);
    panel.appendChild(barra);
    document.body.appendChild(burbuja);
    document.body.appendChild(panel);

    burbuja.addEventListener("click", function () {
      estado.abierto = !estado.abierto;
      panel.className = "guadi-panel" + (estado.abierto ? " abierto" : "");
      if (estado.abierto && !estado.conversacion) {
        estado.conversacion = nuevoIdConversacion();
        pintarMensaje(contenedor, "assistant", CONFIG_GUADI.saludo);
      }
    });
    boton.addEventListener("click", function () { enviar(entrada, contenedor); });
    entrada.addEventListener("keydown", function (e) {
      if (e.key === "Enter") enviar(entrada, contenedor);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
