// Utilidades
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

// Año dinámico si existe #year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Resaltar enlace activo en el nav
(function highlightActive(){
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-inner a').forEach(a => {
    const href = a.getAttribute('href');
    const same = href === path || (path === 'index.html' && href === 'faq.html');
    if (same) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });
})();

// Buscador de FAQ (solo si existe #q)
(function faqSearch(){
  const q = $('#q');
  const info = $('#resultsInfo');
  const faqItems = $$('#faqList details.faq');
  if (!q || !faqItems.length) return;
  const filterFAQ = () => {
    const term = q.value.trim().toLowerCase();
    let visible = 0;
    faqItems.forEach(d => {
      const hay = (d.textContent + ' ' + (d.dataset.tags || '')).toLowerCase();
      const show = !term || hay.includes(term);
      d.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (info) info.textContent = term ? `${visible} resultado${visible !== 1 ? 's' : ''} para “${term}”` : 'Mostrando todas las preguntas';
  };
  q.addEventListener('input', filterFAQ);
  // Abrir detalle por hash si apunta a <details>
  if (location.hash) {
    try { const el = document.querySelector(location.hash); if (el && el.tagName.toLowerCase()==='details') el.setAttribute('open',''); } catch(_){}
  }
})();
/*
// Redirección por idioma manteniendo value=es/en (para el CSS de bandera)
(function(){
  const sel = document.getElementById('lang');
  if (!sel) return;

  // Ajusta el estado inicial del selector según el archivo actual
  const file = location.pathname.split('/').pop() || 'faq.html';
  sel.value = file.includes('-en.html') ? 'en' : 'es';

  sel.addEventListener('change', () => {
    const dir  = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
    let target = file;

    if (sel.value === 'en') {
      // Ir a versión inglesa del archivo actual
      target = file.endsWith('-en.html') ? file : file.replace(/\.html$/, '-en.html');
    } else {
      // Volver a versión española
      target = file.replace('-en.html', '.html');
    }
    location.href = dir + target;
  });
})();
*/

/**
 * Inicializa el selector de idioma (#lang) para redirigir a la versión ES/EN de la página actual.
 * - Mantiene value=es/en (útil para CSS de banderas).
 * - Añade/elimina el sufijo "-en" antes de ".html" por defecto.
 * - Permite mapear excepciones (por ejemplo, index.html → faq.html / faq-en.html).
 *
 * @param {Object} options
 * @param {string} [options.selector="#lang"]  Selector del <select>
 * @param {string} [options.suffix="-en"]      Sufijo para la versión EN
 * @param {Object} [options.map={}]            Mapa opcional { "archivo.html": {es:"...", en:"..."} }
 */
function initLangRedirect(options = {}) {
  const {
    selector = '#lang',
    suffix = '-en',
    map = {}
  } = options;

  const sel = document.querySelector(selector);
  if (!sel) return;

  const path = location.pathname;
  const file = path.split('/').pop() || '';                  // p.ej. "faq.html"
  const dir  = path.slice(0, path.lastIndexOf('/') + 1);     // p.ej. "/help/"
  const qs   = location.search || '';
  const hash = location.hash || '';

  // Determina si estamos en EN por nombre de archivo
  const isEn = file.includes(`${suffix}.html`);

  // Sincroniza el select al cargar
  sel.value = isEn ? 'en' : 'es';

  // Devuelve el destino según mapa de excepciones o regla general
  function resolveTarget(lang){
    // 1) Si hay mapeo explícito para este archivo, úsalo
    const m = map[file];
    if (m && (lang === 'en' ? m.en : m.es)) {
      return m[lang];
    }

    // 2) Si NO hay mapeo, aplica regla general "-en" antes de ".html"
    //    - "faq.html"   -> "faq-en.html" (EN)
    //    - "faq-en.html"-> "faq.html"    (ES)
    //    - "precios.html" <-> "precios-en.html"
    if (!file) {
      // Si no hay archivo (ej: /), permite definir un fallback vía map[""] si quieres.
      const rootMap = map[''];
      if (rootMap) return lang === 'en' ? rootMap.en : rootMap.es;
      // Por defecto, redirige a faq*.html si no hay archivo
      return lang === 'en' ? 'faq-en.html' : 'faq.html';
    }

    if (lang === 'en') {
      return file.endsWith('.html') && !file.includes(`${suffix}.html`)
        ? file.replace(/\.html$/, `${suffix}.html`)
        : file; // ya está en EN
    } else {
      return file.replace(`${suffix}.html`, '.html'); // vuelve a ES
    }
  }

  sel.addEventListener('change', () => {
    const lang = sel.value.toLowerCase() === 'en' ? 'en' : 'es';
    const target = resolveTarget(lang);
    // Si ya estamos en la URL correcta, no hagas nada
    if (target === file) return;
    location.href = dir + target + qs + hash;
  });
}

// ——— Actívalo una vez y te sirve para todas las páginas ———
initLangRedirect({
  // Ejemplos de excepciones (opcional): descomenta/ajusta si las necesitas
  // map: {
  //   'index.html': { es: 'faq.html', en: 'faq-en.html' },
  //   'precios.html': { es: 'precios.html', en: 'precios-en.html' },
  //   '': { es: 'faq.html', en: 'faq-en.html' } // cuando la URL es solo "/"
  // }
});
