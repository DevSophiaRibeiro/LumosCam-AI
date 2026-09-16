// ==========================================================
// LumosCam - Galeria
// Dados e lógica de filtro, baseados no GalleryView.tsx
// e no AppContext.tsx (styleToFilter) do projeto original no Figma
// ==========================================================

const SEED = [
  { id: 's1', url: 'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=400', category: 'Retratos',  style: { brightness: 105, contrast: 102, saturation: 95,  warmth: 8,   vignette: 0.2 } },
  { id: 's2', url: 'https://images.unsplash.com/photo-1422466654108-5e533f591881?w=400', category: 'Paisagens', style: { brightness: 102, contrast: 110, saturation: 115, warmth: 2,   vignette: 0   } },
  { id: 's3', url: 'https://images.unsplash.com/photo-1453413453658-27fec8f43f29?w=400', category: 'Noturno',   style: { brightness: 115, contrast: 115, saturation: 90,  warmth: -10, vignette: 0.4 } },
  { id: 's4', url: 'https://images.unsplash.com/photo-1620062317671-ef6441546d7d?w=400', category: 'Macro',     style: { brightness: 100, contrast: 110, saturation: 120, warmth: 0,   vignette: 0.1 } },
  { id: 's5', url: 'https://images.unsplash.com/photo-1583324961572-9f4afd9ffee6?w=400', category: 'Vintage',   style: { brightness: 95,  contrast: 95,  saturation: 80,  warmth: 25,  vignette: 0.3 } },
];

// Mesma função styleToFilter do AppContext.tsx original
function styleToFilter(s) {
  const sepia = Math.max(0, s.warmth);
  const hue = s.warmth < 0 ? s.warmth : 0;
  return `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
}

const filtersEl = document.getElementById('filters');
const grid = document.getElementById('gallery-grid');
const emptyMsg = document.getElementById('empty-msg');

const categories = ['Tudo', ...Array.from(new Set(SEED.map(p => p.category)))];
let activeCat = 'Tudo';

function renderChips() {
  filtersEl.innerHTML = '';
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.className = `px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
      activeCat === c ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
    }`;
    btn.addEventListener('click', () => {
      activeCat = c;
      renderChips();
      renderGrid();
    });
    filtersEl.appendChild(btn);
  });
}

function renderGrid() {
  currentPhotos = activeCat === 'Tudo' ? SEED : SEED.filter(p => p.category === activeCat);
  grid.innerHTML = '';

  if (currentPhotos.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  currentPhotos.forEach((p, index) => {
    const filterCss = styleToFilter(p.style);
    const item = document.createElement('div');
    item.className = 'gallery-item aspect-square bg-slate-100 overflow-hidden';
    item.style.setProperty('--vig', `rgba(0,0,0,${p.style.vignette * 0.6})`);
    item.innerHTML = `<img src="${p.url}" alt="" loading="lazy" class="w-full h-full object-cover" style="filter:${filterCss}" />`;
    item.addEventListener('click', () => openLightbox(index));
    grid.appendChild(item);
  });
}

// ===== Lightbox: abrir foto ampliada, com navegação entre fotos =====
let currentPhotos = [];
let currentIndex = 0;

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCategory = document.getElementById('lightbox-category');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

function showPhoto(index) {
  currentIndex = index;
  const photo = currentPhotos[currentIndex];
  lightboxImg.src = photo.url.replace('w=400', 'w=1200');
  lightboxImg.style.filter = styleToFilter(photo.style);
  lightboxCategory.textContent = photo.category;
}

function openLightbox(index) {
  showPhoto(index);
  lightbox.classList.remove('hidden');
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
}

function showNext() {
  showPhoto((currentIndex + 1) % currentPhotos.length);
}

function showPrev() {
  showPhoto((currentIndex - 1 + currentPhotos.length) % currentPhotos.length);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

renderChips();
renderGrid();
