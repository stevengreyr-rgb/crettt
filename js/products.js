/* ==========================================================================
   CATÁLOGO — edita aquí tus productos, precios y links.
   - price:    número (se formatea solo). Los precios actuales son EJEMPLOS.
   - payLink:  (opcional) link de pago directo (Stripe, MercadoPago, PayPal.me…).
               Si lo dejas vacío, el botón "Pedir link de pago" abre WhatsApp
               con el mensaje ya escrito para que tú envíes el link.
   - image:    (opcional) URL de foto. Sin foto se muestra un recuadro.
   - url:      (opcional) página con más detalles del producto.
   ========================================================================== */
window.CATALOG_CONFIG = {
  whatsapp: '10000000000',      // número con código de país, sin + ni espacios
  currency: 'USD',
  locale: 'es-US'
};

window.PRODUCTS = [
  { id: 'rim-forged-20', category: 'rines', name: 'Rin forjado 20" Monoblock',
    desc: 'Juego de 4 · aluminio forjado · acabado negro/oro.', price: 3200, image: '', url: '', payLink: '' },
  { id: 'rim-flow-19', category: 'rines', name: 'Rin Flow-Form 19" Sport',
    desc: 'Juego de 4 · ligero y resistente · varios offsets.', price: 1450, image: '', url: '', payLink: '' },
  { id: 'rim-lux-22', category: 'rines', name: 'Rin Luxury 22" Multi-Spoke',
    desc: 'Juego de 4 · para SUV y camionetas.', price: 3900, image: '', url: '', payLink: '' },
  { id: 'susp-coil', category: 'suspension', name: 'Coilovers ajustables',
    desc: 'Altura y amortiguación regulables · juego completo.', price: 1800, image: '', url: '', payLink: '' },
  { id: 'susp-air', category: 'suspension', name: 'Kit suspensión de aire',
    desc: 'Control de altura con app · incluye compresor.', price: 4600, image: '', url: '', payLink: '' },
  { id: 'susp-springs', category: 'suspension', name: 'Resortes rebajados',
    desc: 'Baja 30–40 mm · mejor postura sin perder confort.', price: 420, image: '', url: '', payLink: '' },
  { id: 'srv-install', category: 'servicios', name: 'Instalación + balanceo',
    desc: 'Montaje profesional de rines y llantas.', price: 160, image: '', url: '', payLink: '' },
  { id: 'srv-align', category: 'servicios', name: 'Alineación de precisión',
    desc: 'Alineación 4 ruedas después de modificar suspensión.', price: 120, image: '', url: '', payLink: '' }
];
