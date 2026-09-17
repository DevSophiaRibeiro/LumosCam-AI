
(function () {
  'use strict';

  var STORAGE_KEY = 'lumoscam_community_view_v1';


  function defaultStyle() {
    return { brightness: 100, contrast: 100, saturation: 100, warmth: 0, vignette: 0 };
  }

  function styleToFilter(s) {
    var warmthPositive = Math.max(0, s.warmth);
    var hue = s.warmth < 0 ? s.warmth : 0;
    return (
      'brightness(' + s.brightness + '%) ' +
      'contrast(' + s.contrast + '%) ' +
      'saturate(' + s.saturation + '%) ' +
      'sepia(' + warmthPositive + '%) ' +
      'hue-rotate(' + hue + 'deg)'
    );
  }

  function formatNumber(n) {
    try {
      return n.toLocaleString('pt-BR');
    } catch (e) {
      return String(n);
    }
  }

  var FEED_SEED = [
    {
      id: 'f1', author: 'Lia Mendes', avatar: 'https://i.pravatar.cc/100?img=47',
      type: 'preset', title: 'Compartilhei meu preset favorito',
      imageUrl: 'https://images.unsplash.com/photo-1422466654108-5e533f591881?w=600',
      likes: 1284, comments: 84, presetName: 'Lia Golden',
      style: { brightness: 108, contrast: 110, saturation: 115, warmth: 20, vignette: 0.25 }
    },
    {
      id: 'f2', author: 'Rafa Costa', avatar: 'https://i.pravatar.cc/100?img=12',
      type: 'photo', title: 'Noite chuvosa em SP',
      imageUrl: 'https://images.unsplash.com/photo-1453413453658-27fec8f43f29?w=600',
      likes: 902, comments: 41
    },
    {
      id: 'f3', author: 'Isa Ribeiro', avatar: 'https://i.pravatar.cc/100?img=32',
      type: 'preset', title: 'Pastel Suave — pra retratos',
      imageUrl: 'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=600',
      likes: 2210, comments: 168, presetName: 'Pastel Isa',
      style: { brightness: 110, contrast: 92, saturation: 80, warmth: 14, vignette: 0.18 }
    },
    {
      id: 'f4', author: 'Mateus Lima', avatar: 'https://i.pravatar.cc/100?img=15',
      type: 'photo', title: 'Macro do quintal',
      imageUrl: 'https://images.unsplash.com/photo-1620062317671-ef6441546d7d?w=600',
      likes: 547, comments: 22
    },
    {
      id: 'f5', author: 'Bia Andrade', avatar: 'https://i.pravatar.cc/100?img=49',
      type: 'preset', title: 'Filme dos anos 90',
      imageUrl: 'https://images.unsplash.com/photo-1583324961572-9f4afd9ffee6?w=600',
      likes: 3110, comments: 240, presetName: 'Bia 90s',
      style: { brightness: 95, contrast: 95, saturation: 78, warmth: 26, vignette: 0.32 }
    }
  ];


  function cloneSeed() {
    return FEED_SEED.map(function (p) {
      var copy = {};
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) copy[k] = p[k];
      if (p.style) copy.style = { brightness: p.style.brightness, contrast: p.style.contrast, saturation: p.style.saturation, warmth: p.style.warmth, vignette: p.style.vignette };
      return copy;
    });
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.posts) && parsed.posts.length) {
          return {
            posts: parsed.posts,
            likes: parsed.likes || {},
            myPresets: parsed.myPresets || [],
            downloadedPresets: parsed.downloadedPresets || [],
            comments: parsed.comments || {},
            filter: 'Tudo'
          };
        }
      }
    } catch (err) {
      console.warn('CommunityView: falha ao carregar dados salvos, iniciando do zero.', err);
    }
    return {
      posts: cloneSeed(),
      likes: {},
      myPresets: [],
      downloadedPresets: [],
      comments: {},
      filter: 'Tudo'
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        posts: state.posts,
        likes: state.likes,
        myPresets: state.myPresets,
        downloadedPresets: state.downloadedPresets,
        comments: state.comments
      }));
    } catch (err) {
      console.warn('CommunityView: não foi possível salvar os dados localmente.', err);
    }
  }

  var state = loadState();

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str == null ? '' : str).replace(/"/g, '&quot;');
  }

  var el = {};


  function getFilteredPosts() {
    if (state.filter === 'Fotos') return state.posts.filter(function (p) { return p.type === 'photo'; });
    if (state.filter === 'Presets') return state.posts.filter(function (p) { return p.type === 'preset'; });
    return state.posts;
  }

  function createPostElement(post) {
    var liked = !!state.likes[post.id];
    var isPreset = post.type === 'preset';
    var filterCss = post.style ? styleToFilter(post.style) : '';

    var article = document.createElement('article');
    article.className = 'border-b border-slate-100 pb-3';
    article.dataset.postId = post.id;

    article.innerHTML =
      '<header class="flex items-center gap-3 px-4 py-3">' +
        '<img src="' + escapeAttr(post.avatar) + '" alt="' + escapeAttr(post.author) + '" class="w-9 h-9 rounded-full object-cover bg-slate-100" loading="lazy" />' +
        '<div class="flex-1 min-w-0">' +
          '<p class="text-slate-900 text-sm truncate">' + escapeHtml(post.author) + '</p>' +
          '<p class="text-xs text-slate-500 truncate">' + escapeHtml(post.title) + '</p>' +
        '</div>' +
        (isPreset
          ? '<span class="text-[10px] tracking-wider uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">' +
              '<i class="bi bi-stars" style="font-size:10px" aria-hidden="true"></i> Preset' +
            '</span>'
          : '') +
      '</header>' +
      '<div class="relative">' +
        '<img src="' + escapeAttr(post.imageUrl) + '" alt="' + escapeAttr(post.title) + '" class="w-full aspect-square object-cover bg-slate-100" loading="lazy"' +
          (filterCss ? ' style="filter:' + filterCss + '"' : '') + ' />' +
        (isPreset && post.presetName
          ? '<button type="button" data-action="download" class="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition">' +
              '<i class="bi bi-download" style="font-size:14px" aria-hidden="true"></i> Baixar' +
            '</button>'
          : '') +
      '</div>' +
      '<div class="flex items-center gap-5 px-4 pt-3 text-slate-700">' +
        '<button type="button" data-action="like" class="like-btn flex items-center gap-1.5" aria-pressed="' + (liked ? 'true' : 'false') + '" aria-label="Curtir publicação">' +
          '<i class="bi ' + (liked ? 'bi-heart-fill text-red-500' : 'bi-heart') + '" style="font-size:20px" aria-hidden="true"></i>' +
          '<span class="text-xs like-count">' + formatNumber(post.likes) + '</span>' +
        '</button>' +
        '<button type="button" data-action="comment" class="flex items-center gap-1.5" aria-label="Ver comentários">' +
          '<i class="bi bi-chat" style="font-size:20px" aria-hidden="true"></i>' +
          '<span class="text-xs comment-count">' + post.comments + '</span>' +
        '</button>' +
        '<button type="button" data-action="share" class="ml-auto" aria-label="Compartilhar publicação">' +
          '<i class="bi bi-share" style="font-size:20px" aria-hidden="true"></i>' +
        '</button>' +
      '</div>';

    return article;
  }

  function renderFeed() {
    var list = getFilteredPosts();
    el.feed.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'text-center text-slate-400 py-12 text-sm';
      empty.textContent = 'Nada por aqui ainda.';
      el.feed.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    list.forEach(function (p) { frag.appendChild(createPostElement(p)); });
    el.feed.appendChild(frag);
  }

  function updateFilterButtons() {
    var btns = el.filters.querySelectorAll('.filter-btn');
    btns.forEach(function (btn) {
      var active = btn.dataset.filter === state.filter;
      btn.classList.toggle('bg-blue-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-blue-50', !active);
      btn.classList.toggle('text-blue-700', !active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function toggleLike(post, btn) {
    var wasLiked = !!state.likes[post.id];
    state.likes[post.id] = !wasLiked;
    post.likes += wasLiked ? -1 : 1;
    saveState();

    var icon = btn.querySelector('i');
    var countEl = btn.querySelector('.like-count');
    var nowLiked = state.likes[post.id];

    icon.className = 'bi ' + (nowLiked ? 'bi-heart-fill text-red-500' : 'bi-heart');
    icon.style.fontSize = '20px';
    countEl.textContent = formatNumber(post.likes);
    btn.setAttribute('aria-pressed', nowLiked ? 'true' : 'false');

    if (nowLiked) {
      icon.classList.add('heart-pop');
      icon.addEventListener('animationend', function handler() {
        icon.classList.remove('heart-pop');
        icon.removeEventListener('animationend', handler);
      });
    }
  }


  var composeType = 'photo';

  function openCompose() {
    el.composeBackdrop.classList.remove('hidden');
    requestAnimationFrame(function () { el.composeBackdrop.classList.add('is-open'); });
    el.composeBackdrop.setAttribute('aria-hidden', 'false');
    el.composeInput.focus();
  }

  function closeCompose() {
    el.composeBackdrop.classList.remove('is-open');
    el.composeBackdrop.setAttribute('aria-hidden', 'true');
    setTimeout(function () { el.composeBackdrop.classList.add('hidden'); }, 300);
  }

  function updateTypeButtons() {
    document.querySelectorAll('.type-btn').forEach(function (btn) {
      var active = btn.dataset.type === composeType;
      btn.classList.toggle('border-blue-600', active);
      btn.classList.toggle('bg-blue-50', active);
      btn.classList.toggle('text-blue-700', active);
      btn.classList.toggle('border-slate-200', !active);
      btn.classList.toggle('text-slate-600', !active);
    });
  }

  function resetComposeForm() {
    composeType = 'photo';
    updateTypeButtons();
    el.composeInput.value = '';
    el.composeInput.placeholder = 'Legenda da foto';
    el.btnPublish.disabled = true;
  }

  function handlePublish() {
    var title = el.composeInput.value.trim();
    if (!title) return;

    var type = composeType;
    var newPost = {
      id: 'me-' + Date.now(),
      author: 'Você',
      avatar: 'https://i.pravatar.cc/100?img=8',
      type: type,
      title: title,
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
      likes: 0,
      comments: 0,
      presetName: type === 'preset' ? title : undefined,
      style: type === 'preset' ? defaultStyle() : undefined
    };

    state.posts.unshift(newPost);
    saveState();
    renderFeed();
    closeCompose();
    resetComposeForm();

    showToast(type === 'preset' ? 'Preset publicado na comunidade' : 'Foto publicada');
  }


  function handleDownload(post) {
    if (!post.presetName || !post.style) return;

    if (state.downloadedPresets.indexOf(post.id) === -1) {
      state.downloadedPresets.push(post.id);
      state.myPresets.unshift({
        id: 'mine-' + Date.now(),
        name: post.presetName,
        style: { brightness: post.style.brightness, contrast: post.style.contrast, saturation: post.style.saturation, warmth: post.style.warmth, vignette: post.style.vignette },
        imageUrl: post.imageUrl,
        savedAt: Date.now()
      });
      saveState();
    }

    showToast(post.presetName + ' salvo nos seus presets');
  }


  function handleShare(post) {
    var shareUrl = 'https://lumoscam.app/comunidade/' + encodeURIComponent(post.id);
    var shareData = {
      title: 'LumosCam — Comunidade',
      text: 'Confira "' + post.title + '" de ' + post.author + ' na comunidade LumosCam',
      url: shareUrl
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function (err) {
        if (err && err.name !== 'AbortError') fallbackShare(shareUrl);
      });
    } else {
      fallbackShare(shareUrl);
    }
  }

  function fallbackShare(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function () { showToast('Link copiado para a área de transferência'); })
        .catch(function () { showToast('Não foi possível copiar o link'); });
      return;
    }
    try {
      var tempInput = document.createElement('input');
      tempInput.value = url;
      tempInput.setAttribute('readonly', '');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('Link copiado para a área de transferência');
    } catch (err) {
      showToast('Não foi possível copiar o link');
    }
  }

  var activeCommentPostId = null;

  function openComments(post) {
    activeCommentPostId = post.id;
    el.commentsTitle.textContent = 'Comentários — ' + post.title;
    renderComments(post);

    el.commentsBackdrop.classList.remove('hidden');
    requestAnimationFrame(function () { el.commentsBackdrop.classList.add('is-open'); });
    el.commentsBackdrop.setAttribute('aria-hidden', 'false');
    el.commentInput.focus();
  }

  function closeComments() {
    el.commentsBackdrop.classList.remove('is-open');
    el.commentsBackdrop.setAttribute('aria-hidden', 'true');
    setTimeout(function () { el.commentsBackdrop.classList.add('hidden'); }, 300);
    activeCommentPostId = null;
  }

  function renderComments(post) {
    var list = state.comments[post.id] || [];
    el.commentsList.innerHTML = '';

    if (list.length === 0) {
      var note = document.createElement('p');
      note.className = 'text-center text-slate-400 text-sm py-6';
      note.textContent = post.comments > 0
        ? 'Esta publicação já tem ' + post.comments + ' comentário(s). Seja o primeiro a comentar por aqui.'
        : 'Nenhum comentário ainda. Seja o primeiro a comentar!';
      el.commentsList.appendChild(note);
      return;
    }

    list.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'flex items-start gap-2';
      row.innerHTML =
        '<div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0">Eu</div>' +
        '<div class="bg-slate-100 rounded-2xl px-3 py-2 text-sm text-slate-800 break-words">' + escapeHtml(c) + '</div>';
      el.commentsList.appendChild(row);
    });

    el.commentsList.scrollTop = el.commentsList.scrollHeight;
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    var text = el.commentInput.value.trim();
    if (!text || !activeCommentPostId) return;

    var post = state.posts.filter(function (p) { return p.id === activeCommentPostId; })[0];
    if (!post) return;

    if (!state.comments[post.id]) state.comments[post.id] = [];
    state.comments[post.id].push(text);
    post.comments += 1;
    saveState();

    renderComments(post);
    el.commentInput.value = '';

    var article = el.feed.querySelector('[data-post-id="' + cssEscape(post.id) + '"]');
    if (article) {
      var countEl = article.querySelector('.comment-count');
      if (countEl) countEl.textContent = post.comments;
    }
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }


  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast pointer-events-auto bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg max-w-[90%] text-center';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('hide');
      toast.addEventListener('animationend', function handler() {
        toast.remove();
        toast.removeEventListener('animationend', handler);
      });
    }, 2200);
  }

  function handleFeedClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var article = btn.closest('[data-post-id]');
    var id = article ? article.dataset.postId : null;
    var post = state.posts.filter(function (p) { return p.id === id; })[0];
    if (!post) return;

    var action = btn.dataset.action;
    if (action === 'like') toggleLike(post, btn);
    else if (action === 'comment') openComments(post);
    else if (action === 'share') handleShare(post);
    else if (action === 'download') handleDownload(post);
  }


  var initialized = false;

  function init() {
    el.feed = document.getElementById('feed');
    el.filters = document.getElementById('filters');
    el.composeBackdrop = document.getElementById('compose-backdrop');
    el.composeInput = document.getElementById('compose-input');
    el.btnPublish = document.getElementById('btn-publish');
    el.commentsBackdrop = document.getElementById('comments-backdrop');
    el.commentsTitle = document.getElementById('comments-title');
    el.commentsList = document.getElementById('comments-list');
    el.commentInput = document.getElementById('comment-input');
    el.toastContainer = document.getElementById('toast-container');

    if (!el.feed) return; 

    if (!initialized) {
      initialized = true;

      el.feed.addEventListener('click', handleFeedClick);

      el.filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;
        state.filter = btn.dataset.filter;
        updateFilterButtons();
        renderFeed();
      });

      document.getElementById('btn-open-compose').addEventListener('click', openCompose);
      document.getElementById('btn-close-compose').addEventListener('click', closeCompose);
      el.composeBackdrop.addEventListener('click', function (e) {
        if (e.target === el.composeBackdrop) closeCompose();
      });

      document.querySelectorAll('.type-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          composeType = btn.dataset.type;
          updateTypeButtons();
          el.composeInput.placeholder = composeType === 'preset' ? 'Nome do preset' : 'Legenda da foto';
        });
      });

      el.composeInput.addEventListener('input', function () {
        el.btnPublish.disabled = el.composeInput.value.trim().length === 0;
      });
      el.btnPublish.addEventListener('click', handlePublish);

      document.getElementById('btn-close-comments').addEventListener('click', closeComments);
      el.commentsBackdrop.addEventListener('click', function (e) {
        if (e.target === el.commentsBackdrop) closeComments();
      });
      document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!el.composeBackdrop.classList.contains('hidden')) closeCompose();
        if (!el.commentsBackdrop.classList.contains('hidden')) closeComments();
      });
    }

    updateFilterButtons();
    updateTypeButtons();
    renderFeed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CommunityView = {
    init: init,
    render: renderFeed
  };
})();
