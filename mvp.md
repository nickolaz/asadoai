# MVP de Asado.ai

El MVP permitirá que una persona ingrese cuántos comensales tendrá, su presupuesto y una ubicación en CABA para obtener, durante esa sesión, un plan de asado personalizado: lista de compras, costo total, cronograma de cocción, tips, recetas y carnicerías de demostración cercanas en un mapa.

La primera versión prioriza una experiencia completa de planificación, no datos comerciales en tiempo real ni persistencia de usuarios. **Este repositorio es la fuente única del proyecto**: contiene la landing, la aplicación, API, datos, estilos y documentación. El único destino de despliegue es Webflow Cloud. El stack obligatorio es **Next.js + Tailwind CSS + Webflow Cloud + Vercel AI SDK + Vercel AI Gateway + modelo IA**.

## Stack definido

| Tecnología | Decisión para el MVP |
|---|---|
| Next.js 15+ | Landing, navegación, contenido editorial, aplicación funcional y endpoint de generación con App Router. |
| Tailwind CSS | Sistema de estilos único del repositorio; implementa los tokens y reglas de [`design.md`](./design.md). |
| Webflow Cloud | Único destino de deploy de la aplicación de Next.js, bajo la ruta de montaje definida, inicialmente `/app`. Corre sobre Cloudflare Workers. |
| Vercel AI SDK | Genera y valida la salida estructurada que necesita el plan. |
| Vercel AI Gateway | Único acceso del servidor a modelos; centraliza credenciales, observabilidad y capacidad de cambiar/rutear proveedores. |
| Modelo inicial | `google/gemini-2.5-flash`, invocado mediante AI Gateway. El identificador se configura como `AI_MODEL` para poder sustituirlo sin cambiar código. |

No se harán llamadas al modelo directamente desde el navegador ni se incluirán claves de IA en variables `NEXT_PUBLIC_*`.

## Flujo principal

1. La persona llega a la landing editorial servida por la aplicación de Next.js en Webflow Cloud.
2. Ingresa personas, presupuesto y ubicación en el formulario de la aplicación.
3. Next.js valida la entrada y solicita una recomendación estructurada al modelo mediante Vercel AI SDK y Vercel AI Gateway.
4. La aplicación valida la recomendación contra el catálogo estático y calcula precios, subtotales y presupuesto.
5. La persona revisa, edita cantidades, explora recetas y carnicerías seed, o comparte el plan mediante una URL temporal serializada.

Resultado esperado: una respuesta útil y verificable sin que la IA pueda inventar productos, cantidades fuera de rango ni precios.

## Alcance incluido

| Área | Incluye |
|---|---|
| Marketing y contenido | Hero, formulario visual, beneficios, explorador de cortes, recetas destacadas y contenido editorial en rutas de Next.js del repositorio. La cabecera se mantiene mínima, sin menú de navegación. |
| Aplicación | Formulario de personas, presupuesto y ubicación; generación de plan; métricas; lista de compra; totales; cronograma generado por IA; tips; recetas; y un único directorio de puntos de CABA mostrado de manera idéntica en la lista y el mapa. |
| Interacción | Filtros, pestañas, edición básica de cantidades, compartir plan, detalle completo de recetas en modal, estados de carga, vacío, error, foco y hover. Solicita geolocalización con permiso para buscar locales RES, Coto y Disco y mostrarlos en el mapa. |
| Diseño | Implementación responsive y accesible según [`design.md`](./design.md). |
| Datos | Productos, cortes, recetas, carnicerías seed y puntos iniciales de mapa en archivos estáticos. `data/locations.json` conserva los puntos de RES, Coto y Disco; `data/locations.ts` es su representación tipada para el cliente. Los precios de los ocho cortes se consultan desde una fuente pública del lado del servidor; el catálogo local queda como fallback. |
| Recursos visuales | Imágenes locales versionadas en `public/images/`; `data/images.json` relaciona cada corte, producto y receta con su recurso. La interfaz no depende de fotos remotas. |

## Límites explícitos

No se construirá en el MVP:

- Inicio de sesión, cuentas ni perfiles.
- Base de datos, panel de administración o CMS propio para la aplicación.
- Historial ni guardado permanente de planes.
- Disponibilidad u ofertas de carnicerías en tiempo real.
- Compra, reserva, entrega o contacto transaccional con carnicerías.
- Catálogo o mapa fuera de CABA.

El plan vive durante la sesión. La opción de compartir crea una representación temporal o una URL serializada; no implica persistencia de datos en un servidor.

## Datos de demostración

Los siguientes dominios se cargan desde archivos estáticos versionados en el repositorio:

| Archivo | Responsabilidad |
|---|---|
| `products.ts` | Productos disponibles, unidades, límites de cantidad y precios fallback. |
| `live-prices.ts` | Consulta pública de precios de cortes, validación de respuesta y caché breve en memoria. |
| `butcheries.ts` | Carnicerías seed de CABA, coordenadas, distancias, horarios, valoraciones y ofertas demostrativas. |
| `locations.json` / `locations.ts` | Directorio local de puntos RES, Coto y Disco de CABA, con coordenadas y tipo de punto; siempre se muestra como base del mapa. |
| `recipes.ts` | Recetas, categorías, duración, dificultad e ingredientes. |
| `cuts.ts` | Cortes, parte de la vaca, descripciones y material visual. |

Toda interfaz que muestre carnicerías, precios u ofertas debe indicar que son datos de demostración, con fecha de actualización. Si se usan comercios reales, su información deberá verificarse y mantenerse manualmente; si eso no sucede, se usarán establecimientos inequívocamente ficticios.

## Rol de la IA y reglas de cálculo

La IA genera dos respuestas estructuradas y validadas usando Vercel AI SDK. La primera recibe únicamente los ocho cortes de carne disponibles en `products.ts`, junto con sus IDs, límites de kg e imagen asociada en `images.json`; recomienda entre dos y cuatro cortes, sus kg y tips. La segunda recibe la lista final, kilos y comensales, y genera el cronograma de cocción.

| La IA propone | La aplicación controla |
|---|---|
| Combinación de 2 a 4 de los 8 cortes permitidos y kg en pasos de 500 g | Catálogo válido, IDs, cantidades mínimas y máximas |
| Recetas y acompañamientos | Cantidades mínimas y máximas |
| Sustituciones y razonamiento | Precios de fuente pública, subtotales y total |
| Tips de cocción personalizados | Estado respecto del presupuesto |

El endpoint rechaza o normaliza cualquier salida que refiera a un producto inexistente, una cantidad inválida o un precio generado por el modelo. Agrega chorizo, morcilla, carbón y bebidas desde reglas determinísticas; el cálculo monetario ocurre exclusivamente en código. Los precios vivos reemplazan los fallback de cortes solamente cuando la consulta devuelve una oferta válida.

## Arquitectura mínima

```text
Repositorio `asadoai`
├── Landing y contenido editorial (Next.js + Tailwind CSS)
├── Aplicación funcional y API (Next.js)
└── Deploy único: Webflow Cloud

Rutas de Next.js
├── app/
├── app/plan/
├── app/api/generate-plan/route.ts
├── data/
    ├── products.ts
    ├── butcheries.ts
    ├── recipes.ts
    └── cuts.ts
└── lib/live-prices.ts
```

| Integración | Propósito | Condición |
|---|---|---|
| Webflow Cloud | Hosting de Next.js y montaje de la aplicación | Usar Next.js 15+ sobre OpenNext/Cloudflare Workers; los Route Handlers usan el runtime Node.js por defecto del adaptador. |
| Tailwind CSS | Estilos y tokens de la app | Consumir los tokens de `design.md`; no existe una segunda capa de estilos en Webflow Designer. |
| Vercel AI SDK | Generar y validar la propuesta estructurada del plan | Ejecutar solamente en el endpoint de servidor compatible con Workers. |
| Vercel AI Gateway | Enrutar la llamada al modelo y custodiar acceso | Usar `AI_GATEWAY_API_KEY` como secreto de Webflow Cloud; nunca exponerla al cliente. |
| `google/gemini-2.5-flash` | Modelo inicial | Invocarlo por su ID con prefijo de proveedor a través de AI Gateway; permitir reemplazo por `AI_MODEL`. |
| Mapbox GL JS | Renderizar el mapa, pines, popups y controles de CABA | `NEXT_PUBLIC_MAPBOX_TOKEN` debe ser un token público `pk.*` restringido al dominio publicado. |

La ruta de montaje se define durante la integración con Webflow; la propuesta inicial es `/app`.

### Mapa

Con `NEXT_PUBLIC_MAPBOX_TOKEN`, el componente cliente usa Mapbox GL JS con mapa navegable, controles de zoom, marcadores clickeables y popups. Al cargar, muestra y encuadra el directorio local de puntos de `locations.json`, por lo que los pines no dependen del permiso de geolocalización ni de una respuesta externa. Esa misma colección —incluidas coincidencias que se agreguen por ubicación— alimenta la lista: ningún punto puede estar solo en el mapa o solo en la lista. La lista solo identifica el tipo y la dirección del punto; no muestra precios, ofertas ni valoraciones. Si la variable no está configurada, muestra el fallback navegable de OpenStreetMap.

### Cronograma de cocción

Después de validar y calcular la lista de compras, la API hace una segunda llamada estructurada al LLM con los cortes definitivos, sus kilos y el número de comensales. El resultado debe tener entre cuatro y seis pasos con horario, acción y detalle. La interfaz identifica explícitamente si el cronograma vino de IA; si Gateway o el modelo no responden, muestra el cronograma base en lugar de atribuírselo a la IA.

## Generación de IA en Webflow Cloud

La integración es compatible con Webflow Cloud porque el endpoint de Next.js se ejecuta como un Worker y la comunicación con AI Gateway es una petición HTTPS estándar. La aplicación no necesita desplegarse en Vercel para utilizar AI Gateway: la autenticación mediante API key está diseñada también para servidores externos.

```text
Navegador
  │ POST {personas, presupuesto, ubicación}
  ▼
Webflow Cloud /app/api/generate-plan (Next.js Edge Route)
  │ valida entrada + carga catálogo estático
  ▼
Vercel AI SDK ── HTTPS con AI_GATEWAY_API_KEY ──► Vercel AI Gateway
                                                    │
                                                    ▼
                                      google/gemini-2.5-flash
                                                    │
  ◄──── salida estructurada validada ◄─────────────┘
  │ recalcula cantidades, subtotales y total
  ▼
Navegador: resultado del plan
```

### Contrato del endpoint

- Ruta: `app/api/generate-plan/route.ts`.
- Runtime: no declarar `export const runtime = 'edge'`; OpenNext ejecuta el Route Handler con su runtime Node.js compatible con Cloudflare Workers.
- Entrada: `personas`, `presupuesto` y `ubicación`, con validación previa a cualquier llamada externa.
- Proceso: cargar los ocho cortes estáticos y su relación con imágenes; enviar al LLM solo esos IDs, rangos de kg y nombres; solicitar de 2 a 4 recomendaciones con `quantityKg`; validar, normalizar y agregar los complementos determinísticos. Con la lista final, hacer una segunda llamada estructurada para el cronograma.
- Salida: ítems identificados por IDs de catálogo, cantidades recomendadas, recetas, cronograma y tips. El endpoint recalcula todos los valores monetarios antes de responder, usando precios vivos válidos o el fallback de `products.ts`.
- Error: devolver un mensaje recuperable sin revelar el proveedor, clave, prompt interno ni detalles de Gateway.
- Precios: consultar la fuente pública solo desde el servidor, con timeout y caché de 15 minutos. Si no responde, no declarar los precios fallback como precios vivos.

El navegador llama a la ruta usando el prefijo de montaje: `${NEXT_PUBLIC_BASE_PATH}/api/generate-plan`. No debe asumir que la aplicación está en la raíz del dominio.

> **Compatibilidad a vigilar:** Webflow Cloud construye Next.js mediante OpenNext/Cloudflare. Con Next.js 16, declarar `runtime = 'edge'` puede producir un deploy exitoso pero respuestas 500 al invocar Route Handlers. Se omite esa directiva y se revisará la guía de Webflow/OpenNext antes de cada actualización mayor de Next.js.

### Variables de entorno

| Variable | Dónde vive | Uso |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Secreto en Webflow Cloud | Autentica el SDK contra Vercel AI Gateway. Solo servidor. |
| `AI_MODEL` | Configuración de Webflow Cloud | Modelo inicial: `google/gemini-2.5-flash`. Permite cambiar de modelo sin modificar código; Webflow Cloud aplicará el cambio en el siguiente deploy. |
| `NEXT_PUBLIC_BASE_PATH` | Configuración de Webflow Cloud | Ruta de montaje, inicialmente `/app`; necesaria en `fetch` del cliente. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Configuración pública restringida de Mapbox | Token de visualización del mapa, limitado al dominio publicado. |

En local, estas variables viven en `.env.local`, que no se versiona. En Webflow Cloud, `AI_GATEWAY_API_KEY` se crea marcada como secreto. La clave no se registra en logs, no se pasa a componentes cliente y no se usa en Webflow Designer.

### Costos y capa gratuita de Gemini

`google/gemini-2.5-flash` se elige por su buena relación entre velocidad y costo para un plan estructurado. Gemini API ofrece una capa gratuita limitada y variable según modelo/cuenta, pero este MVP **no llama a Gemini API de forma directa**: conserva Vercel AI Gateway como capa de acceso.

Una verificación local realizada el 25/09/2026 mostró que AI Gateway exige una tarjeta válida en la cuenta antes de atender solicitudes, incluso cuando pueda haber créditos promocionales disponibles. Una API key por sí sola no habilita el modelo: mientras falte esa configuración, la aplicación muestra su plan y cronograma de respaldo. No se debe presentar la aplicación como "gratis" ni asumir que la cuota gratuita directa de Google aplica a las solicitudes enrutadas por Gateway. Si el objetivo pasa a ser usar exclusivamente la cuota gratuita de Google, deberá reemplazarse AI Gateway por una integración directa de Gemini API; eso cambia el stack definido.

### Referencias de compatibilidad

- [Webflow Cloud: Next.js, rutas API y ruta de montaje](https://developers.webflow.com/webflow-cloud/bring-your-own-app)
- [Webflow Cloud: configuración y prefijos para llamadas `fetch` del cliente](https://developers.webflow.com/webflow-cloud/environment/configuration)
- [Vercel AI Gateway: autenticación por API key, válida fuera de Vercel](https://vercel.com/docs/ai-gateway/authentication-and-byok)
- [Vercel AI Gateway: uso mediante Vercel AI SDK](https://vercel.com/docs/ai-gateway/sdks-and-apis)
- [Google Gemini API: facturación y capa gratuita](https://ai.google.dev/gemini-api/docs/billing)
- [Vercel AI Gateway: precios y crédito gratuito](https://vercel.com/docs/ai-gateway/pricing)

## Criterios de aceptación

- [ ] Con personas, presupuesto y ubicación válidos, la aplicación produce un plan estructurado.
- [ ] El endpoint de generación funciona bajo la ruta de montaje de Webflow Cloud sin declarar el runtime Edge de Next.js.
- [ ] La llamada de IA ocurre exclusivamente desde el endpoint de Next.js hacia AI Gateway, con `AI_GATEWAY_API_KEY` guardada como secreto.
- [ ] Tailwind CSS implementa los tokens visuales definidos en `design.md`.
- [ ] Cada ítem del plan pertenece al catálogo estático y todos los importes se calculan en cliente/servidor sin depender del texto del LLM.
- [ ] La persona puede modificar cantidades dentro de los límites definidos y el total/estado de presupuesto se actualiza.
- [ ] El resultado muestra lista de compras, métricas, plan de cocción, tips, recetas y mapa/lista de carnicerías seed.
- [ ] Filtros, pestañas, controles de mapa y acciones principales tienen estados de foco y funcionan en mobile.
- [ ] Los datos de carnicerías, precios y ofertas se identifican claramente como demostrativos y orientativos.
- [ ] El plan puede compartirse sin crear una cuenta y sin generar persistencia permanente.

## Decisiones pendientes antes de construir

1. Crear la API key de Vercel AI Gateway y cargarla como secreto en Webflow Cloud.
2. Token y estilo visual de Mapbox.
3. Imágenes definitivas de hero, cortes, recetas y carnicerías, con licencias y texto alternativo.
4. Ruta de montaje final de Next.js en Webflow Cloud.
5. Política de datos para carnicerías: nombres ficticios o comercios reales verificados manualmente.

## Próximo paso

Configurar la API key de AI Gateway, el entorno de Webflow Cloud y Mapbox; luego crear el esqueleto de Next.js con Tailwind, el endpoint Edge y los cuatro archivos de datos estáticos. La implementación debe tomar [`design.md`](./design.md) como referencia de interfaz y este documento como límite de producto.
