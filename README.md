# Asado.ai

Planificá un asado a partir de cantidad de personas, presupuesto y ubicación. La aplicación propone cortes y cantidades, calcula una lista de compras y un cronograma de cocción, y muestra puntos de compra en un mapa de CABA.

La experiencia no requiere registro ni guarda planes en una base de datos: el plan se genera para la sesión actual.

## Inicio rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Completá las variables de `.env.local` antes de probar IA o el mapa.

Para una comprobación rápida de tipos y de la compilación:

```bash
npm run lint
npm run build -- --webpack
```

## Qué hace

| Área | Comportamiento actual |
| --- | --- |
| Plan personalizado | Envía personas, presupuesto y ubicación a un Route Handler de Next.js. Gemini selecciona entre 2 y 4 cortes autorizados y sus kilos. |
| Cálculos confiables | El catálogo local define productos, límites, precios fallback, subtotales y total. El modelo no puede inventar productos ni importes. |
| Cronograma | Una segunda consulta de IA arma entre 4 y 6 pasos según los cortes y cantidades finales. Si falla, se muestra un cronograma base. |
| Precios | Intenta consultar precios públicos de cortes en Disco desde el servidor; si faltan, no hay stock o la fuente falla, usa precios orientativos del catálogo. |
| Mapa | Muestra el directorio local de puntos y, con permiso del usuario, consulta Mapbox para sumar resultados cercanos de RES, Coto y Disco. |
| Contenido | Incluye explorador de cortes, recetas con detalle modal, edición de cantidades y compartir enlace. |

## Arquitectura

- **Next.js 16 + React 19 + Tailwind CSS** para interfaz y Route Handlers.
- **Webflow Cloud** es el único destino de despliegue.
- **Vercel AI SDK + AI Gateway** enrutan la generación estructurada.
- **Gemini** es el modelo inicial configurable (`google/gemini-2.5-flash`).
- **Mapbox GL JS** presenta mapa, pines y geocodificación.
- Los catálogos, recetas, imágenes y puntos iniciales viven en archivos versionados; no hay base de datos ni autenticación.

El detalle de producto, límites y decisiones técnicas está en [mvp.md](./mvp.md). La referencia visual está en [design.md](./design.md).

## Variables de entorno

Creá `.env.local` a partir de `.env.example`. Nunca subas un archivo `.env*` con valores reales.

| Variable | Requerida | Uso |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Sí, para IA | Secreto de servidor para Vercel AI Gateway. En Webflow Cloud debe cargarse como **Secret Variable**. |
| `AI_MODEL` | No | Modelo de Gateway. Por defecto: `google/gemini-2.5-flash`. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Sí, para mapa y búsqueda cercana | Token público de Mapbox. Se incorpora al navegador; restringilo por URL a los dominios de desarrollo y producción. |
| `NEXT_PUBLIC_BASE_PATH` | Depende del deploy | Vacío en local y en un dominio propio de la app; usá el mount path cuando la app se integre dentro de un sitio Webflow. |

> `NEXT_PUBLIC_*` no es secreto por definición: Next.js lo expone al navegador. No guardes allí claves privadas, tokens de IA ni credenciales de servidor.

## Precios: alcance y funcionamiento

La integración de precios **no debe presentarse como una garantía de precios en tiempo real**. Es una consulta de datos públicos con fallback local:

1. `app/api/generate-plan/route.ts` llama a `lib/live-prices.ts` antes de generar el plan.
2. El servidor consulta, en paralelo, el endpoint JSON público del storefront de Disco para los ocho cortes permitidos.
3. Normaliza el nombre, exige stock y toma el precio de la oferta encontrada.
4. Guarda un snapshot en memoria por 15 minutos. Un Worker nuevo puede perder esa caché y volver a consultar la fuente.
5. Si una consulta no produce un resultado válido, el producto conserva su precio orientativo local.

No se consulta ni extrae precio de Coto actualmente; Coto aparece solo como comercio de referencia en el mapa. El endpoint de Disco no es una integración contractual ni estable, así que puede cambiar, devolver resultados inesperados o no responder según la zona. La interfaz identifica la fuente y fecha solo cuando logra usar un snapshot válido.

## Desplegar en Webflow Cloud

1. Subí este repositorio a GitHub y conectalo desde Webflow Cloud.
2. Seleccioná `main`, con `./` como directorio raíz si el proyecto se mantiene en la raíz del repositorio.
3. En el entorno de Webflow configurá las variables anteriores. Marcá únicamente `AI_GATEWAY_API_KEY` como secreta.
4. Para un dominio independiente, dejá `NEXT_PUBLIC_BASE_PATH` vacío. Para una app montada en un sitio, usá el path de montaje que configuraste en Webflow.
5. Desplegá y verificá `POST /api/generate-plan` y `POST /api/nearby-locations` desde el formulario.

Webflow Cloud detecta Next.js desde `package.json` y despliega desde GitHub. Consultá la [guía oficial de Bring your own app](https://developers.webflow.com/webflow-cloud/bring-your-own-app) para la configuración vigente.

## Seguridad del repositorio

- `.gitignore` excluye `.env*` y solo permite versionar `.env.example`.
- `.env.example` contiene nombres de variables y valores vacíos, nunca credenciales.
- `AI_GATEWAY_API_KEY` se usa únicamente en el Route Handler; no llega al cliente.
- El token de Mapbox es deliberadamente público, pero debe tener restricciones de dominio y los permisos mínimos necesarios desde el panel de Mapbox.

Antes de cada push, revisá:

```bash
git status --short
git diff --cached -- . ':!package-lock.json'
```

Si una clave fue expuesta por error, revocala o rotala en su proveedor antes de hacer público el repositorio; borrarla en un commit posterior no elimina el historial.

## Estado del MVP

La generación y el cronograma usan IA cuando AI Gateway está configurado y disponible. El resto de la aplicación conserva una ruta determinística para que el plan siga siendo utilizable si el proveedor, Mapbox o la fuente pública de precios no responden.
