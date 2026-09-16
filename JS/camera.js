lucide.createIcons();

/* ========================================================
   Dados equivalentes ao AppContext.tsx / CameraView.tsx
   (convertidos de React+TS para JS puro)
   ======================================================== */

const SCENES = ['portrait','landscape','night','macro','vintage','food'];

const SCENE_PREVIEWS = {
  auto:      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
  portrait:  'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=800',
  landscape: 'https://images.unsplash.com/photo-1422466654108-5e533f591881?w=800',
  night:     'https://images.unsplash.com/photo-1453413453658-27fec8f43f29?w=800',
  macro:     'https://images.unsplash.com/photo-1620062317671-ef6441546d7d?w=800',
  vintage:   'https://images.unsplash.com/photo-1583324961572-9f4afd9ffee6?w=800',
  food:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
};

function defaultStyle(){ return { brightness:100, contrast:100, saturation:100, warmth:0, vignette:0 }; }

const SCENE_META = {
  auto:      { label:'Auto',     icon:'sparkles',           style: defaultStyle() },
  portrait:  { label:'Retrato',  icon:'user',               style:{ brightness:105, contrast:102, saturation:95,  warmth:8,   vignette:0.2 } },
  landscape: { label:'Paisagem', icon:'mountain',           style:{ brightness:102, contrast:110, saturation:115, warmth:2,   vignette:0   } },
  night:     { label:'Noturno',  icon:'moon',               style:{ brightness:115, contrast:115, saturation:90,  warmth:-10, vignette:0.4 } },
  macro:     { label:'Macro',    icon:'flower-2',           style:{ brightness:100, contrast:110, saturation:120, warmth:0,   vignette:0.1 } },
  vintage:   { label:'Vintage',  icon:'film',               style:{ brightness:95,  contrast:95,  saturation:80,  warmth:25,  vignette:0.3 } },
  food:      { label:'Comida',   icon:'utensils-crossed',   style:{ brightness:105, contrast:105, saturation:115, warmth:10,  vignette:0.1 } },
};

function styleToFilter(s){
  return `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%) sepia(${Math.max(0,s.warmth)}%) hue-rotate(${s.warmth < 0 ? s.warmth : 0}deg)`;
}

/* ========================================================
   Estado (equivalente ao useState/useContext do React)
   ======================================================== */
const state = {
  aiAssistantActive: true,
  cameraPermission: 'unknown',   // 'unknown' | 'granted' | 'denied'
  detectedScene: 'auto',
  sceneConfidence: 0,
  suggestedModes: ['portrait','landscape','night'],
  manualScene: null,
  showModes: false,
  learnedStyle: defaultStyle(),
};

let sceneIntervalId = null;

/* ========================================================
   Elementos DOM
   ======================================================== */
const permissionScreen = document.getElementById('permissionScreen');
const cameraScreen     = document.getElementById('cameraScreen');
const deniedMsg        = document.getElementById('deniedMsg');
const feedImg          = document.getElementById('feedImg');
const vignetteEl       = document.getElementById('vignette');
const flashEl          = document.getElementById('flash');
const aiToggle         = document.getElementById('aiToggle');
const aiSwitch         = document.getElementById('aiSwitch');
const sceneChipWrap    = document.getElementById('sceneChipWrap');
const modesSheet       = document.getElementById('modesSheet');
const modesRow         = document.getElementById('modesRow');
const captureToast     = document.getElementById('captureToast');
const captureToastImg  = document.getElementById('captureToastImg');
const infoToast        = document.getElementById('infoToast');

/* ========================================================
   Lógica
   ======================================================== */
function currentScene(){
  return state.manualScene ?? (state.aiAssistantActive ? state.detectedScene : 'auto');
}

function effectiveStyle(){
  const base = SCENE_META[currentScene()].style;
  const learned = state.learnedStyle;
  const blend = (a,b,w=0.3) => a*(1-w) + b*w;
  return {
    brightness: blend(base.brightness, learned.brightness),
    contrast:   blend(base.contrast,   learned.contrast),
    saturation: blend(base.saturation, learned.saturation),
    warmth:     blend(base.warmth,     learned.warmth),
    vignette:   base.vignette,
  };
}

function requestCameraPermission(){
  setTimeout(() => {
    state.cameraPermission = 'granted';
    render();
    startSceneDetection();
  }, 600);
}

function startSceneDetection(){
  clearInterval(sceneIntervalId);
  const tick = () => {
    if (state.cameraPermission !== 'granted' || !state.aiAssistantActive) return;
    const next = SCENES[Math.floor(Math.random()*SCENES.length)];
    state.detectedScene = next;
    state.sceneConfidence = 0.7 + Math.random()*0.3;
    const others = SCENES.filter(s => s !== next).sort(() => Math.random()-0.5).slice(0,2);
    state.suggestedModes = [next, ...others];
    render();
  };
  tick();
  sceneIntervalId = setInterval(tick, 4000);
}

function forceScene(s){
  state.manualScene = s;
  render();
}

function showCaptureToast(url){
  captureToastImg.src = url;
  captureToast.classList.add('show');
  setTimeout(() => captureToast.classList.remove('show'), 2200);
}

function showInfoToast(msg){
  infoToast.textContent = msg;
  infoToast.classList.add('show');
  setTimeout(() => infoToast.classList.remove('show'), 2000);
}

function handleCapture(){
  if (state.cameraPermission !== 'granted'){ requestCameraPermission(); return; }
  flashEl.classList.add('show');
  setTimeout(() => flashEl.classList.remove('show'), 180);

  const scene = currentScene();
  const url = SCENE_PREVIEWS[scene];

  // "aprende" o estilo usado (EMA), igual ao recordStyleUsage original
  const s = effectiveStyle();
  state.learnedStyle = {
    brightness: state.learnedStyle.brightness*0.7 + s.brightness*0.3,
    contrast:   state.learnedStyle.contrast*0.7   + s.contrast*0.3,
    saturation: state.learnedStyle.saturation*0.7 + s.saturation*0.3,
    warmth:     state.learnedStyle.warmth*0.7      + s.warmth*0.3,
    vignette:   state.learnedStyle.vignette*0.7    + s.vignette*0.3,
  };

  setTimeout(() => showCaptureToast(url), 180);
  // Em vez de navegar para a tela de Edição (feita por outro integrante da equipe),
  // mostramos o feedback de captura aqui mesmo.
}

function render(){
  // Alterna entre tela de permissão e tela de câmera
  if (state.cameraPermission !== 'granted'){
    permissionScreen.style.display = 'flex';
    cameraScreen.classList.remove('active');
    deniedMsg.style.display = state.cameraPermission === 'denied' ? 'block' : 'none';
    return;
  }
  permissionScreen.style.display = 'none';
  cameraScreen.classList.add('active');

  const scene = currentScene();
  const style = effectiveStyle();

  // Feed + filtro
  if (feedImg.dataset.scene !== scene){
    feedImg.dataset.scene = scene;
    feedImg.classList.remove('loaded');
    feedImg.src = SCENE_PREVIEWS[scene];
    feedImg.onload = () => feedImg.classList.add('loaded');
  }
  feedImg.style.filter = styleToFilter(style);
  vignetteEl.style.boxShadow = style.vignette > 0
    ? `inset 0 0 ${100 + style.vignette*200}px rgba(0,0,0,${style.vignette})`
    : 'none';

  // Toggle IA
  aiToggle.classList.toggle('on', state.aiAssistantActive);
  aiSwitch.classList.toggle('on', state.aiAssistantActive);

  // Chip de cena detectada
  sceneChipWrap.innerHTML = '';
  if (state.aiAssistantActive){
    const chip = document.createElement('div');
    chip.className = 'scene-chip';
    chip.innerHTML = `
      <i data-lucide="${SCENE_META[scene].icon}"></i>
      <span>${state.manualScene ? 'Modo' : 'Detectado'}: ${SCENE_META[scene].label}</span>
      ${!state.manualScene ? `<span class="confidence">${Math.round(state.sceneConfidence*100)}%</span>` : ''}
      ${state.manualScene ? `<button class="auto-btn" id="btnBackAuto">auto</button>` : ''}
    `;
    sceneChipWrap.appendChild(chip);
    lucide.createIcons();
    if (state.manualScene){
      document.getElementById('btnBackAuto').addEventListener('click', () => forceScene(null));
    }
  }

  // Sheet de modos
  modesSheet.classList.toggle('show', state.showModes);
  const extra = ['vintage','food','macro'].filter(s => !state.suggestedModes.includes(s));
  const allModes = [...state.suggestedModes, ...extra];
  modesRow.innerHTML = allModes.map(m => `
    <button class="mode-btn ${scene === m ? 'active' : ''}" data-mode="${m}">
      <i data-lucide="${SCENE_META[m].icon}"></i>
      <span>${SCENE_META[m].label}</span>
    </button>
  `).join('');
  lucide.createIcons();
  modesRow.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      forceScene(btn.dataset.mode);
      state.showModes = false;
      render();
    });
  });
}

/* ========================================================
   Eventos
   ======================================================== */
document.getElementById('btnAllow').addEventListener('click', requestCameraPermission);

aiToggle.addEventListener('click', () => {
  state.aiAssistantActive = !state.aiAssistantActive;
  render();
  if (state.aiAssistantActive) startSceneDetection();
});

document.getElementById('btnCapture').addEventListener('click', handleCapture);

document.getElementById('btnModes').addEventListener('click', () => {
  state.showModes = !state.showModes;
  document.getElementById('btnModes').classList.toggle('modes-open', state.showModes);
  render();
});

document.getElementById('closeModes').addEventListener('click', () => {
  state.showModes = false;
  document.getElementById('btnModes').classList.remove('modes-open');
  render();
});

document.getElementById('btnCopyStyle').addEventListener('click', () => {
  // Nesta tela isolada, simulamos a navegação para "Copiar estilo" (tela de outro integrante)
  showInfoToast('Abrindo "Copiar estilo"…');
});

/* Estado inicial */
render();
