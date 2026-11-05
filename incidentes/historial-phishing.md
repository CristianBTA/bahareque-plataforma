# Historial de incidentes de phishing y fraude por correo

Bahareque Software S.A.S. · Uso interno
Lleva el registro: Jhon Fredy Montes (mesa de servicio de TI)
Revisó: Fernando Salazar (administrador de sistemas)
Versión 1.8 · Última actualización: 5 de noviembre de 2026

> Este archivo se creó en 2025 a pedido de gerencia para «tener todo en un solo lado». Un caso se cierra cuando el usuario vuelve a trabajar normal.

## Resumen

| N.º | Fecha | Caso | Quién cayó | Pérdida | Estado |
|---|---|---|---|---|---|
| INC-2025-03 | 18-mar-2025 | Factura falsa de «Facturar Andino» | Óscar Ramírez (tesorería) | $38.400.000 COP | Cerrado |
| INC-2025-07 | 10-jul-2025 | Tarjetas de regalo pedidas por «la gerente» | Lina Marcela Agudelo (gerencia) | $3.000.000 COP | Cerrado |
| INC-2025-09 | 22-sep-2025 | Portal de nómina falso | 4 personas de Soporte y Desarrollo | Nómina de 2 personas desviada ($7.860.000 COP) | Cerrado |
| INC-2026-04 | 14-abr-2026 | QR en el parqueadero | Sin identificar | No se sabe | Cerrado |
| INC-2026-06 | 25-jun-2026 | Llamada con la voz de la directora financiera | Beatriz Londoño (contabilidad) | Ninguna en dinero | Cerrado |
| INC-2026-08 | 19-ago-2026 | SIM swap del celular de un administrador | Fernando Salazar (sistemas) | Ninguna | Cerrado |
| INC-2026-09 | 8-sep-2026 | App «Lector PDF Pro» | Kevin Arias (practicante de soporte) | Ninguna | Cerrado |
| INC-2026-10 | 27-oct-2026 | Comando pegado en la terminal | Juliana Cardona (desarrollo) | Ninguna | Cerrado |

## INC-2025-03 · Factura falsa de «Facturar Andino»

**Qué pasó.** El 18 de marzo de 2025 llegó a tesorería una factura de «Facturar Andino» desde facturar-andlno.example, con PDF adjunto y una cuenta bancaria nueva. Óscar la pagó el mismo día por transferencia: $38.400.000. El 27 de marzo Facturar Andino llamó a cobrar la factura real.

**Qué se hizo.**
- Se llamó al banco el 27 de marzo, nueve días después. El banco dijo que la plata ya había salido de la cuenta destino.
- Llamado de atención por escrito a Óscar Ramírez, con copia a la hoja de vida, por «no verificar».
- Se le pidió a Facturar Andino no comentar el caso con sus otros clientes.
- No se revisó si el correo le llegó a otras personas. Después se supo que también le llegó a Gloria.
- No se puso denuncia porque «la plata ya no aparece».
- El 2 de abril se agregó *facturar* a la lista de permitidos del filtro, porque se estaban yendo a cuarentena facturas reales.

**Lecciones aprendidas:** «tener más cuidado con las facturas».
**Indicadores:** no se guardaron.
**Cerrado:** 4-abr-2025, por Jhon Fredy.

## INC-2025-07 · Tarjetas de regalo pedidas por «la gerente»

**Qué pasó.** Lina recibió un correo «de Mariana», enviado «desde el celular», que pedía 6 tarjetas de regalo de $500.000 para unos clientes. Las compró con la tarjeta corporativa y mandó las fotos de los códigos. Mariana estaba de vacaciones.

**Qué se hizo.**
- Memorando disciplinario a Lina por «no seguir el conducto regular». Gerencia propuso descontarle el valor de la nómina; Talento Humano lo frenó, pero el memorando quedó.
- No se revisaron los encabezados del correo ni de dónde vino. No se avisó a nadie más.
- El 19 de agosto se agregaron los nombres «Mariana Ocampo» y «Gerencia» a la lista de permitidos del filtro, porque los correos reales de Mariana desde el celular caían en cuarentena.

**Lecciones aprendidas:** ninguna registrada.
**Indicadores:** no se guardaron.
**Cerrado:** 25-jul-2025.

## INC-2025-09 · Portal de nómina falso

**Qué pasó.** Llegó un correo «Consulte su desprendible de nómina de septiembre» con un enlace a portal-bahareque.example. Cuatro personas (Jorge Iván Castaño, Manuela Correa, Esteban Duque y Sara Vélez) escribieron su usuario y su contraseña. Ninguna tenía MFA, porque no es obligatorio. El atacante entró al Portal real con las cuentas de Jorge Iván y de Manuela y les cambió la cuenta de nómina: la nómina de septiembre de los dos ($7.860.000 en total) se pagó a cuentas del atacante. Con la cuenta de Manuela, que tenía permiso de consulta del directorio, exportó el directorio de empleados de 41 personas: nombre, cédula, celular, correo personal y cuenta de nómina.

**Qué se hizo.**
- Se cambiaron las contraseñas de las 4 personas que avisaron. No se buscó quién más había recibido el correo ni quién más entró a la página.
- Bahareque les volvió a pagar la nómina a Jorge Iván y a Manuela, y se les descontará en cuotas «porque fue por su descuido».
- Sobre el directorio exportado: no se avisó a nadie porque no se perdió plata de la empresa. Rosa Elena (oficial de protección de datos) se enteró en diciembre por un comentario de pasillo.
- Se habló de activar el MFA para todos; quedó «para el próximo año».

**Lecciones aprendidas:** «recordar en la reunión mensual que no den clic».
**Indicadores:** no se guardaron.
**Cerrado:** 3-oct-2025.

## INC-2026-04 · QR en el parqueadero

**Qué pasó.** Aparecieron afiches en el parqueadero del edificio: «Nuevo registro de vehículos: escanee para seguir entrando». El QR llevaba a portal-bahareque.example/parqueadero, que pedía el correo y la contraseña corporativos.

**Qué se hizo.**
- La administración del edificio quitó los afiches al día siguiente.
- Se mandó un correo a todos: «no escaneen QR». No se preguntó quién lo había escaneado ni se revisaron los inicios de sesión de esos días.
- No se avisó a las otras empresas del edificio ni se reportó el dominio.

**Lecciones aprendidas:** (vacío)
**Indicadores:** no se guardaron.
**Cerrado:** 15-abr-2026, el mismo día.

## INC-2026-06 · Llamada con la voz de la directora financiera

**Qué pasó.** Beatriz recibió una llamada con la voz de Luisa Fernanda Arango: «estoy en el banco y necesito ya el archivo de la nómina con cédulas y cuentas, para un trámite». Beatriz envió el archivo a la dirección que le dictaron (luisa.arango.finanzas@correo-seguro.example). El archivo tenía nombre, cédula, salario, cuenta bancaria y EPS de 46 personas.

**Qué se hizo.**
- Beatriz fue suspendida tres días sin sueldo.
- Luisa Fernanda comentó que su voz sale en los videos de la empresa en redes sociales. No se hizo nada con eso.
- No se les avisó a las 46 personas. No se evaluó reportar a la SIC porque «no hubo pérdida de dinero». Rosa Elena no fue informada.
- No se acordó ninguna palabra clave ni devolución de llamada para pedidos por teléfono.

**Lecciones aprendidas:** «no mandar archivos por teléfono».
**Indicadores:** no se guardaron.
**Cerrado:** 30-jun-2026.

## INC-2026-08 · SIM swap del celular de un administrador

**Qué pasó.** El 19 de agosto el celular de Fernando Salazar se quedó sin señal a las 6:10 a. m.: alguien había pedido un duplicado de su SIM en el operador. Con los códigos por SMS, el atacante entró a su cuenta de la suite, que es administradora, entre las 6:20 y las 8:05 a. m.

**Qué se hizo.**
- Fernando recuperó la línea con el operador a las 11:00 a. m. y cambió su contraseña.
- Se le pidió cambiarse de operador.
- El MFA de los administradores sigue por SMS.
- No se revisó el registro de auditoría de la consola (qué hizo el atacante en esas dos horas), ni las reglas de los buzones, ni si se crearon cuentas o aplicaciones.

**Lecciones aprendidas:** (vacío)
**Indicadores:** no se guardaron.
**Cerrado:** 19-ago-2026.

## INC-2026-09 · App «Lector PDF Pro»

**Qué pasó.** Kevin Arias, practicante que ingresó el 3 de agosto, abrió un «documento compartido» y aceptó la ventana de permisos de «Lector PDF Pro». La suite le dejó aceptar en nombre de toda la organización. Ese mismo día salieron desde la cuenta de Kevin varios correos de «documento compartido» a compañeros de Soporte. Manuela lo reportó y le respondieron que era interno.

**Qué se hizo.**
- Se le quitó a Kevin el acceso a la red por una semana y se le cambió la contraseña. Se le advirtió que a la próxima se termina la práctica.
- Se le dijo que «no instale cosas».
- El caso se cerró cuando Kevin cambió la contraseña. No se revisó la lista de aplicaciones autorizadas ni qué correos leyó o envió la aplicación.
- No se evaluó qué datos personales había en los buzones de Soporte (comercios y compradores de Guadua).

**Lecciones aprendidas:** «los practicantes no deben aceptar permisos».
**Indicadores:** no se guardaron.
**Cerrado:** 15-sep-2026.

## INC-2026-10 · Comando pegado en la terminal

**Qué pasó.** Juliana Cardona recibió un correo de «Mesa de Servicio» para verificar su equipo. La página mostró un «No soy un robot» y le pidió abrir la Terminal, pegar un texto y dar Enter. Lo hizo. El EDR generó una alerta, pero está en modo solo alerta y nadie la miró hasta el día siguiente.

**Qué se hizo.**
- Fernando reinstaló el portátil de Juliana (BHQ-LT-05).
- No se rotaron los tokens ni las credenciales guardadas en ese equipo: navegador, llaves de la nube, sesión de la plataforma de código y Claude Code.
- No se buscó quién más había recibido el correo ni quién más visitó la página. No se bloqueó el dominio en el proxy ni se compartió con nadie.
- Se le pidió a Juliana firmar un compromiso de «no volver a pegar comandos».

**Lecciones aprendidas:** (vacío)
**Indicadores:** no se guardaron.
**Cerrado:** 28-oct-2026.

## Notas sueltas

- Pendiente: hacer una capacitación de phishing algún día. La cotización de 2025 no se aprobó y no se han hecho simulaciones.
- 2026-11-05: en el comité, gerencia preguntó por qué seguimos cayendo. Andrés propone revisar todo después del cierre de año.
- Plantilla para los casos nuevos: fecha · usuario · qué pasó · ¿se resolvió? · cerrado por.
