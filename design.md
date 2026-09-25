# Especificación visual — Asado.ai

La página debe sentirse como una herramienta cálida y confiable para organizar un asado: una estética editorial gastronómica, oscura y sofisticada, combinada con paneles claros de producto. La referencia representa una **landing/planificador con un estado de resultado visible en la misma pantalla**, organizada como un dashboard de tres columnas en escritorio.

## Objetivo de la experiencia

Una persona debe poder:

1. Indicar cuántas personas son, presupuesto y ubicación.
2. Obtener un plan de compra y cocción adaptado.
3. Comparar carnicerías cercanas y descubrir cortes, recetas y extras sin abandonar la página.

La interfaz comunica cercanía argentina (asado, CABA, cortes locales) y evita verse como una aplicación financiera o genérica.

## Rutas del flujo

La imagen de referencia combina en un solo canvas la captación y el resultado. La implementación separa ese recorrido para que la primera visita sea clara y enfocada:

| Ruta | Propósito | Contenido |
|---|---|---|
| `/` | Captura inicial | Hero de marca, explicación breve, formulario de personas/presupuesto/ubicación y beneficios. No muestra resultados ni el dashboard. |
| `/plan` | Resultado | Recibe los datos del formulario, genera el plan y muestra métricas, lista de compra, cronograma, recetas y carnicerías. |

La composición de tres columnas de la referencia corresponde a `/plan`; no debe renderizarse en la página inicial.

## Principios de diseño

| Principio | Decisión visual |
|---|---|
| Contraste intencional | Superficies claras para información operativa; fondos carbón para marca, contenido editorial y llamados a la acción. |
| Fotografía protagonista | Imágenes de parrilla, cortes y comidas reales con luz cálida, textura y alto detalle. |
| Jerarquía inmediata | Títulos grandes, cifras destacadas y botones coral; la información secundaria usa gris azulado y menor tamaño. |
| Densidad controlada | Muchas funciones conviven en pantalla mediante tarjetas, separadores sutiles, pestañas y bloques con títulos claros. |
| Calidez local | Español rioplatense, pesos argentinos, referencias a CABA y una paleta inspirada en brasas y carne. |

## Estructura de escritorio

Usar una grilla exterior de tres áreas, con margen generoso y separación uniforme (aprox. 16–24 px):

| Área | Ancho relativo | Contenido |
|---|---:|---|
| Columna izquierda | 46% | Marca, hero, formulario, beneficios y exploración de cortes. |
| Columna central | 25% | Resultado del plan, lista de compra, cronograma de cocción y recetas. |
| Columna derecha | 29% | Carnicerías cercanas, mapa, promoción de la app móvil y extras. |

La página no usa un único encabezado global separado: la navegación está integrada en el hero de la columna izquierda. Cada bloque importante se comporta como una tarjeta independiente con radio amplio.

## Columna izquierda: captación y conocimiento

### Hero y cabecera

El bloque superior es una tarjeta oscura de gran altura con una fotografía de parrilla ocupando el fondo. Aplicar una superposición negra suave para preservar legibilidad.

- Logo: ícono de llama coral + “Asado.ai” en blanco; debajo, el lema “Tu asado, más fácil.”
- Cabecera mínima: no incluir botones de navegación (`Inicio`, `Cómo funciona`, `Recetas` ni `Consejos`). La acción principal es completar el formulario; en el plan generado, las pestañas contextuales permiten recorrer su contenido.
- Ubicación: pin coral y texto `CABA`.
- Titular: “Decile a la IA qué querés, y te armamos el asado perfecto.” en dos o tres líneas, con énfasis coral suave en la primera línea.
- Copia de apoyo: explica cortes, cantidades, precios, carnicerías y recetas.
- Detalle expresivo: una frase manuscrita blanca, una flecha dibujada y una pequeña bandera argentina. Debe ser decorativa, no necesaria para entender el flujo.

### Formulario flotante

Montar una tarjeta blanca superpuesta al borde inferior del hero, con sombra suave y radio grande. Contiene tres campos horizontales y un CTA:

| Campo | Etiqueta | Placeholder |
|---|---|---|
| Personas | ¿Cuántas personas son? | Ej: 8 |
| Presupuesto | ¿Cuál es tu presupuesto? | Ej: $ 80.000 |
| Ubicación | ¿Dónde estás? | Ej: CABA |

Cada campo comienza con un ícono circular de fondo durazno muy claro. El botón `Generar plan →` usa coral/rosa, texto oscuro y debe ser el foco visual del bloque.

### Beneficios

Debajo, una franja clara de cuatro beneficios distribuidos horizontalmente. Cada uno usa un ícono lineal dentro de un círculo pálido y una frase breve:

- Optimiza tu presupuesto para que alcance mejor.
- Muestra carnicerías cercanas y ofertas de demostración.
- Explica de qué parte de la vaca son los cortes.
- Arma un plan de compra y cocción.

### Explorador de cortes

Una tarjeta editorial de fondo carbón incluye:

- Título “Cortes y qué parte de la vaca son”.
- Descripción breve que invita a conocer las partes y elegir según gusto y presupuesto.
- Ilustración anatómica de una vaca, con zonas delineadas y etiquetas de cortes.
- Filtros tipo píldora: `Todos`, `Asado`, `Vacío`, `Lomo`, `Bola de lomo`, `Nalga`, `Pechito`.
- Cuatro tarjetas de corte con foto, nombre, parte, descripción y botón secundario `Ver más`.

## Columna central: el plan generado

### Resumen

En una tarjeta clara, iniciar con una acción discreta `← Volver` y una acción `Compartir` alineada a la derecha. Mostrar:

- Título: `Resultado de tu plan`.
- Contexto: plan basado en 8 personas, presupuesto de $80.000 y ubicación en CABA.
- Tres métricas: `Personas 8`, `Presupuesto $80.000` y `Costo estimado $76.420`.
- Estado de éxito en verde: `Dentro de tu presupuesto`.

Las métricas se separan con divisores verticales y sus íconos van dentro de círculos de fondo rosado tenue.

### Lista de compra

Usar pestañas de navegación contextual: `Lista de compra` activa, `Carnicerías cercanas`, `Plan de cocción` y `Recetas`.

La tabla/lista debe mostrar imagen pequeña, producto, cantidad y subtotal. Los elementos de referencia son vacío, tira de asado, chorizo, morcilla, bondiola opcional, carbón y bebidas. Añadir una acción `Editar` junto al título. Separar las filas con líneas muy sutiles.

### Plan de cocción

Tarjeta blanca con título `Tu plan de cocción` y un cronograma secuencial. Cada fila incluye icono circular, hora, acción y una instrucción corta:

| Hora | Acción |
|---:|---|
| 18:00 | Encender el carbón |
| 18:30 | Poner la carne (vacío y tira) |
| 19:00 | Chorizos y morcillas |
| 19:20 | Dar vuelta la carne |
| 19:40 | Retirar y dejar reposar |
| 20:00 | ¡A disfrutar! |

Cerrar con un aviso cálido `Tip de la IA` en fondo crema/durazno, con recomendación de temperatura y termómetro.

### Recetas y acompañamientos

Tarjeta clara con título y una explicación de una línea. Incluir filtros en píldora (`Todos`, `Ensaladas`, `Acompañamientos`, `Salsas`, `Postres`), una grilla 2 × 2 de recetas y un botón coral de ancho completo `Ver todas las recetas →`.

Cada receta debe incluir imagen, nombre, duración y dificultad. El botón circular `+` sirve para añadirla al plan.

## Columna derecha: decisión local y retención

### Carnicerías cercanas

La tarjeta comienza con `Carnicerías cercanas`, un texto de contexto y una barra de controles: radio de búsqueda (`CABA · a menos de 5 km`) y orden (`Cercanía`).

El cuerpo se divide verticalmente:

- A la izquierda, una lista de carnicerías con miniatura, nombre, valoración, distancia, oferta/detalle de precio y botón `Ver detalles`.
- A la derecha, un mapa de CABA con pines en coral para locales destacados y pines oscuros para otros puntos. Incluir controles de zoom.

La primera carnicería puede exhibir una insignia verde `Tiene oferta`. Para el MVP, locales, precios y ofertas proceden de datos estáticos y orientativos; mostrar una leyenda como `Datos de demostración · actualizados el DD/MM/AAAA` para no sugerir disponibilidad ni precios en tiempo real. No usar el mapa como imagen de fondo de toda la sección: debe estar en su propio panel rectangular con bordes redondeados.

### Promoción móvil

Tarjeta de fondo carbón con el logo, texto “Llevá el asado en el celular. Controlá tiempos, temperaturas y más.”, CTA coral `Ver cómo funciona →` y un mockup de teléfono a la derecha. Decorarla con dibujos lineales pequeños relacionados con parrilla/brasas.

### Extras y cierre

Mostrar una tarjeta blanca de extras en cuatro columnas: calculadora de bebidas, lista de compra para el súper, consejos de un parrillero experto y modo vegetariano/vegano. Terminar con una barra de marca oscura y un mensaje de cierre vinculado a la tecnología, sin perder el tono humano y local.

## Sistema visual

### Paleta

Los valores son aproximados; deben validarse contra el asset final durante la implementación.

| Token | Uso | Color sugerido |
|---|---|---|
| `--color-ink` | Fondos oscuros, títulos principales | `#11161D` |
| `--color-ink-soft` | Gradientes/superposiciones del hero | `#1B2028` |
| `--color-coral` | CTA, llama, pines y acentos | `#FF7F83` |
| `--color-coral-light` | Fondos de íconos y chips suaves | `#FFF0EC` |
| `--color-cream` | Fondo general | `#FCF8F4` |
| `--color-surface` | Tarjetas | `#FFFFFF` |
| `--color-text` | Texto de lectura | `#17202B` |
| `--color-muted` | Metadatos y texto secundario | `#5D6875` |
| `--color-success` | Oferta/estado dentro de presupuesto | `#159A64` |
| `--color-border` | Divisores y contornos tenues | `#ECE7E2` |

### Tipografía

- Sans serif contemporánea, de buena legibilidad (por ejemplo, Inter, Manrope o equivalente).
- Titulares: peso 700–800, tracking levemente cerrado, alto contraste.
- Texto de interfaz: 12–14 px en escritorio; etiquetas y metadatos en 10–12 px.
- Hero: 48–56 px en pantallas grandes, interlineado compacto (aprox. 1.05).
- Títulos de tarjeta: 18–24 px, peso 700.

### Espaciado, bordes e iconos

- Base de espaciado: múltiplos de 4 px; ritmos principales de 12, 16, 24 y 32 px.
- Radios: 12 px en controles, 16 px en tarjetas internas, 18–22 px en bloques principales.
- Sombras: cálidas, difusas y muy sutiles; no usar sombras grises duras.
- Iconografía: lineal, compacta y consistente; siempre acompañada de texto cuando representa una acción esencial.
- Chips/pestañas: bordes redondeados completos; activo oscuro o coral, inactivos claros con borde discreto.

### Implementación de estilos

Todo el frontend usa **Next.js + Tailwind CSS** desde este repositorio. Los tokens de esta sección se declaran como variables CSS semánticas y se exponen en el tema de Tailwind; los componentes deben consumir clases/tokens (`bg-surface`, `text-ink`, `bg-coral`, etc.) en vez de valores hexadecimales dispersos. Webflow Cloud solo entrega el deployment: no hay una segunda fuente de estilos ni contenido en Webflow Designer.

## Interacción y estados

| Elemento | Comportamiento esperado |
|---|---|
| `Generar plan` | Valida los tres datos, muestra carga breve y desplaza/enfoca el resultado generado. |
| Pestañas del plan | Cambian el contenido central sin perder el resumen del plan. |
| `Editar` | Permite ajustar cantidades, ítems y opcionales; recalcula subtotal y estado de presupuesto. |
| Filtros de cortes/recetas | Filtran la grilla manteniendo visible el filtro activo. |
| `+` de recetas | Añade el acompañamiento al plan y ofrece confirmación no intrusiva. |
| Carnicerías | Seleccionar una tarjeta resalta su pin; seleccionar un pin enfoca su tarjeta. La lista usa datos seed, no disponibilidad en tiempo real. |
| `Ver detalles` | Abre vista o panel del comercio con dirección, horario, precios y oferta. |
| `Compartir` | Comparte una URL con la representación serializada del plan actual; no crea cuenta ni historial persistente. |

Incluir estados de hover, foco visible, activo, carga, vacío y error. Los botones coral deben oscurecerse levemente al interactuar; los controles no deben depender solo del color para indicar selección.

## Responsive y accesibilidad

### Adaptación responsive

| Punto de quiebre | Composición |
|---|---|
| ≥ 1280 px | Tres columnas como la referencia; hero y formulario horizontal. |
| 768–1279 px | Dos columnas; resultado antes de contenido editorial; mapa debajo de la lista de locales si hace falta. |
| < 768 px | Una columna; hero compacto, formulario apilado, métricas en 1–2 filas, mapa debajo de carnicerías y grillas de 2 columnas o carrusel. |

En móvil, mantener el CTA de generar plan y la acción principal del resultado siempre accesibles. No reducir el texto por debajo de 14 px para contenido de lectura ni hacer áreas táctiles menores a 44 × 44 px.

### Checklist de calidad

- [ ] El contraste de texto sobre fotografía y fondos oscuros cumple WCAG AA.
- [ ] Todos los campos tienen `label` visible; los placeholders son ejemplos, no sustitutos de etiquetas.
- [ ] La navegación, pestañas, filtros, mapa y tarjetas funcionan con teclado y foco visible.
- [ ] Las imágenes de cortes, comidas y comercios tienen texto alternativo útil; los elementos decorativos se ocultan de lectores de pantalla.
- [ ] Precios, cantidades y horarios se expresan como texto seleccionable, no incrustados en imágenes.
- [ ] La jerarquía se conserva sin depender del orden visual de las tres columnas.

## Límites del MVP

La landing editorial y la experiencia funcional se implementan en Next.js + Tailwind CSS dentro de este repositorio y se despliegan exclusivamente en Webflow Cloud. Este diseño debe representar únicamente los comportamientos que se describen en [`mvp.md`](./mvp.md): datos de catálogo estáticos, plan temporal de sesión y recomendaciones de IA estructuradas.

Quedan fuera de esta versión: login, base de datos, administración de contenidos, historial de planes, precios u ofertas en tiempo real y compra/reserva en carnicerías. Las imágenes, el proveedor LLM y el token/estilo final de Mapbox deben definirse antes de desarrollo visual definitivo.

## Alcance de la referencia

Este documento describe la apariencia y los comportamientos observables de [`design.PNG`](./design.PNG), adaptados al alcance del MVP. Para decisiones de producto, arquitectura, datos y criterios de entrega, consultar [`mvp.md`](./mvp.md).
