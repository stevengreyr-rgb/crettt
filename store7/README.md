# Store 7 — despliegue

Estructura:
```
index.html            landing (botones de pago -> Stripe)
gracias.html          página privada de entrega (verifica el pago)
terminos|privacidad|reembolsos.html   plantillas legales (revísalas)
api/entrega.js        función serverless: valida el pago con Stripe
api/_suppliers.js     TUS 10 PROVEEDORES (privado, edítalo)
.env.example          variables de entorno
```

## Pasos
1. Edita `api/_suppliers.js` con tus 10 proveedores (5 + 5) y `TU_EMAIL@dominio.com` en los HTML.
2. Stripe > Payment Links: crea dos enlaces (USD 12 y USD 25, pago único).
   En cada uno: *Después del pago > No mostrar página de confirmación > Redirigir a tu sitio web*:
   `https://TU-DOMINIO/gracias.html?session_id={CHECKOUT_SESSION_ID}`
3. Copia el URL `https://buy.stripe.com/...` de cada link y sustituye `REEMPLAZA_LINK_SECCION_1/2` en `index.html` (3 sitios cada uno).
4. Copia el ID de cada link (`plink_...`, en la URL del dashboard) a las variables de entorno.
5. Despliega en Vercel (importa la carpeta/repo, sin configuración de build). Añade las variables de `.env.example`. Redespliega.
6. Prueba primero con claves y links en modo test (tarjeta 4242 4242 4242 4242) y luego pasa a live.

La clave secreta de Stripe NUNCA va en el HTML: solo en variables de entorno.
