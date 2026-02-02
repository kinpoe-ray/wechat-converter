import {
  CONFIG,
  getStats,
  getPreviewHtml,
  getWeChatStyledHtml,
  isHighlightCandidate,
} from './parser.js';
import { copyHtmlToClipboard, copyPlainToClipboard } from './clipboard.js';

const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');
const wordCountEl = document.getElementById('word-count');
const readTimeEl = document.getElementById('read-time');
const paragraphCountEl = document.getElementById('paragraph-count');
const syncWarning = document.getElementById('sync-warning');

const UI_CONFIG = {
  SWIPE_THRESHOLD: 80,
  SCROLL_SHOW_FAB: 150,
  SCROLL_HIDE_FAB_OFFSET: 200,
  DELETE_CONFIRM_TIMEOUT: 2000,
  TOAST_DURATION: 2500,
  RENDER_DEBOUNCE: 120,
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

if (window.mermaid) {
  mermaid.initialize({
    startOnLoad: false,
    theme: localStorage.getItem('mermaid-theme') || 'default',
    securityLevel: 'strict'
  });
}

let renderCounter = 0;
let renderTimer = null;

function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, UI_CONFIG.RENDER_DEBOUNCE);
}

async function renderPreview() {
  const markdown = input.value;
  const current = ++renderCounter;
  if (markdown.trim()) {
    const html = await getPreviewHtml(markdown, marked);
    if (current !== renderCounter) return;
    preview.innerHTML = html;
    processHighlightSentences();
    updateStats();
    checkStyleSync();
  } else {
    preview.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✨</div>
        <div class="empty-state-text">在左侧输入 Markdown 内容<br>这里会实时显示转换效果</div>
      </div>
    `;
  }
}

function processHighlightSentences() {
  const paragraphs = preview.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (p.children.length === 1 && p.children[0].tagName === 'STRONG' &&
      p.textContent.trim() === p.children[0].textContent.trim()) {
      const text = p.textContent.trim();
      if (isHighlightCandidate(text)) {
        p.classList.add('highlight-card');
      }
    }
  });
}

function updateStats() {
  const stats = getStats(input.value);
  wordCountEl.textContent = stats.wordCount;
  readTimeEl.textContent = `${stats.readTime}分钟`;
  paragraphCountEl.textContent = stats.paragraphCount;
}

function checkStyleSync() {
  const sample = preview.querySelector('p');
  if (!sample) {
    syncWarning.style.display = 'none';
    return;
  }
  const hasInline = sample.getAttribute('style');
  syncWarning.style.display = hasInline ? 'flex' : 'none';
}

window.copyToClipboard = async function copyToClipboard() {
  if (!input.value.trim()) {
    alert('请先输入 Markdown 内容');
    return;
  }
  const styledHtml = await getWeChatStyledHtml(input.value, marked);
  await copyHtmlToClipboard(styledHtml, preview, toast, UI_CONFIG.TOAST_DURATION);
};

window.copyPlainText = async function copyPlainText() {
  if (!input.value.trim()) {
    alert('请先输入 Markdown 内容');
    return;
  }
  await copyPlainToClipboard(input.value, toast, UI_CONFIG.TOAST_DURATION);
};

window.toggleMermaidTheme = function toggleMermaidTheme() {
  const currentTheme = localStorage.getItem('mermaid-theme') || 'default';
  const nextTheme = currentTheme === 'default' ? 'dark' : 'default';
  localStorage.setItem('mermaid-theme', nextTheme);
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: nextTheme,
      securityLevel: 'strict'
    });
  }
  renderPreview();
};

window.clearInput = function clearInput() {
  if (!window.__deleteClickCount) window.__deleteClickCount = 0;
  window.__deleteClickCount += 1;

  if (window.__deleteClickCount === 1) {
    toast.textContent = '🗑️ 再点一次确认清空';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      window.__deleteClickCount = 0;
    }, UI_CONFIG.DELETE_CONFIRM_TIMEOUT);
  } else {
    window.__deleteClickCount = 0;
    input.value = '';
    renderPreview();
  }
};

window.pasteFromClipboard = async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      input.value = text;
      scheduleRender();
      toast.textContent = '✅ 内容已粘贴！';
    } else {
      input.focus();
      toast.textContent = '📋 请长按粘贴内容';
    }
  } catch (error) {
    input.focus();
    toast.textContent = '📋 请长按粘贴内容';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), UI_CONFIG.TOAST_DURATION);
};

window.switchTab = function switchTab(tab) {
  const tabInput = document.getElementById('tab-input');
  const tabPreview = document.getElementById('tab-preview');
  const panelInput = document.getElementById('panel-input');
  const panelPreview = document.getElementById('panel-preview');

  if (tab === 'input') {
    tabInput.classList.add('active');
    tabPreview.classList.remove('active');
    panelInput.classList.add('active');
    panelPreview.classList.remove('active');
  } else {
    tabInput.classList.remove('active');
    tabPreview.classList.add('active');
    panelInput.classList.remove('active');
    panelPreview.classList.add('active');
  }
};

window.toggleTheme = function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');

  if (body.classList.contains('light')) {
    body.classList.remove('light');
    themeBtn.innerHTML = '🌙';
    themeColorMeta.content = '#15202b';
    localStorage.setItem('x-theme', 'dark');
  } else {
    body.classList.add('light');
    themeBtn.innerHTML = '☀️';
    themeColorMeta.content = '#ffffff';
    localStorage.setItem('x-theme', 'light');
  }
};

function initTheme() {
  const savedTheme = localStorage.getItem('x-theme');
  const themeBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');

  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeBtn.innerHTML = '☀️';
    themeColorMeta.content = '#ffffff';
  } else {
    document.body.classList.remove('light');
    themeBtn.innerHTML = '🌙';
    themeColorMeta.content = '#15202b';
  }
}

function handleResize() {
  const isMobile = window.innerWidth <= 768;
  const panelInput = document.getElementById('panel-input');
  const panelPreview = document.getElementById('panel-preview');

  if (!isMobile) {
    panelInput.classList.add('active');
    panelPreview.classList.add('active');
  }
}

function setupSwipe() {
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  let isHorizontalSwipe = null;

  const editorEl = document.querySelector('.editor');
  const panelInputEl = document.getElementById('panel-input');
  const panelPreviewEl = document.getElementById('panel-preview');

  editorEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    isSwiping = true;
    isHorizontalSwipe = null;
    panelInputEl.style.transition = 'none';
    panelPreviewEl.style.transition = 'none';
  }, { passive: true });

  editorEl.addEventListener('touchmove', (e) => {
    if (!isSwiping || window.innerWidth > 768) return;

    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    if (isHorizontalSwipe === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (!isHorizontalSwipe) return;

    const editorWidth = window.innerWidth;
    const maxOffset = editorWidth * 0.4;
    const offset = Math.max(-maxOffset, Math.min(maxOffset, diffX * 0.8));

    if (diffX > 0 && panelPreviewEl.classList.contains('active')) {
      panelPreviewEl.style.transform = `translateX(${offset}px)`;
      panelPreviewEl.style.opacity = 1 - Math.abs(offset) / (maxOffset * 1.5);
    } else if (diffX < 0 && panelInputEl.classList.contains('active')) {
      panelInputEl.style.transform = `translateX(${offset}px)`;
      panelInputEl.style.opacity = 1 - Math.abs(offset) / (maxOffset * 1.5);
    }
  }, { passive: true });

  editorEl.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX;

    panelInputEl.style.transition = '';
    panelPreviewEl.style.transition = '';
    panelInputEl.style.transform = '';
    panelInputEl.style.opacity = '';
    panelPreviewEl.style.transform = '';
    panelPreviewEl.style.opacity = '';

    if (isHorizontalSwipe && window.innerWidth <= 768 && Math.abs(diff) > UI_CONFIG.SWIPE_THRESHOLD) {
      if (diff > 0 && panelPreviewEl.classList.contains('active')) {
        window.switchTab('input');
      } else if (diff < 0 && panelInputEl.classList.contains('active')) {
        window.switchTab('preview');
      }
    }
  }, { passive: true });
}

function setupFab() {
  const fabContainer = document.getElementById('fab-container');
  const fabTop = document.getElementById('fab-top');

  window.scrollToTop = function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    if (scrollTop > UI_CONFIG.SCROLL_SHOW_FAB) {
      fabContainer.classList.add('show');
    } else if (scrollTop < UI_CONFIG.SCROLL_HIDE_FAB_OFFSET) {
      fabContainer.classList.remove('show');
    }

    if (scrollTop > 400) {
      fabTop.style.opacity = '1';
    } else {
      fabTop.style.opacity = '0';
    }
  });
}

input.addEventListener('input', scheduleRender);
window.addEventListener('resize', handleResize);
handleResize();
setupSwipe();
setupFab();
initTheme();
renderPreview();
