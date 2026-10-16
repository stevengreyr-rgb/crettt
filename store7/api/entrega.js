// GET /api/entrega?session_id=cs_...
// Comprueba con Stripe que la sesión de pago está pagada y devuelve solo la sección comprada.
const data = require('./_suppliers');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const id = String((req.query && req.query.session_id) || '');
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) {
    return res.status(400).json({ error: 'session_id inválido' });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Falta STRIPE_SECRET_KEY' });

  let session;
  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, {
      headers: { Authorization: 'Bearer ' + key }
    });
    if (!r.ok) return res.status(404).json({ error: 'Pago no encontrado' });
    session = await r.json();
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo consultar Stripe' });
  }

  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'El pago no está completado' });
  }

  // Qué sección compró: por ID del Payment Link (recomendado) o, si no, por importe.
  const link = session.payment_link;
  let key1 = false, key2 = false;
  if (process.env.PAYMENT_LINK_SECCION_1 || process.env.PAYMENT_LINK_SECCION_2) {
    key1 = link && link === process.env.PAYMENT_LINK_SECCION_1;
    key2 = link && link === process.env.PAYMENT_LINK_SECCION_2;
  } else {
    key1 = session.amount_subtotal === 1200;
    key2 = session.amount_subtotal === 2500;
  }

  if (key1) return res.status(200).json({ secciones: [data.seccion1] });
  if (key2) return res.status(200).json({ secciones: [data.seccion2] });
  return res.status(403).json({ error: 'Producto no reconocido. Escríbenos con tu recibo de Stripe.' });
};
