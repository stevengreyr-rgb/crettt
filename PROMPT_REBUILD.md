Actúa como un equipo de élite de 3 personas: Director Creativo de una agencia que cobra $10,000+ por sitio, Diseñador UI/UX senior (referencias: Porsche, Brabus, HRE Wheels, Vossen, Rolls-Royce Motor Cars, Aston Martin, Apple) y Front-end Engineer obsesionado con performance y accesibilidad.

# MISIÓN
Reconstruye TODO mi sitio web de Maxi Motor (tienda/taller de rines de lujo, suspensión de rendimiento y fitment a medida, enfocado en camionetas lifted tipo GMC Sierra y Chevrolet Silverado, además de autos). Usa TODO lo que ya existe (secciones, contenido, estructura, formularios, imágenes) y llévalo a un nivel 10 veces superior: que se sienta una marca de lujo automotriz de $10k dólares, no una plantilla. Nada genérico. Cada pixel, cada palabra y cada animación deben ser deliberados.

# STACK (no lo cambies)
HTML + CSS + JS vanilla, sin build step ni framework. Archivos: `index.html`, `css/styles.css`, `js/main.js`. Lenis por CDN solo como mejora opcional de scroll (si falla, scroll nativo). Fuentes de Google Fonts con fallback. Entrégame los 3 archivos COMPLETOS, listos para pegar, sin "…resto igual". Si algo es muy largo, divídelo en partes numeradas pero nunca resumas código.

# LO QUE YA EXISTE (conserva la función, mejora todo lo demás)
Sitio de una página con nav por anclas. Orden actual: Header (logo MAXI·MOTOR, nav Home/Rims/Suspension/Services/Gallery/About/Contact, botones Call y WhatsApp, menú móvil off-canvas) → Hero (foto de GMC Sierra lifted, "BUILT TO STAND OUT.", CTA Get a Quote / View Our Work) → 01 Services (4 tarjetas) → 02 Rims (Forged / Monoblock / Multi-Piece) → 03 Suspension (Lowered / Air / Coilovers / Custom) → 04 Fitment (form Año/Marca/Modelo + chips Wheels/Suspension/Both que pasa los datos al form de cotización) → 05 Gallery (8 tiles masonry + lightbox) → Before/After (slider arrastrable) → 06 Why Maxi Motor (4 puntos) → Recent Builds (3 tarjetas) → Final CTA (foto Silverado) → 07 Contact/Quote (form con nombre, teléfono, email, vehículo, servicio, mensaje, subida de fotos + info de contacto, redes, mapa) → Footer → barra sticky móvil (Call / WhatsApp / Get Quote).
Paleta actual: negro/carbón/grafito con un solo acento champagne-gold (#c6a15b, claro #ddc088). Tipografía: Oswald (display) + Inter (body). Siempre en modo oscuro (decisión de marca).
Imágenes reales actuales: hero y final CTA (URLs de cloudfront). Todo lo demás son placeholders grises (`.img-placeholder`).

# 1) REESCRIBE TODOS LOS TEXTOS (copy en inglés, mercado US, tono lujo silencioso)
Cambia absolutamente todo el copy. Reglas: frases cortas, seguras, sin adjetivos baratos ("best", "amazing", "top quality"), sin clichés de taller. Voz de marca tipo "private atelier": confiada, precisa, casi minimalista. Cada sección con kicker, titular, subtítulo y microcopy en botones. Dame por sección el copy final y úsalo en el HTML. Mínimo:
- Hero: 3 variantes de titular + subtítulo, y elige la mejor. Reemplaza "BUILT TO STAND OUT." por algo más memorable y propio de Maxi Motor. Añade una línea de prueba (ej. "Custom fitment. Precision installed.") y 3 mini-stats SOLO si son verificables; si no lo son, déjalos como `[COMPLETAR: dato real]`.
- Services, Rims, Suspension, Fitment, Gallery, Before/After, Why, Recent Builds, Final CTA, Contact, Footer, microcopy de formularios, mensajes de éxito/error, labels de accesibilidad, meta title/description/OG.
- Rims: reescribe nombres y descripciones de las series para que suenen a colección (nombres con carácter, specs en formato técnico: diámetro, offset, acabado, construcción). Son categorías ilustrativas, así que mantenlas marcadas como tales; no inventes precios, modelos reales de otras marcas ni compatibilidades.
- Botones: reemplaza "Get a Quote / View Our Work / Request Fitment / Talk to an Expert" por CTAs más específicos y elegantes (ej. "Start Your Build", "Configure Fitment", "Private Consultation").

# 2) REPOSICIONA SECCIONES Y TARJETAS (nuevo layout, no solo restyling)
Reordena para conversión de lujo: Hero → franja de credibilidad/marcas (solo si hay logos reales; si no, omítela) → Rims como protagonista (va ANTES de Services porque es el producto estrella) → Suspension → Fitment como "configurador" destacado → Process (nueva sección: Consult → Spec → Source → Install → Handover, 5 pasos, usa solo lo que se puede afirmar) → Gallery/Recent Builds fusionados en una sola sección editorial → Before/After → Why Maxi Motor → Contact. Services se convierte en una lista editorial numerada de alto contraste, no en 4 tarjetas iguales.
Para cada sección dime en una tabla breve: posición anterior → posición nueva → por qué.
Tarjetas: rompe la monotonía de grids iguales. Usa composiciones asimétricas, una tarjeta "hero" grande por sección con las demás en escala menor, imágenes a sangre con texto superpuesto en gradiente, números de índice grandes tipo (01/02/03), líneas finas doradas, y tarjetas con hover que revelan specs y CTA. Rims: 1 tarjeta vertical gigante + 2 apiladas, o carrusel horizontal con scroll-snap. Suspension: 4 mosaicos de alturas distintas con hover de zoom lento. Why: columnas con números enormes en outline y línea divisoria.

# 3) SISTEMA DE DISEÑO PREMIUM (reemplaza styles.css completo)
- Color: mantén negro/carbón y el oro champagne como único acento, pero refínalo: define tokens con 3 niveles de superficie, gradiente sutil metálico para el oro (nunca amarillo plano), texto en blanco cálido con 3 niveles de opacidad, bordes de 1px a baja opacidad. Grano/noise MUY sutil de fondo y viñeteado. Cero colores extra.
- Tipografía: sube la jerarquía. Display enorme con `clamp()`, tracking amplio en kickers en mayúsculas pequeñas, serif editorial opcional para frases destacadas (p. ej. Cormorant Garamond o Playfair en cursiva para una palabra clave de cada titular) combinada con una grotesca moderna. Propón el par final y justifica en 1 línea. Mantén fallbacks.
- Espaciado: escala de 8px, secciones con `padding-block` generosos (clamp 96–200px), mucho aire negativo. Ancho de contenedor refinado y grid de 12 columnas con alineación consistente.
- Botones: primario con relleno oro metálico y micro-brillo al hover, secundario outline con línea que se dibuja, flecha que se desplaza. Foco accesible visible. Altura 52–56px, radio pequeño o recto (el lujo no usa pills).
- Header: transparente sobre hero, al scroll glass blur oscuro con borde inferior fino, logo con monograma refinado (reemplaza el círculo actual por un monograma SVG de "M" propio), nav con subrayado dorado animado, indicador de sección activa (IntersectionObserver), CTA único destacado "Start Your Build". Call/WhatsApp pasan a iconos discretos.
- Cursor y detalles: cursor personalizado sutil solo en desktop con puntero fino, líneas de regla finas entre secciones, etiquetas técnicas tipo "FIG. 01", coordenadas/medidas decorativas en monospace pequeño (solo decorativas, sin datos falsos).
- Imágenes: aspect-ratios consistentes, `object-fit: cover`, overlay en gradiente, esquinas rectas, bordes de 1px. Define un tratamiento de imagen único (leve desaturación + contraste + tinte cálido) para que fotos de distintas fuentes se vean cohesionadas.

# 4) MOVIMIENTO (premium, con control y sin exceso)
Antes el sitio era deliberadamente sin animaciones; ahora sí quiero motion de alto nivel, pero con `prefers-reduced-motion` respetado al 100% y SIN contenido oculto si JS falla (usa la clase `.js` ya presente en `<html>` para activar estados iniciales). Incluye:
- Hero: entrada escalonada de titular por líneas (máscara con translateY), zoom lento tipo Ken Burns de la foto, indicador de scroll animado.
- Reveal al hacer scroll con IntersectionObserver (fade + 24px de desplazamiento, stagger de 80ms), una sola vez.
- Parallax suave en imágenes grandes (transform, no top/left), contadores animados solo para stats reales.
- Hover de tarjetas: zoom 1.04 en 900ms con la curva `cubic-bezier(.16,1,.3,1)`, reveal de specs, línea dorada que crece.
- Marquee lento de texto grande en outline entre secciones (ej. "FORGED · MONOBLOCK · MULTI-PIECE · AIR · COILOVER").
- Transición de página de carga: preloader mínimo de ≤900ms con el monograma (que no bloquee el LCP).
- Before/After con handle magnético y etiqueta que sigue al cursor. Lightbox con navegación prev/next por flechas y swipe, contador "03 / 08", transición cruzada.
Todo con `transform`/`opacity`, 60fps, sin layout thrash.

# 5) FORMULARIOS Y CONVERSIÓN
- Fitment: conviértelo en un configurador de 3 pasos visual (Vehicle → Interest → Style) con barra de progreso, selects estilizados, chips grandes con icono, y resumen en vivo "Your build" que se vea premium. Al enviar, pasa los datos al form de cotización como ya lo hace, con scroll suave y foco.
- Quote form: labels flotantes, validación inline elegante (no el tooltip del navegador), estados de error/éxito con tono de marca, drop-zone de fotos con previews en miniatura y botón de quitar, botón con estado de carga. Deja el `fetch()` preparado y comentado para Formspree/Netlify (`name="quote-request"`) con `TODO` claro; NO finjas que el envío funciona en backend.
- CTA sticky móvil rediseñada (glass, safe-area-inset-bottom), y en desktop una cinta de CTA que aparece tras pasar el hero.
- Social proof: NO inventes reseñas, nombres de clientes, números de proyectos ni logos. Crea el componente de testimonios y de stats ya diseñado pero con contenido `[COMPLETAR]` y comentario `<!-- REAL CONTENT REQUIRED -->`.

# 6) IMÁGENES Y PLACEHOLDERS
Rediseña `.img-placeholder` para que, mientras falten fotos, se vea como un "empty state" de lujo (gradiente carbón, retícula fina, etiqueta técnica pequeña con la descripción de la foto que debe ir ahí, relación de aspecto indicada). Para CADA placeholder escribe un shot-list: qué foto va, ángulo, lente, iluminación, hora del día y resolución mínima. Conserva las dos fotos reales actuales (hero y final CTA) y recomiéndame cómo recortarlas y hostearlas localmente en `assets/img/` (no depender del CDN). Usa `<picture>`, `srcset`, `loading="lazy"`, `decoding="async"` y dimensiones explícitas para evitar CLS.

# 7) RESPONSIVE, ACCESIBILIDAD, SEO, PERFORMANCE
- Mobile-first real: probado a 375/390/768/1024/1440/1920. Menú móvil a pantalla completa con links enormes y animación escalonada. Tipografía fluida con `clamp()`. Gestos naturales en carrusel (scroll-snap).
- A11y: contraste AA mínimo (verifica oro sobre negro y texto muted), foco visible, skip link, roles/aria correctos, `aria-live` en formularios, lightbox con focus trap y Escape, tamaño táctil ≥44px.
- SEO: title y meta description reescritos, Open Graph/Twitter completos, JSON-LD `AutoRepair`/`LocalBusiness` con campos reales marcados `[COMPLETAR]`, jerarquía h1–h3 correcta, alt descriptivos.
- Performance: sin librerías nuevas salvo que justifiques una; CSS crítico limpio, fuentes con `font-display: swap` y preconnect, JS ≤ 15KB sin minificar si es posible, objetivo Lighthouse 95+.

# 8) LO QUE NO DEBES HACER
- No inventes datos: teléfono, WhatsApp, email, dirección, horarios, reseñas, precios, años de experiencia, cantidad de proyectos, marcas aliadas ni compatibilidades. Usa los placeholders actuales (`+10000000000`, `info@maximotor.example`, etc.) o `[COMPLETAR]`.
- No uses emojis, stock clichés de "engranajes y llaves", gradientes morados/azules, glassmorphism exagerado ni sombras gruesas.
- No cambies el stack ni agregues frameworks. No rompas las anclas existentes (#home, #rims, #suspension, #services, #fitment, #gallery, #before-after, #why, #builds, #contact) y mantén los IDs que usa `main.js` o actualiza el JS en consecuencia.
- No me des respuestas genéricas ni "sugerencias": dame el código final.

# FORMATO DE ENTREGA (en este orden)
1. Concepto creativo en 5 líneas (idea central, tono, 3 principios visuales).
2. Tabla de cambios por sección: antes → después (layout, copy, estilo).
3. Sistema de diseño: tokens, tipografía, espaciados, botones.
4. Copy final completo por sección.
5. `index.html` completo.
6. `css/styles.css` completo.
7. `js/main.js` completo.
8. Shot-list de fotos para cada placeholder.
9. Checklist de lanzamiento: qué datos reales reemplazar y dónde (buscar y reemplazar).
10. Lista de 10 mejoras futuras priorizadas por impacto en ventas.

Antes de escribir código, haz una autocrítica de 5 puntos del sitio actual (qué lo hace ver amateur) y asegúrate de que tu versión resuelva cada uno. Si algo es ambiguo, toma la decisión de diseño más premium y avísame en una línea, no me hagas preguntas.
