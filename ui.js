import {
  CONFIG,
  getStats,
  getPreviewHtml,
  getWeChatStyledHtml,
  isHighlightCandidate,
  STYLE_PRESETS,
  DEFAULT_STYLE_ID,
  DEFAULT_FONT_PROFILE_ID,
  AUTO_FONT_PROFILE_ID,
  CUSTOM_STYLE_ID,
  FONT_PROFILES,
  getFontProfile,
  getRecommendedFontProfile,
  getRecommendedFontScale,
  getRecommendedLayoutSettings,
  buildCustomTheme,
} from './parser.js?v=20260212d';
import { copyHtmlToClipboard, copyPlainToClipboard } from './clipboard.js?v=20260212c';

const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');
const wordCountEl = document.getElementById('word-count');
const readTimeEl = document.getElementById('read-time');
const paragraphCountEl = document.getElementById('paragraph-count');
const syncWarning = document.getElementById('sync-warning');
const styleSelect = document.getElementById('style-select');
const fontProfileSelect = document.getElementById('font-profile-select');
const fontWeightRange = document.getElementById('font-weight-range');
const fontWeightValue = document.getElementById('font-weight-value');
const customPanel = document.getElementById('style-custom-panel');
const stylePanel = document.getElementById('style-panel');
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
const contentPaddingRange = document.getElementById('content-padding-range');
const contentPaddingValue = document.getElementById('content-padding-value');
const stylePanelBody = document.getElementById('style-panel-body');
const stylePanelToggle = document.getElementById('style-panel-toggle');
const statsPanel = document.getElementById('stats-panel');
const statsCompactEl = document.getElementById('stats-compact');
const pasteModal = document.getElementById('paste-modal');
const pasteModalInput = document.getElementById('paste-modal-input');
const pasteModalConfirm = document.getElementById('paste-modal-confirm');
const pasteModalCancel = document.getElementById('paste-modal-cancel');
const pasteModalDesc = document.getElementById('paste-modal-desc');
const mermaidPanel = document.getElementById('mermaid-panel');
const mermaidMeta = document.getElementById('mermaid-meta');
const mermaidList = document.getElementById('mermaid-list');

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
let fontBaseWeight = 400;
let contentPaddingX = 0;
let fontProfileId = AUTO_FONT_PROFILE_ID;
let fontPreviewVarKeys = [];
let deleteResetTimer = null;

const markdownParser = (typeof window !== 'undefined' &&
  window.marked &&
  typeof window.marked.parse === 'function')
  ? window.marked
  : null;

if (markdownParser && typeof markdownParser.setOptions === 'function') {
  markdownParser.setOptions({
    breaks: true,
    gfm: true,
  });
}

let renderCounter = 0;
let renderTimer = null;
let toastTimer = null;
let mermaidSvgs = [];
let mermaidInitialized = false;

function getMermaidRuntime() {
  if (typeof window === 'undefined' || !window.mermaid) return null;
  return window.mermaid;
}

function ensureMermaidInitialized() {
  const runtime = getMermaidRuntime();
  if (!runtime || mermaidInitialized) return runtime;
  runtime.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: document.body.classList.contains('dark') ? 'dark' : 'default',
  });
  mermaidInitialized = true;
  return runtime;
}

function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, UI_CONFIG.RENDER_DEBOUNCE);
}

function renderMermaidPanelEmpty() {
  mermaidSvgs = [];
  if (!mermaidPanel || !mermaidMeta || !mermaidList) return;
  mermaidPanel.classList.remove('show');
  mermaidMeta.textContent = '未检测到 Mermaid 图表';
  mermaidList.innerHTML = '';
  const fabMermaid = document.getElementById('fab-mermaid');
  if (fabMermaid) fabMermaid.classList.remove('show');
}

function downloadSvgFromDom(stageEl, filename = 'mermaid-diagram.svg') {
  const liveSvg = stageEl.querySelector('svg');
  if (!liveSvg) throw new Error('SVG 元素不存在');

  const clone = liveSvg.cloneNode(true);

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  const allLive = liveSvg.querySelectorAll('*');
  const allClone = clone.querySelectorAll('*');
  const svgProps = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
    'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight',
    'font-style', 'text-anchor', 'dominant-baseline', 'color', 'display',
    'visibility', 'text-decoration', 'line-height', 'letter-spacing',
    'word-spacing', 'white-space', 'overflow', 'background-color',
    'border', 'padding', 'margin', 'max-width'];
  for (let i = 0; i < allLive.length; i++) {
    const cs = window.getComputedStyle(allLive[i]);
    const pairs = [];
    for (const p of svgProps) {
      const v = cs.getPropertyValue(p);
      if (v && v !== '' && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') {
        pairs.push(`${p}:${v}`);
      }
    }
    if (pairs.length) {
      const existing = allClone[i].getAttribute('style') || '';
      allClone[i].setAttribute('style', existing ? `${existing};${pairs.join(';')}` : pairs.join(';'));
    }
  }

  clone.querySelectorAll('style').forEach((s) => s.remove());

  const serializer = new XMLSerializer();
  const svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function renderMermaidPanel(mermaidBlocks) {
  if (!mermaidPanel || !mermaidMeta || !mermaidList) return;
  if (!mermaidBlocks || mermaidBlocks.length === 0) {
    renderMermaidPanelEmpty();
    return;
  }
  mermaidPanel.classList.add('show');
  mermaidMeta.textContent = `检测到 ${mermaidBlocks.length} 个 Mermaid 图`;
  mermaidList.innerHTML = '';
  mermaidSvgs = new Array(mermaidBlocks.length).fill('');

  const runtime = ensureMermaidInitialized();
  if (!runtime || typeof runtime.render !== 'function') {
    mermaidList.innerHTML = '<p>⚠️ Mermaid 运行库未加载，无法渲染。请检查网络后重试。</p>';
    return;
  }

  for (let i = 0; i < mermaidBlocks.length; i++) {
    const block = mermaidBlocks[i];
    const item = document.createElement('div');
    item.className = 'mermaid-item';

    const header = document.createElement('div');
    header.className = 'mermaid-item-header';
    const label = document.createElement('span');
    label.textContent = `${block.placeholder}`;
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.style.cssText = 'padding: 4px 10px; font-size: 12px;';
    exportBtn.textContent = '⬇️ 导出 SVG';
    header.appendChild(label);
    header.appendChild(exportBtn);

    const stage = document.createElement('div');
    stage.className = 'mermaid-item-stage';

    item.appendChild(header);
    item.appendChild(stage);
    mermaidList.appendChild(item);

    try {
      const renderId = `mermaid-${Date.now()}-${i}`;
      const result = await runtime.render(renderId, block.code || 'graph TD;A-->B;');
      const svg = result && result.svg ? result.svg : '';
      mermaidSvgs[i] = svg;
      stage.innerHTML = svg || '<p>⚠️ 渲染结果为空。</p>';
    } catch (error) {
      stage.innerHTML = `<p>⚠️ 语法错误：${error.message}</p>`;
    }

    const stageRef = stage;
    const exportIdx = i;
    exportBtn.addEventListener('click', () => {
      if (!stageRef.querySelector('svg')) {
        showToast('⚠️ 该图渲染失败，无法导出');
        return;
      }
      try {
        downloadSvgFromDom(stageRef, `mermaid-${exportIdx + 1}.svg`);
        showToast(`图 ${exportIdx + 1} 已导出为 SVG`, UI_CONFIG.TOAST_DURATION, true);
      } catch (error) {
        showToast(`⚠️ 导出失败：${error.message}`);
      }
    });
  }

  const fabMermaid = document.getElementById('fab-mermaid');
  if (fabMermaid) fabMermaid.classList.add('show');
}

function showToast(message, duration = UI_CONFIG.TOAST_DURATION, withIcon = false) {
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  if (withIcon) {
    toast.innerHTML = `<span class="toast-icon">✅</span><span>${message}</span>`;
  } else {
    toast.textContent = message;
  }
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, duration);
}

function isParserReady() {
  return !!markdownParser;
}

function showParserUnavailableToast() {
  showToast('⚠️ Markdown 解析器未就绪，请刷新页面重试');
}

function stripBackgroundStyles(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/style="([^"]*)"/g, (match, styleContent) => {
    const declarations = styleContent
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);
    const filtered = declarations.filter((decl) => {
      const [prop] = decl.split(':');
      if (!prop) return false;
      const key = prop.trim().toLowerCase();
      return key !== 'background' && key !== 'background-color';
    });
    return filtered.length ? `style="${filtered.join('; ')};"` : '';
  });
}

function openPasteModal(description = '当前环境限制自动读取剪贴板，请在下方粘贴后导入。') {
  if (!pasteModal || !pasteModalInput) {
    showToast('📋 请长按后粘贴到输入框');
    if (input) input.focus();
    return;
  }
  if (pasteModalDesc) pasteModalDesc.textContent = description;
  pasteModal.classList.add('show');
  pasteModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    try {
      pasteModalInput.focus({ preventScroll: true });
    } catch {
      pasteModalInput.focus();
    }
  }, 30);
}

function closePasteModal() {
  if (!pasteModal) return;
  pasteModal.classList.remove('show');
  pasteModal.setAttribute('aria-hidden', 'true');
}

function importPasteModalContent() {
  if (!pasteModalInput) return;
  const nextValue = pasteModalInput.value;
  if (!nextValue.trim()) {
    showToast('⚠️ 请先粘贴内容再导入');
    return;
  }
  input.value = nextValue;
  closePasteModal();
  scheduleRender();
  showToast('已导入粘贴内容', UI_CONFIG.TOAST_DURATION, true);
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

function applyFontPreviewVars(previewVars) {
  const rootStyle = document.documentElement.style;
  fontPreviewVarKeys.forEach((key) => rootStyle.removeProperty(key));
  const allowedKeys = Object.keys(previewVars || {}).filter((key) => key !== '--font-ui');
  fontPreviewVarKeys = allowedKeys;
  fontPreviewVarKeys.forEach((key) => rootStyle.setProperty(key, previewVars[key]));
}

function getEffectiveFontProfileId(styleId = getCurrentStyleId()) {
  if (fontProfileId === AUTO_FONT_PROFILE_ID) {
    return getRecommendedFontProfile(styleId);
  }
  return FONT_PROFILES[fontProfileId] ? fontProfileId : DEFAULT_FONT_PROFILE_ID;
}

function applyFontProfile(nextProfileId, options = {}) {
  const { persist = true, rerender = true } = options;
  const resolved = nextProfileId === AUTO_FONT_PROFILE_ID || FONT_PROFILES[nextProfileId]
    ? nextProfileId
    : DEFAULT_FONT_PROFILE_ID;
  fontProfileId = resolved;
  const profile = getFontProfile(getEffectiveFontProfileId());
  applyFontPreviewVars(profile.previewVars);
  if (fontProfileSelect) fontProfileSelect.value = resolved;
  if (persist) localStorage.setItem('wechat-font-profile', resolved);
  if (rerender) scheduleRender();
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

function applyStyle(styleId, options = {}) {
  const { applyTypoPreset = true, notifyTypoPreset = false } = options;
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
  if (fontProfileId === AUTO_FONT_PROFILE_ID) {
    applyFontProfile(AUTO_FONT_PROFILE_ID, { persist: false, rerender: false });
  }
  if (applyTypoPreset) {
    const recommendedScale = getRecommendedFontScale(resolvedStyleId);
    const recommendedLayout = getRecommendedLayoutSettings(resolvedStyleId);
    const noRerender = { rerender: false };
    applyFontScale(recommendedScale, noRerender);
    applyFontBaseWeight(recommendedLayout.fontWeight, noRerender);
    applySpacingScale(recommendedLayout.spacingScale, noRerender);
    applyContentPaddingX(recommendedLayout.contentPaddingX, noRerender);
    if (notifyTypoPreset) {
      showToast(
        `已应用推荐排版：正文 ${Math.round(recommendedScale.base * 100)}% · 标题 ${Math.round(recommendedScale.heading * 100)}% · 代码 ${Math.round(recommendedScale.code * 100)}% · 间距 ${Math.round(recommendedLayout.spacingScale * 100)}%`,
        2000
      );
    }
  }
  scheduleRender();
}

function applySpacingScale(scale, { rerender = true } = {}) {
  const safeScale = Math.min(1.4, Math.max(0.7, scale));
  spacingScale = safeScale;
  document.documentElement.style.setProperty('--space-scale', String(safeScale));
  if (spacingRange) spacingRange.value = String(safeScale);
  if (spacingValue) spacingValue.textContent = `${Math.round(safeScale * 100)}%`;
  localStorage.setItem('wechat-space-scale', String(safeScale));
  if (rerender) scheduleRender();
}

function applyFontScale(nextScale, { rerender = true } = {}) {
  const baseScale = (nextScale && Number.isFinite(nextScale.base)) ? nextScale.base : 1;
  const headingScale = (nextScale && Number.isFinite(nextScale.heading)) ? nextScale.heading : 1;
  const codeScale = (nextScale && Number.isFinite(nextScale.code)) ? nextScale.code : 1;
  const safeScale = {
    base: Math.min(1.4, Math.max(0.7, baseScale)),
    heading: Math.min(1.4, Math.max(0.7, headingScale)),
    code: Math.min(1.4, Math.max(0.7, codeScale)),
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
  if (rerender) scheduleRender();
}

function initSpacingControl() {
  if (!spacingRange || !spacingValue) return;
  const savedScaleRaw = localStorage.getItem('wechat-space-scale');
  const recommended = getRecommendedLayoutSettings(getCurrentStyleId());
  const savedScale = savedScaleRaw ? Number.parseFloat(savedScaleRaw) : recommended.spacingScale;
  applySpacingScale(Number.isNaN(savedScale) ? recommended.spacingScale : savedScale);

  spacingRange.addEventListener('input', (event) => {
    const value = Number.parseFloat(event.target.value);
    applySpacingScale(Number.isNaN(value) ? 1 : value);
  });
}

function applyFontBaseWeight(nextWeight, { rerender = true } = {}) {
  const parsed = Math.round(nextWeight);
  const clamped = Math.min(500, Math.max(300, Number.isFinite(parsed) ? parsed : 400));
  const snapped = Math.round(clamped / 50) * 50;
  fontBaseWeight = snapped;
  document.documentElement.style.setProperty('--font-base-weight', String(snapped));
  if (fontWeightRange) fontWeightRange.value = String(snapped);
  if (fontWeightValue) fontWeightValue.textContent = String(snapped);
  localStorage.setItem('wechat-font-weight', String(snapped));
  if (rerender) scheduleRender();
}

function initFontWeightControl() {
  if (!fontWeightRange || !fontWeightValue) return;
  const savedRaw = localStorage.getItem('wechat-font-weight');
  const recommended = getRecommendedLayoutSettings(getCurrentStyleId());
  const savedWeight = savedRaw ? Number.parseInt(savedRaw, 10) : recommended.fontWeight;
  applyFontBaseWeight(Number.isNaN(savedWeight) ? recommended.fontWeight : savedWeight);

  fontWeightRange.addEventListener('input', (event) => {
    const value = Number.parseInt(event.target.value, 10);
    applyFontBaseWeight(Number.isNaN(value) ? 400 : value);
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
    base: savedScale && Number.isFinite(savedScale.base) ? savedScale.base : 1,
    heading: savedScale && Number.isFinite(savedScale.heading) ? savedScale.heading : 1,
    code: savedScale && Number.isFinite(savedScale.code) ? savedScale.code : 1,
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

function applyContentPaddingX(nextPadding, { rerender = true } = {}) {
  const safePadding = Math.min(32, Math.max(0, nextPadding));
  contentPaddingX = safePadding;
  document.documentElement.style.setProperty('--content-x', `${safePadding}px`);
  if (contentPaddingRange) contentPaddingRange.value = String(safePadding);
  if (contentPaddingValue) contentPaddingValue.textContent = `${safePadding}px`;
  localStorage.setItem('wechat-content-padding-x', String(safePadding));
  if (rerender) scheduleRender();
}

function initContentPaddingControl() {
  if (!contentPaddingRange || !contentPaddingValue) return;
  const savedRaw = localStorage.getItem('wechat-content-padding-x');
  const recommended = getRecommendedLayoutSettings(getCurrentStyleId());
  const saved = savedRaw ? Number.parseFloat(savedRaw) : recommended.contentPaddingX;
  applyContentPaddingX(Number.isNaN(saved) ? recommended.contentPaddingX : saved);

  contentPaddingRange.addEventListener('input', (event) => {
    const value = Number.parseFloat(event.target.value);
    applyContentPaddingX(Number.isNaN(value) ? 0 : value);
  });
}

function initStylePanelToggle() {
  if (!stylePanelBody || !stylePanelToggle) return;
  const savedState = localStorage.getItem('wechat-style-panel');
  const prefersCollapsed = window.matchMedia('(max-width: 900px)').matches;
  const isOpen = savedState ? savedState !== 'collapsed' : !prefersCollapsed;

  stylePanelBody.classList.toggle('is-collapsed', !isOpen);
  stylePanelToggle.classList.toggle('is-open', isOpen);
  stylePanelToggle.setAttribute('aria-expanded', String(isOpen));
  if (stylePanel) stylePanel.classList.toggle('is-collapsed', !isOpen);

  stylePanelToggle.addEventListener('click', () => {
    const nextOpen = stylePanelBody.classList.contains('is-collapsed');
    stylePanelBody.classList.toggle('is-collapsed', !nextOpen);
    stylePanelToggle.classList.toggle('is-open', nextOpen);
    stylePanelToggle.setAttribute('aria-expanded', String(nextOpen));
    if (stylePanel) stylePanel.classList.toggle('is-collapsed', !nextOpen);
    localStorage.setItem('wechat-style-panel', nextOpen ? 'open' : 'collapsed');
  });
}

window.resetStyleSettings = function resetStyleSettings() {
  customColors = { ...DEFAULT_CUSTOM_COLORS };
  saveCustomColors(customColors);
  updateCustomInputs();

  applyStyle(DEFAULT_STYLE_ID, { applyTypoPreset: true });
  applyFontProfile(AUTO_FONT_PROFILE_ID, { rerender: false });

  localStorage.removeItem('wechat-style');
  localStorage.removeItem('wechat-space-scale');
  localStorage.removeItem('wechat-font-scale');
  localStorage.removeItem('wechat-font-weight');
  localStorage.removeItem('wechat-content-padding-x');
  localStorage.removeItem('wechat-font-profile');
};

function wrapTables() {
  const tables = preview.querySelectorAll('table');
  tables.forEach((table) => {
    if (!table.parentElement.classList.contains('table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      // 检查是否需要横向滚动
      if (table.offsetWidth > wrapper.offsetWidth) {
        wrapper.classList.add('has-scroll');
      }
    }
  });
}

async function renderPreview() {
  const markdown = input.value;
  const current = ++renderCounter;
  if (markdown.trim()) {
    if (!isParserReady()) {
      preview.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Markdown 解析器加载失败，请刷新页面后重试</div>
        </div>
      `;
      updateStats();
      if (syncWarning) syncWarning.style.display = 'none';
      return;
    }
    const { html, mermaidBlocks } = await getPreviewHtml(markdown, markdownParser);
    if (current !== renderCounter) return;
    preview.innerHTML = html;
    wrapTables();
    processHighlightSentences();
    await renderMermaidPanel(mermaidBlocks);
    updateStats();
    checkStyleSync();
  } else {
    preview.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✨</div>
        <div class="empty-state-text">在左侧输入 Markdown 内容<br>这里会实时显示转换效果</div>
      </div>
    `;
    renderMermaidPanelEmpty();
    if (statsPanel) statsPanel.style.display = 'none';
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
  if (statsCompactEl) {
    statsCompactEl.textContent = `字数 ${stats.wordCount} · 阅读 ${stats.readTime}分钟 · 段落 ${stats.paragraphCount}`;
  }
  if (statsPanel) {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const shouldHide = !stats.wordCount || (isMobile && stats.wordCount < 80);
    statsPanel.style.display = shouldHide ? 'none' : 'flex';
  }
}

function checkStyleSync() {
  if (!syncWarning) return;
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
    showToast('⚠️ 请先输入 Markdown内容');
    return;
  }
  if (!isParserReady()) {
    showParserUnavailableToast();
    return;
  }
  const styleId = getCurrentStyleId();
  const styledHtml = await getWeChatStyledHtml(
    input.value,
    markdownParser,
    styleId,
    styleId === CUSTOM_STYLE_ID ? customColors : undefined,
    spacingScale,
    fontScale,
    fontBaseWeight,
    contentPaddingX,
    getEffectiveFontProfileId()
  );
  const cleanHtml = stripBackgroundStyles(styledHtml);
  await copyHtmlToClipboard(cleanHtml, preview, toast, UI_CONFIG.TOAST_DURATION, (msg) => showToast(msg, UI_CONFIG.TOAST_DURATION, true));
};

window.copyPlainText = async function copyPlainText() {
  if (!input.value.trim()) {
    showToast('⚠️ 请先输入 Markdown内容');
    return;
  }
  await copyPlainToClipboard(input.value, toast, UI_CONFIG.TOAST_DURATION, showToast);
};

window.pasteFromClipboard = async function pasteFromClipboard() {
  if (window.innerWidth <= 768) {
    window.switchTab('input');
  }

  const canReadClipboard = !!(window.isSecureContext &&
    navigator.clipboard &&
    typeof navigator.clipboard.readText === 'function');

  if (canReadClipboard) {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        input.value = text;
        scheduleRender();
        showToast('内容已粘贴', UI_CONFIG.TOAST_DURATION, true);
        return;
      }
    } catch (_) { /* fall through to focus */ }
  }

  input.focus();
  showToast('📋 请直接 Ctrl+V / Cmd+V 粘贴', 3000);
};

window.clearInput = function clearInput() {
  if (!window.__deleteClickCount) window.__deleteClickCount = 0;
  window.__deleteClickCount += 1;

  if (window.__deleteClickCount === 1) {
    showToast('🗑️ 再点一次确认清空', UI_CONFIG.DELETE_CONFIRM_TIMEOUT);
    if (deleteResetTimer) clearTimeout(deleteResetTimer);
    deleteResetTimer = setTimeout(() => {
      window.__deleteClickCount = 0;
      deleteResetTimer = null;
    }, UI_CONFIG.DELETE_CONFIRM_TIMEOUT);
  } else {
    window.__deleteClickCount = 0;
    if (deleteResetTimer) {
      clearTimeout(deleteResetTimer);
      deleteResetTimer = null;
    }
    input.value = '';
    renderPreview();
  }
};

window.pasteFromClipboard = async function pasteFromClipboard() {
  const canReadClipboard = !!(window.isSecureContext &&
    navigator.clipboard &&
    typeof navigator.clipboard.readText === 'function');

  if (!canReadClipboard) {
    openPasteModal('当前网络环境不支持自动读取剪贴板，请手动粘贴后点击“导入内容”。');
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      input.value = text;
      scheduleRender();
      showToast('内容已粘贴', UI_CONFIG.TOAST_DURATION, true);
    } else {
      openPasteModal('剪贴板为空，请手动粘贴内容后导入。');
    }
  } catch (error) {
    openPasteModal('浏览器限制了读取剪贴板，请手动粘贴内容后导入。');
  }
};

window.switchTab = function switchTab(tab) {
  const tabInput = document.getElementById('tab-input');
  const tabPreview = document.getElementById('tab-preview');
  const panelInput = document.getElementById('panel-input');
  const panelPreview = document.getElementById('panel-preview');
  const mobileTabInput = document.getElementById('mobile-tab-input');
  const mobileTabPreview = document.getElementById('mobile-tab-preview');
  const mobileActions = document.querySelectorAll('.mobile-action');

  if (tab === 'input') {
    tabInput.classList.add('active');
    tabPreview.classList.remove('active');
    panelInput.classList.add('active');
    panelPreview.classList.remove('active');
    if (mobileTabInput && mobileTabPreview) {
      mobileTabInput.classList.add('active');
      mobileTabPreview.classList.remove('active');
    }
  } else {
    tabInput.classList.remove('active');
    tabPreview.classList.add('active');
    panelInput.classList.remove('active');
    panelPreview.classList.add('active');
    if (mobileTabInput && mobileTabPreview) {
      mobileTabInput.classList.remove('active');
      mobileTabPreview.classList.add('active');
    }
  }

  if (mobileActions.length) {
    mobileActions.forEach((btn) => {
      const targetTab = btn.getAttribute('data-tab');
      btn.style.display = targetTab === 'all' || targetTab === tab ? '' : 'none';
    });
  }

  const fabMermaid = document.getElementById('fab-mermaid');
  if (fabMermaid) {
    if (tab === 'preview' && mermaidSvgs && mermaidSvgs.length > 0) {
      fabMermaid.classList.add('show');
    } else {
      fabMermaid.classList.remove('show');
    }
  }
};

window.toggleStylePanel = function toggleStylePanel() {
  if (!stylePanelToggle) return;
  stylePanelToggle.click();
};

function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');
  if (!body) return;

  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    if (themeBtn) themeBtn.innerHTML = '🌙';
    if (themeColorMeta) themeColorMeta.content = '#dbeafe';
    localStorage.setItem('x-theme', 'light');
  } else {
    body.classList.add('dark');
    if (themeBtn) themeBtn.innerHTML = '☀️';
    if (themeColorMeta) themeColorMeta.content = '#0f172a';
    localStorage.setItem('x-theme', 'dark');
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('x-theme');
  const themeBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color-meta');
  const body = document.body;
  if (!body) return;

  if (savedTheme === 'dark') {
    body.classList.add('dark');
    if (themeBtn) themeBtn.innerHTML = '☀️';
    if (themeColorMeta) themeColorMeta.content = '#0f172a';
  } else {
    body.classList.remove('dark');
    if (themeBtn) themeBtn.innerHTML = '🌙';
    if (themeColorMeta) themeColorMeta.content = '#dbeafe';
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
  const mainContent = document.querySelector('.main-content');
  const previewWrapper = document.getElementById('preview-wrapper');
  const fabButtons = fabContainer ? Array.from(fabContainer.querySelectorAll('.fab')) : [];

  const getScrollTarget = () => {
    if (previewWrapper && previewWrapper.scrollHeight > previewWrapper.clientHeight) {
      return previewWrapper;
    }
    if (mainContent && mainContent.scrollHeight > mainContent.clientHeight) {
      return mainContent;
    }
    return window;
  };

  window.scrollToTop = function scrollToTop() {
    const scrollTarget = getScrollTarget();
    if (scrollTarget === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFab = (scrollTop) => {
    if (scrollTop > UI_CONFIG.SCROLL_SHOW_FAB) {
      fabButtons.forEach((btn) => btn.classList.add('show'));
    } else if (scrollTop < UI_CONFIG.SCROLL_HIDE_FAB_OFFSET) {
      fabButtons.forEach((btn) => btn.classList.remove('show'));
    }

    if (scrollTop > 400) {
      fabTop.style.opacity = '1';
    } else {
      fabTop.style.opacity = '0';
    }
  };

  const handleScroll = (event) => {
    const target = event && event.target ? event.target : null;
    if (!target || target === document) {
      updateFab(window.scrollY);
      return;
    }
    updateFab(target.scrollTop || 0);
  };

  if (previewWrapper) {
    previewWrapper.addEventListener('scroll', handleScroll);
  }
  if (mainContent) {
    mainContent.addEventListener('scroll', handleScroll);
  }
  window.addEventListener('scroll', handleScroll);
  updateFab(getScrollTarget() === window ? window.scrollY : getScrollTarget().scrollTop || 0);

  const fabMermaid = document.getElementById('fab-mermaid');
  if (fabMermaid) {
    fabMermaid.addEventListener('click', () => {
      if (mermaidPanel) {
        mermaidPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
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
    applyStyle(event.target.value, { applyTypoPreset: true, notifyTypoPreset: true });
  });
}

function initFontProfilePicker() {
  if (!fontProfileSelect) return;
  fontProfileSelect.innerHTML = '';
  const autoOption = document.createElement('option');
  autoOption.value = AUTO_FONT_PROFILE_ID;
  autoOption.textContent = '跟随样式（推荐）';
  fontProfileSelect.appendChild(autoOption);
  Object.entries(FONT_PROFILES).forEach(([id, profile]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = profile.label;
    fontProfileSelect.appendChild(option);
  });

  const saved = localStorage.getItem('wechat-font-profile');
  applyFontProfile(saved || AUTO_FONT_PROFILE_ID, { persist: false, rerender: false });

  fontProfileSelect.addEventListener('change', (event) => {
    applyFontProfile(event.target.value);
  });
}

function initCustomColors() {
  if (!customPrimaryInput || !customTextInput || !customBackgroundInput) return;

  customColors = loadCustomColors();
  updateCustomInputs();
  updateCustomPanelVisibility(getCurrentStyleId());
  if (getCurrentStyleId() === CUSTOM_STYLE_ID) {
    applyStyle(CUSTOM_STYLE_ID, { applyTypoPreset: false });
  }

  const handleCustomChange = () => {
    customColors = {
      primary: normalizeHex(customPrimaryInput.value, DEFAULT_CUSTOM_COLORS.primary),
      text: normalizeHex(customTextInput.value, DEFAULT_CUSTOM_COLORS.text),
      background: normalizeHex(customBackgroundInput.value, DEFAULT_CUSTOM_COLORS.background),
    };
    saveCustomColors(customColors);
    applyStyle(CUSTOM_STYLE_ID, { applyTypoPreset: false });
  };

  customPrimaryInput.addEventListener('input', handleCustomChange);
  customTextInput.addEventListener('input', handleCustomChange);
  customBackgroundInput.addEventListener('input', handleCustomChange);
}

function initPasteModal() {
  if (!pasteModal || !pasteModalInput || !pasteModalConfirm || !pasteModalCancel) return;

  pasteModalConfirm.addEventListener('click', importPasteModalContent);
  pasteModalCancel.addEventListener('click', closePasteModal);

  pasteModal.addEventListener('click', (event) => {
    if (event.target === pasteModal) closePasteModal();
  });

  pasteModalInput.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      importPasteModalContent();
      return;
    }
    if (event.key === 'Escape') {
      closePasteModal();
    }
  });
}

input.addEventListener('input', scheduleRender);
window.addEventListener('resize', handleResize);

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
    const active = document.activeElement;
    if (active === input || active === pasteModalInput) return;
    if (window.innerWidth <= 768) window.switchTab('input');
    input.focus();
  }
});

window.toggleTheme = toggleTheme;

handleResize();
setupSwipe();
setupFab();
initTheme();
initStylePicker();
initFontProfilePicker();
initCustomColors();
initPasteModal();
initSpacingControl();
initFontControl();
initFontWeightControl();
initContentPaddingControl();
initStylePanelToggle();
renderPreview();
window.switchTab('input');
