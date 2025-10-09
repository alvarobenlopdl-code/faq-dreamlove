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