// ==========================================================
// LumosCam - Filtros (Store + Detalhes em Modal)
// ==========================================================

// 1. DADOS SIMULADOS (Agora com descrição e exemplos de uso)
const COMMUNITY = [
  { 
    id: 'c1', name: 'Analog Tokyo', author: '@fotomaster', downloads: '12k', rating: 4.8, 
    imageUrl: 'https://images.unsplash.com/photo-1583324961572-9f4afd9ffee6?w=400',
    desc: 'Traz o charme nostálgico das câmeras analógicas japonesas. Cores levemente desbotadas, contraste suave e tons quentes perfeitos para fotos urbanas.',
    examples: [
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400'
    ]
  },
  { 
    id: 'c2', name: 'Dark Moody', author: '@nightowl', downloads: '8.5k', rating: 4.9, 
    imageUrl: 'https://images.unsplash.com/photo-1453413453658-27fec8f43f29?w=400',
    desc: 'Reduz os realces e aprofunda as sombras para um visual escuro e cinematográfico. Excelente para fotos na natureza, florestas e dias nublados.',
    examples: [
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      'https://images.unsplash.com/photo-1422466654108-5e533f591881?w=400'
    ]
  },
  { 
    id: 'c3', name: 'Macro Detail', author: '@naturelens', downloads: '3.2k', rating: 4.5, 
    imageUrl: 'https://images.unsplash.com/photo-1620062317671-ef6441546d7d?w=400',
    desc: 'Foca em ressaltar a nitidez, textura e as micro-cores. A Inteligência Artificial ajusta a vinheta e o micro-contraste para destacar o centro.',
    examples: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
      'https://images.unsplash.com/photo-1601296656710-f1c5c4bbd5e2?w=400',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400'
    ]
  },
  { 
    id: 'c4', name: 'Golden Film', author: '@filmkid', downloads: '6.1k', rating: 4.7, 
    imageUrl: 'https://images.unsplash.com/photo-1422466654108-5e533f591881?w=400',
    desc: 'Simula o horário dourado (Golden Hour) em qualquer foto. Adiciona um aspecto alaranjado, grão de filme clássico e um brilho difuso nas luzes altas.',
    examples: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=400',
      'https://images.unsplash.com/photo-1414441551608-f1c5c4bbd5e2?w=400'
    ]
  }
];

// Lógica para salvar filtros localmente
let downloadedPresets = JSON.parse(localStorage.getItem('downloadedPresets')) || [];

// Elementos Globais
const listContainer = document.getElementById('community-list');
const toastEl = document.getElementById('storeToast');
const toastMsg = document.getElementById('toastMsg');

// Elementos da Modal
const modal = document.getElementById('filterModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const btnCloseModal = document.getElementById('closeModalBtn');
let currentModalFilter = null;

// ==========================================
// FUNÇÕES DE TOAST E DOWNLOAD
// ==========================================
function showToast(text) {
  toastMsg.textContent = text;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function handleDownload(preset) {
  if (!downloadedPresets.includes(preset.id)) {
    downloadedPresets.push(preset.id);
    localStorage.setItem('downloadedPresets', JSON.stringify(downloadedPresets));
    showToast(`${preset.name} adicionado!`);
    renderList(); 
    
    // Se a modal estiver aberta, atualiza o botão lá dentro também
    if (currentModalFilter && currentModalFilter.id === preset.id) {
      updateModalDownloadBtn(true);
    }
  }
}

// ==========================================
// FUNÇÕES DA MODAL
// ==========================================
function openModal(item) {
  currentModalFilter = item;
  const isDownloaded = downloadedPresets.includes(item.id);

  // Preenche Textos e Imagem Principal
  document.getElementById('modalIcon').src = item.imageUrl;
  document.getElementById('modalTitle').textContent = item.name;
  document.getElementById('modalAuthor').textContent = item.author;
  document.getElementById('modalRating').textContent = item.rating;
  document.getElementById('modalDownloads').textContent = `${item.downloads} downloads`;
  document.getElementById('modalDesc').textContent = item.desc;

  // Preenche a Galeria de Exemplos
  const gallery = document.getElementById('modalGallery');
  gallery.innerHTML = item.examples.map(url => `
    <img src="${url}" class="w-32 h-40 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100 snap-start">
  `).join('');

  // Configura botão de download dentro da modal
  updateModalDownloadBtn(isDownloaded);

  const btnDownloadModal = document.getElementById('modalDownloadBtn');
  // Remove eventos anteriores clonando o botão
  const newBtn = btnDownloadModal.cloneNode(true);
  btnDownloadModal.parentNode.replaceChild(newBtn, btnDownloadModal);
  
  if (!isDownloaded) {
    newBtn.addEventListener('click', () => handleDownload(item));
  }

  // Mostra a modal e inicia as animações do Tailwind
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Timeout rápido apenas para garantir que a classe 'hidden' saia antes da transição
  setTimeout(() => {
    modalOverlay.classList.remove('opacity-0');
    modalOverlay.classList.add('opacity-100');
    modalContent.classList.remove('translate-y-full');
    modalContent.classList.add('translate-y-0');
  }, 10);
  
  lucide.createIcons();
}

function closeModal() {
  currentModalFilter = null;
  // Recolhe e esconde as animações
  modalOverlay.classList.remove('opacity-100');
  modalOverlay.classList.add('opacity-0');
  modalContent.classList.remove('translate-y-0');
  modalContent.classList.add('translate-y-full');
  
  // Aguarda a animação acabar (300ms) para esconder a div de verdade
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
}

function updateModalDownloadBtn(isGot) {
  const btn = document.getElementById('modalDownloadBtn');
  if (isGot) {
    btn.className = "w-full mt-6 rounded-2xl p-4 font-bold text-[15px] shadow-md flex items-center justify-center gap-2 bg-slate-100 text-emerald-600 cursor-default";
    btn.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> Já salvo na biblioteca`;
  } else {
    btn.className = "w-full mt-6 rounded-2xl p-4 font-bold text-[15px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-blue-600 text-white";
    btn.innerHTML = `<i data-lucide="download" class="w-5 h-5"></i> Adicionar Filtro`;
  }
}

// Eventos de fechar a modal
btnCloseModal.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// ==========================================
// RENDERIZAÇÃO DA LISTA PRINCIPAL
// ==========================================
function renderList() {
  listContainer.innerHTML = '';

  COMMUNITY.forEach(item => {
    const got = downloadedPresets.includes(item.id);

    const card = document.createElement('div');
    // Adicionei 'cursor-pointer hover:bg-slate-50' para mostrar que o card é clicável
    card.className = 'flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors';

    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-slate-900 font-semibold truncate text-[15px]">${item.name}</p>
        <p class="text-xs text-blue-600 font-medium">${item.author}</p>
        <div class="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span class="flex items-center gap-1 font-medium">
            <i data-lucide="star" class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></i>
            ${item.rating}
          </span>
          <span>${item.downloads} downloads</span>
        </div>
      </div>
      <button
        class="download-btn z-10 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
          got ? 'bg-slate-100 text-emerald-500' : 'bg-blue-600 text-white shadow-md'
        }"
        ${got ? 'disabled' : ''}
      >
        <i data-lucide="${got ? 'check' : 'download'}" class="w-5 h-5"></i>
      </button>
    `;

    // Clicar no corpo do Card abre a modal
    card.addEventListener('click', () => openModal(item));

    // Clicar no Botão de Download isola o clique (não abre a modal, apenas baixa)
    const btn = card.querySelector('.download-btn');
    if (!got) {
      btn.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede o clique de vazar pro card e abrir a modal
        handleDownload(item);
      });
    } else {
      // Mesmo se já tiver baixado, evita abrir a modal se o usuário clicar exatamente no botão verde
      btn.addEventListener('click', (e) => e.stopPropagation());
    }

    listContainer.appendChild(card);
  });

  lucide.createIcons();
}

// Inicia
renderList();