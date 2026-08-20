# Lemmatica como negocio SaaS — estrategia y precios

**Fecha:** 20 de agosto de 2026 · Compañero de este documento: `Modelo_Unit_Economics_Lemmatica.xlsx`
(fórmulas editables — cambia cualquier supuesto en la hoja "Supuestos" y todo el modelo se recalcula).

Antes de entrar en el análisis, una corrección: al iniciar esta conversación dije que el costo de
Gemini por consulta rompía el argumento del margen alto típico de SaaS. Con números reales enfrente,
esa intuición estaba equivocada — el detalle está en la sección 2. Vale la pena decirlo así de directo
porque cambia la conclusión central: el negocio no está limitado por el costo de la IA, está limitado
por cuánto le cuesta y cuánto tarda conseguir cada médico pagante.

---

## 1. Qué es Lemmatica hoy, y qué le falta para ser un negocio

Es un producto de documentación clínica con IA: consulta hablada → nota SOAP + receta + expediente.
Le falta la mitad del andamiaje comercial de un SaaS: no hay `Subscription`, `Plan`, ni pasarela de
pago en el esquema; no hay entidad `Clinic`/`Organization` (todo cuelga de `doctorId`, un médico
individual); el rol `ASSISTANT` existe en el enum pero no se usa en ningún endpoint. Hoy es una
herramienta que un médico podría usar gratis para siempre, porque nada en el código le impide hacerlo.

Eso no es necesariamente malo en esta etapa — es lo esperable de un MVP construido rápido — pero es la
primera cosa que hay que resolver antes de cobrar un peso.

---

## 2. La pregunta que investigué primero: ¿cuánto cuesta realmente cada consulta?

Usé los precios vigentes de Gemini, de tres proveedores de transcripción de voz (AssemblyAI, Deepgram,
OpenAI), de Supabase, Cloudflare R2 y tres plataformas de hosting — todos verificados hoy contra la
página oficial (fuentes completas en la hoja "Fuentes" del Excel). El resultado sorprende:

| Escenario de arquitectura | Costo por consulta de 15 min |
|---|---|
| Actual: Web Speech API del navegador + Gemini (solo texto) | **$0.028 USD** |
| Recomendado: STT dedicado (AssemblyAI) + Gemini (solo texto) | **$0.066 USD** |
| Multimodal nativo: audio directo a Gemini 2.5 Pro | **$0.053 USD** (audio-a-texto no confirmado para este modelo — verificar) |

Menos de siete centavos de dólar por consulta, incluso en el escenario que sí paga por transcripción
de voz con un proveedor serio. El almacenamiento del audio comprimido en Cloudflare R2 agrega
fracciones de centavo más. Ni la IA ni el almacenamiento son el costo que va a definir tu margen.

**Lo que sí cuesta, y es prácticamente fijo, es el hosting**: ronda $85 USD/mes (backend + base de
datos + frontend + un colchón para dominio/monitoreo/respaldos) sin importar si tienes 3 médicos o 300.
Con solo 2 a 4 médicos pagando el plan más barato, ese costo fijo ya está cubierto (hoja
"PuntoEquilibrio"). Después de eso, cada médico adicional es casi puro margen de contribución.

Con eso, el margen bruto que arroja el modelo es de **79% a 86%** según el plan y el nivel de uso
(hoja "PreciosMargen") — sí, el margen alto de SaaS que asumí que no aplicaba. Aplica. El riesgo real
del negocio no está en el costo variable; está en tres lugares distintos:

1. **El costo de vender**, no de servir — adquisición de médicos independientes en México es una venta
   lenta y relacional, no un botón de "self-serve" que se paga solo.
2. **La arquitectura de datos de hoy**, que si no se corrige antes de escalar, sí puede volverse cara:
   guardar audio en base64 dentro de una columna `Text` de Postgres bloatea la base transaccional y
   fuerza subir de plan de Supabase antes de tiempo — es un problema de diseño, no de $/GB.
3. **El cumplimiento legal** (LFPDPPP, NOM-004, validez de receta electrónica) — un incidente aquí
   cuesta mucho más que cualquier ahorro en infraestructura.

---

## 3. Con quién compites, y qué te dice el precio de cada uno

| Producto | Precio | Qué incluye |
|---|---|---|
| **Noa Notes (Doctoralia, México)** | $550 MXN+IVA/mes (~$34 USD) | Solo el escriba IA, como add-on sobre Doctoralia Pro |
| **Doctoralia Plus (México)** | $2,340 MXN+IVA/mes (~$147 USD) | Agenda, marketplace de pacientes nuevos, WhatsApp, pagos, Noa Booking |
| **Doctoralia VIP (México)** | $2,970 MXN+IVA/mes (~$186 USD) | Todo lo anterior + posicionamiento, comisiones más bajas, receta digital |
| **Freed.ai Starter (EE.UU.)** | $39 USD/mes | Escriba IA, 40 notas/mes |
| **Freed.ai Core (EE.UU.)** | $79 USD/mes | Escriba IA ilimitado + plantillas |

*(Heidi Health, Nabla y Suki no publican precio en su sitio — venta directa/enterprise; no se
incluyen aquí porque no pude verificar una cifra en vivo hoy.)*

Esto te da dos referencias muy distintas de disposición a pagar en México:

- **Como escriba solo:** el mercado mexicano ya está anclado en ~$34 USD/mes (Noa Notes). Cobrar más
  que eso por *lo mismo* es cuesta arriba, salvo que ofrezcas algo que Noa Notes no tiene.
- **Como paquete de consultorio:** el mercado mexicano ya paga $147-186 USD/mes por *agenda + escriba +
  marketplace de pacientes*. Ahí SÍ hay espacio para cobrar más — pero solo si compites en ese paquete
  completo, y tu debilidad ahí es clara: **no tienes marketplace de pacientes nuevos**, que es
  probablemente el motivo principal por el que un médico paga el precio alto de Doctoralia. Sin eso,
  cobrar como Doctoralia Plus es difícil de justificar.

**Tu ventaja real frente a Noa Notes** no es el precio, es el producto: ya tienes expediente clínico,
agenda, finanzas e inventario integrados al escriba — Noa Notes es *solo* el escriba, colgado de la
plataforma de Doctoralia. Eso es una historia de producto distinta ("todo tu consultorio en un lugar",
no "solo la transcripción"), y esa historia sostiene un precio un poco arriba del ancla de $34 sin
pretender competir con el paquete de $147-186.

---

## 4. Precios recomendados

Con eso, y con el modelo de costos de la sección 2, propongo tres planes (ya están en la hoja
"PreciosMargen" del Excel, edítalos ahí):

| Plan | Precio | Para quién | Margen bruto |
|---|---|---|---|
| **Starter** | $30 USD/mes (~$644 MXN+IVA) | Médico solo, consulta ocasional | 86% |
| **Pro** | $45 USD/mes (~$966 MXN+IVA) | Médico solo, uso diario intensivo | 82% |
| **Clínica** | $75 USD/mes (~$1,610 MXN+IVA) | Consultorio con 1+ asistente (usa el rol `ASSISTANT` que ya existe en tu esquema y hoy no hace nada) | 79% |

Esto posiciona a Lemmatica ligeramente arriba de Noa Notes ($34) pero muy por debajo del paquete
completo de Doctoralia ($147-186) — coherente con "más que un escriba suelto, pero no vendemos
pacientes nuevos todavía". Es también más barato que Freed.ai en dólares, lo cual tiene sentido: el
poder de compra y la disposición a pagar por software en México no son los de Estados Unidos.

**Una pregunta que el precio no resuelve por sí solo:** ¿vas a vender adquisición de pacientes en algún
momento (como Doctoralia) o vas a quedarte exclusivamente en "herramienta para el consultorio que ya
tiene pacientes"? Es una decisión de producto, no solo de precio, y cambia por completo a quién le
compites.

---

## 5. Ir al mercado en México

**Quién compra primero:** médicos generales y de 2-3 especialidades con alto volumen de consulta y
poco tiempo administrativo — pediatría, medicina general/familiar, ginecología. Son quienes más sufren
la carga de escribir notas y quienes más rápido ven el valor de un escriba en la primera consulta.
Evita por ahora especialidades con expedientes muy estructurados o de baja frecuencia de consulta
(psiquiatría, cirugía) — el ajuste de producto (plantillas SOAP genéricas) es peor ahí.

**Cómo llegar a ellos**, en orden de costo de adquisición creciente:

1. **Boca a boca gremial.** Los médicos mexicanos se recomiendan software entre colegas de forma muy
   activa (grupos de WhatsApp por especialidad, asociaciones locales). Un programa de referidos con
   un mes gratis para quien refiere y quien es referido es más barato que cualquier canal pagado.
2. **Universidades y hospitales privados de formación** — donde ya tienes cédulas y especialidades
   capturadas en el onboarding, esa misma pantalla es una mina de datos para saber en qué universidades
   concentrar demostraciones.
3. **Colegios y asociaciones médicas** (de especialidad y estatales) — patrocinar un congreso pequeño
   cuesta una fracción de lo que cuesta un vendedor tocando puertas de consultorio en consultorio, y
   llega a cientos de médicos ya agrupados por especialidad.
4. **Contenido dirigido a la carga administrativa**, no a "IA" — el dolor que resuelve Lemmatica es
   "no quiero escribir notas en la noche", no "quiero usar inteligencia artificial". El marketing debe
   hablarle a eso.

**Lo que NO recomiendo todavía:** pagar por adquisición vía redes sociales o buscadores. El CAC de ese
canal para software B2B médico suele ser alto y lento de recuperar, y no tienes todavía datos propios
de conversión para saber si tu producto convierte lo suficientemente bien como para que valga la pena
— constrúyelo orgánicamente primero, mide el CAC real de los primeros 20-30 clientes, y recién ahí
decide si un canal pagado tiene sentido.

**Fricción del producto que te va a costar activación,** detectada en la revisión técnica: el registro
funciona, pero el dashboard, el directorio de pacientes y la vista de receta están rotos por el bug de
`fetch` sin token (ver `REVISION_TECNICA.md`). Un médico que se registra hoy y no ve sus pacientes en
la primera sesión no vuelve. Esto no es un problema de estrategia de negocio, es un bloqueador de
cualquier estrategia de negocio — no vale la pena invertir en adquisición hasta que el camino de
"regístrate → ve tus pacientes → haz tu primera consulta" funcione de punta a punta.

---

## 6. Riesgos que no son de producto, son del modelo de negocio

- **Ciclo de venta más largo de lo que el margen alto sugiere.** Un médico independiente decide
  software con menos urgencia que una empresa — no hay un "gerente de compras" empujando la decisión,
  y el ciclo puede ser de semanas. El margen del 80%+ no importa si el CAC real (que hoy es un
  supuesto sin datos, ver hoja "CAC_LTV") resulta ser más alto que lo que un médico paga en 6-8 meses.
- **El LTV:CAC de 23x que arroja el modelo es un espejismo hasta que tengas churn real.** Ese número
  sale de asumir 4% de cancelación mensual — una referencia genérica de SaaS de PyME, no un dato de
  este mercado. Si el churn real es 8-10% (nada raro en software vendido a profesionales
  independientes sin contrato), el LTV cae a la mitad y el panorama es mucho menos generoso. Mide esto
  con tus primeros 20 clientes antes de tomarlo en serio.
- **Dependencia de un solo proveedor de IA (Google Gemini).** El costo es bajo hoy, pero un cambio de
  precio o de política de uso de datos de Google puede mover tu costo variable de la noche a la mañana.
  Vale la pena diseñar el backend para poder cambiar de proveedor de LLM sin reescribir la lógica de
  negocio.
- **El dato clínico es el activo más valioso y el más peligroso.** El "data lake anonimizado" del
  esquema es hoy pseudonimizado, no anónimo (ver informe técnico) — eso no es solo un riesgo de
  cumplimiento, es una oportunidad de negocio mal armada: los datos agregados de prescripción y
  diagnóstico sí tienen valor comercial real (farmacéuticas, aseguradoras), pero solo si la
  anonimización es defendible legalmente. Hoy no lo es.
- **Vender "software de escriba" es fácil de imitar.** Doctoralia ya lo hizo (Noa Notes) en meses.
  Tu defensa a mediano plazo no es la transcripción, es el expediente + agenda + finanzas integrados y,
  eventualmente, los datos agregados de tu propia base de médicos — construye ahí, no en competir en
  quién transcribe mejor.

---

## 7. Plan de 12 meses

**Meses 1-2 — Que el producto pueda cobrar.**
Arreglar los bloqueadores del informe técnico (rutas rotas, `apiFetch`, migraciones). Agregar
`Subscription`/`Plan` al esquema y una pasarela de pago (Stripe soporta México; Conekta/MercadoPago
son alternativas locales con métodos de pago que un médico mexicano ya conoce, como transferencia SPEI
y tarjetas de débito). Mover el audio a R2. Definir contractualmente el uso de datos con Google o migrar
el ASR a un proveedor con acuerdo de procesamiento de datos.

**Meses 3-5 — Primeros 20-30 clientes pagando, medidos de cerca.**
Reclutar médicos vía referidos y 2-3 asociaciones de especialidad. Registrar cada conversión, cada
cancelación, y el motivo. El objetivo de este bloque no es ingresos, es **tener un CAC y un churn
reales** para reemplazar los supuestos de la hoja "CAC_LTV".

**Meses 6-9 — Ajustar precio y plan con datos reales.**
Con datos de uso real, ajustar los niveles "Ligero/Medio/Intensivo" del modelo si no coinciden con la
realidad. Decidir si el plan "Clínica" (con asistente) tiene demanda o si hay que rediseñarlo. Empezar
a construir la relación con 1-2 hospitales o universidades como canal repetible.

**Meses 10-12 — Decidir el siguiente salto.**
Con datos de 9-12 meses, decidir explícitamente: ¿compites por el paquete completo de $147-186 USD
(lo que exige construir o integrar un marketplace de pacientes), o te consolidas como el "mejor
escriba + expediente" a $30-75 y dejas la adquisición de pacientes a otros? Es la bifurcación
estratégica más importante del año, y no hay suficiente información hoy para decidirla — depende de lo
que aprendas en los meses 3-9.

---

## 8. Lo que verifiqué en vivo hoy vs. lo que es un supuesto de trabajo

Verificado contra la fuente oficial (URLs completas en la hoja "Fuentes" del Excel): precios de
Gemini 2.5 Pro/Flash, AssemblyAI, Deepgram, Supabase, Cloudflare R2, Railway/Render/Vercel, y los
precios de Doctoralia/Noa Notes y Freed.ai en sus páginas públicas.

**No pude verificar en vivo hoy** (la herramienta de búsqueda web falló toda la sesión): número de
médicos en México, tipo de cambio MXN/USD, precios de Heidi Health/Nabla/Suki. Los usé como
referencia de memoria marcada explícitamente como "NO VERIFICADO" en el Excel. Antes de poner cualquier
cifra de mercado en un documento para inversionistas, confírmala con INEGI, OCDE (oecd.org/health) y,
si puedes, cifras públicas de médicos activos en Doctoralia.
