import {
  CONFIG,
  getStats,
  getPreviewHtml,
  getWeChatStyledHtml,
  isHighlightCandidate,
  STYLE_PRESETS,
  DEFAULT_STYLE_ID,
  CUSTOM_STYLE_ID,
  buildCustomTheme,
} from './parser.js';
import { copyHtmlToClipboard, copyPlainToClipboard } from './clipboard.js';

const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');
const wordCountEl = document.getElementById('word-count');
const readTimeEl = document.getElementById('read-time');
const paragraphCountEl = document.getElementById('paragraph-count');
const syncWarning = document.getElementById('sync-warning');
const styleSelect = document.getElementById('style-select');
const customPanel = document.getElementById('style-custom-panel');
const customPrimaryInput = document.getElementById('custom-primary');
const customTextInput = document.getElementById('custom-text');
const customBackgroundInput = document.getElementById('custom-background');
const spacingRange = document.getElementById('spacing-range');
const spacingValue = document.getElementById('spacing-value');
const fontBaseRange = document.getElementById('font-base-range');
const fontHeadingRange = document.getElementById('font-heading-range');
const fontCodeRange = document.getElementById('font-code-range');
const fontBaseValue = document.getElementById('font-base-value');
const fontHeadingValue = document.getElementById('font-heading-value');
const fontCodeValue = document.getElementById('font-code-value');

const UI_CONFIG = {
  SWIPE_THRESHOLD: 80,
  SCROLL_SHOW_FAB: 150,
  SCROLL_HIDE_FAB_OFFSET: 200,
  DELETE_CONFIRM_TIMEOUT: 2000,
  TOAST_DURATION: 2500,
  RENDER_DEBOUNCE: 120,
};

const DEFAULT_CUSTOM_COLORS = {
  primary: '#3b82f6',
  text: '#334155',
  background: '#ffffff',
};

let customColors = { ...DEFAULT_CUSTOM_COLORS };
let customPreviewVarKeys = [];
let spacingScale = 1;
let fontScale = { base: 1, heading: 1, code: 1 };

marked.setOptions({
  breaks: true,
  gfm: true,
});

let renderCounter = 0;
let renderTimer = null;

function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, UI_CONFIG.RENDER_DEBOUNCE);
}

function getCurrentStyleId() {
  if (!styleSelect) return DEFAULT_STYLE_ID;
  return styleSelect.value || DEFAULT_STYLE_ID;
}

function loadCustomColors() {
  try {
    const raw = localStorage.getItem('wechat-custom-colors');
    if (!raw) return { ...DEFAULT_CUSTOM_COLORS };
    const parsed = JSON.parse(raw);
    return {
      primary: normalizeHex(parsed.primary, DEFAULT_CUSTOM_COLORS.primary),
      text: normalizeHex(parsed.text, DEFAULT_CUSTOM_COLORS.text),
      background: normalizeHex(parsed.background, DEFAULT_CUSTOM_COLORS.background),
    };
  } catch (error) {
    return { ...DEFAULT_CUSTOM_COLORS };
  }
}

function saveCustomColors(nextColors) {
  localStorage.setItem('wechat-custom-colors', JSON.stringify(nextColors));
}

function normalizeHex(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.startsWith('#') ? value : `#${value}`;
  if (/^#([0-9a-fA-F]{6})$/.test(normalized)) return normalized.toLowerCase();
  return fallback;
}

function applyCustomPreviewVars(previewVars) {
  if (!previewVars) return;
  customPreviewVarKeys = Object.keys(previewVars);
  customPreviewVarKeys.forEach((key) => {
    document.body.style.setProperty(key, previewVars[key]);
  });
}

function clearCustomPreviewVars() {
  customPreviewVarKeys.forEach((key) => {
    document.body.style.removeProperty(key);
  });
  customPreviewVarKeys = [];
}

function updateCustomPanelVisibility(styleId) {
  if (!customPanel) return;
  const isCustom = styleId === CUSTOM_STYLE_ID;
  customPanel.classList.toggle('hidden', !isCustom);
}

function updateCustomInputs() {
  if (customPrimaryInput) customPrimaryInput.value = customColors.primary;
  if (customTextInput) customTextInput.value = customColors.text;
  if (customBackgroundInput) customBackgroundInput.value = customColors.background;
}

function applyStyle(styleId) {
  const resolvedStyleId = styleId === CUSTOM_STYLE_ID || STYLE_PRESETS[styleId]
    ? styleId
    : DEFAULT_STYLE_ID;
  document.body.dataset.style = resolvedStyleId;
  if (styleSelect) {
    styleSelect.value = resolvedStyleId;
  }
  localStorage.setItem('wechat-style', resolvedStyleId);
  updateCustomPanelVisibility(resolvedStyleId);

  if (resolvedStyleId === CUSTOM_STYLE_ID) {
    const { previewVars } = buildCustomTheme(customColors);
    applyCustomPreviewVars(previewVars);
  } else {
    clearCustomPreviewVars();
  }
  scheduleRender();
}

function applySpacingScale(scale) {
  const safeScale = Math.min(1.4, Math.max(0.7, scale));
  spacingScale = safeScale;
  document.documentElement.style.setProperty('--space-scale', String(safeScale));
  if (spacingRange) spacingRange.value = String(safeScale);
  if (spacingValue) spacingValue.textContent = `${Math.round(safeScale * 100)}%`;
  localStorage.setItem('wechat-space-scale', String(safeScale));
  scheduleRender();
}

function applyFontScale(nextScale) {
  const safeScale = {
    base: Math.min(1.4, Math.max(0.7, nextScale.base ?? 1)),
    heading: Math.min(1.4, Math.max(0.7, nextScale.heading ?? 1)),
    code: Math.min(1.4, Math.max(0.7, nextScale.code ?? 1)),
  };
  fontScale = safeScale;
  document.documentElement.style.setProperty('--font-base-scale', String(safeScale.base));
  document.documentElement.style.setProperty('--font-heading-scale', String(safeScale.heading));
  document.documentElement.style.setProperty('--font-code-scale', String(safeScale.code));

  if (fontBaseRange) fontBaseRange.value = String(safeScale.base);
  if (fontHeadingRange) fontHeadingRange.value = String(safeScale.heading);
  if (fontCodeRange) fontCodeRange.value = String(safeScale.code);
  if (fontBaseValue) fontBaseValue.textContent = `${Math.round(safeScale.base * 100)}%`;
  if (fontHeadingValue) fontHeadingValue.textContent = `${Math.round(safeScale.heading * 100)}%`;
  if (fontCodeValue) fontCodeValue.textContent = `${Math.round(safeScale.code * 100)}%`;

  localStorage.setItem('wechat-font-scale', JSON.stringify(safeScale));
  scheduleRender();
}

function initSpacingControl() {
  if (!spacingRange || !spacingValue) return;
  const savedScaleRaw = localStorage.getItem('wechat-space-scale');
  const savedScale = savedScaleRaw ? Number.parseFloat(savedScaleRaw) : 1;
  applySpacingScale(Number.isNaN(savedScale) ? 1 : savedScale);

  spacingRange.addEventListener('input', (event) => {
    const value = Number.parseFloat(event.target.value);
    applySpacingScale(Number.isNaN(value) ? 1 : value);
  });
}

function initFontControl() {
  if (!fontBaseRange || !fontHeadingRange || !fontCodeRange) return;
  let savedScale = null;
  try {
    const raw = localStorage.getItem('wechat-font-scale');
    if (raw) savedScale = JSON.parse(raw);
  } catch (error) {
    savedScale = null;
  }

  applyFontScale({
    base: savedScale?.base ?? 1,
    heading: savedScale?.heading ?? 1,
    code: savedScale?.code ?? 1,
  });

  const handleFontChange = () => {
    applyFontScale({
      base: Number.parseFloat(fontBaseRange.value),
      heading: Number.parseFloat(fontHeadingRange.value),
      code: Number.parseFloat(fontCodeRange.value),
    });
  };

  fontBaseRange.addEventListener('input', handleFontChange);
  fontHeadingRange.addEventListener('input', handleFontChange);
  fontCodeRange.addEventListener('input', handleFontChange);
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
  const styleId = getCurrentStyleId();
  const styledHtml = await getWeChatStyledHtml(
    input.value,
    marked,
    styleId,
    styleId === CUSTOM_STYLE_ID ? customColors : undefined,
    spacingScale,
    fontScale
  );
  await copyHtmlToClipboard(styledHtml, preview, toast, UI_CONFIG.TOAST_DURATION);
};

window.copyPlainText = async function copyPlainText() {
  if (!input.value.trim()) {
    alert('请先输入 Markdown 内容');
    return;
  }
  await copyPlainToClipboard(input.value, toast, UI_CONFIG.TOAST_DURATION);
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

  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    themeBtn.innerHTML = '🌙';
    themeColorMeta.content = '#dbeafe';
    localStorage.setItem('x-theme', 'light');
  } else {
    body.classList.add('dark');
    themeBtn.innerHTML = '☀️';
    themeColorMeta.content = '#0f172a';
    localStorage.setItem('x-theme', 'dark');
  }
};

function initTheme() {
  const savedTheme = localStorage.getItem('x-theme');
  const themeBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeBtn.innerHTML = '☀️';
    themeColorMeta.content = '#0f172a';
  } else {
    document.body.classList.remove('dark');
    themeBtn.innerHTML = '🌙';
    themeColorMeta.content = '#dbeafe';
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

function initStylePicker() {
  if (!styleSelect) return;

  styleSelect.innerHTML = '';
  const options = {
    ...STYLE_PRESETS,
    [CUSTOM_STYLE_ID]: { label: '自定义' },
  };

  Object.entries(options).forEach(([id, preset]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = preset.label;
    styleSelect.appendChild(option);
  });

  const savedStyle = localStorage.getItem('wechat-style');
  const defaultStyle = savedStyle === CUSTOM_STYLE_ID || STYLE_PRESETS[savedStyle]
    ? savedStyle
    : DEFAULT_STYLE_ID;
  applyStyle(defaultStyle);

  styleSelect.addEventListener('change', (event) => {
    applyStyle(event.target.value);
  });
}

function initCustomColors() {
  if (!customPrimaryInput || !customTextInput || !customBackgroundInput) return;

  customColors = loadCustomColors();
  updateCustomInputs();
  updateCustomPanelVisibility(getCurrentStyleId());
  if (getCurrentStyleId() === CUSTOM_STYLE_ID) {
    applyStyle(CUSTOM_STYLE_ID);
  }

  const handleCustomChange = () => {
    customColors = {
      primary: normalizeHex(customPrimaryInput.value, DEFAULT_CUSTOM_COLORS.primary),
      text: normalizeHex(customTextInput.value, DEFAULT_CUSTOM_COLORS.text),
      background: normalizeHex(customBackgroundInput.value, DEFAULT_CUSTOM_COLORS.background),
    };
    saveCustomColors(customColors);
    applyStyle(CUSTOM_STYLE_ID);
  };

  customPrimaryInput.addEventListener('input', handleCustomChange);
  customTextInput.addEventListener('input', handleCustomChange);
  customBackgroundInput.addEventListener('input', handleCustomChange);
}

input.addEventListener('input', scheduleRender);
window.addEventListener('resize', handleResize);
handleResize();
setupSwipe();
setupFab();
initTheme();
initStylePicker();
initCustomColors();
initSpacingControl();
initFontControl();
renderPreview();
