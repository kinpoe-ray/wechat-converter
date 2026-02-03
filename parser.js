export const CONFIG = {
  HIGHLIGHT_MAX_LENGTH: 30,
  READ_SPEED: 400,
};

export const DEFAULT_STYLE_ID = 'default';
export const CUSTOM_STYLE_ID = 'custom';

export const STYLE_PRESETS = {
  default: {
    label: '蓝色清新',
    styles: {
      h1: 'color: #3b82f6; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;',
      h2: 'color: #3b82f6; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; line-height: 1.4;',
      h3: 'color: #333; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid #3b82f6; line-height: 1.4;',
      h4: 'color: #333; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;',
      p: 'margin: 24px 0; line-height: 1.85; color: #333; font-size: 16px; letter-spacing: 0.5px; text-align: justify;',
      strong: 'color: #333; font-weight: bold;',
      em: 'font-style: italic; color: #555;',
      del: 'text-decoration: line-through; color: #999;',
      a: 'color: #3b82f6; text-decoration: none;',
      ul: 'padding-left: 24px; margin: 24px 0;',
      ol: 'padding-left: 24px; margin: 24px 0;',
      li: 'margin: 12px 0; line-height: 1.8; color: #333;',
      blockquote: 'background: #f8fafc; border-left: 4px solid #cbd5e1; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: #57606a; font-size: 15px;',
      pre: 'background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;',
      code: 'background: #f1f5f9; color: #be185d; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;',
      codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
      table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
      th: 'background: #f8fafc; color: #333; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #e2e8f0;',
      td: 'padding: 10px; border: 1px solid #e2e8f0; color: #333;',
      hr: 'border: none; height: 1px; background: #e2e8f0; margin: 40px 0;',
      img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
      highlightCard: 'display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: #f0f9ff; border-radius: 8px; color: #3b82f6; font-size: 17px; font-weight: bold; line-height: 1.6;',
    },
  },
  minimal: {
    label: '黑白极简',
    styles: {
      h1: 'color: #111827; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;',
      h2: 'color: #111827; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid #111827; line-height: 1.4;',
      h3: 'color: #111827; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid #111827; line-height: 1.4;',
      h4: 'color: #111827; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;',
      p: 'margin: 24px 0; line-height: 1.85; color: #1f2937; font-size: 16px; letter-spacing: 0.5px; text-align: justify;',
      strong: 'color: #111827; font-weight: bold;',
      em: 'font-style: italic; color: #374151;',
      del: 'text-decoration: line-through; color: #9ca3af;',
      a: 'color: #111827; text-decoration: none; border-bottom: 1px solid #d1d5db;',
      ul: 'padding-left: 24px; margin: 24px 0;',
      ol: 'padding-left: 24px; margin: 24px 0;',
      li: 'margin: 12px 0; line-height: 1.8; color: #1f2937;',
      blockquote: 'background: #f9fafb; border-left: 4px solid #d1d5db; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: #4b5563; font-size: 15px;',
      pre: 'background: #111827; color: #f9fafb; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;',
      code: 'background: #f3f4f6; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;',
      codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
      table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
      th: 'background: #f3f4f6; color: #111827; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;',
      td: 'padding: 10px; border: 1px solid #e5e7eb; color: #1f2937;',
      hr: 'border: none; height: 1px; background: #e5e7eb; margin: 40px 0;',
      img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
      highlightCard: 'display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: #f3f4f6; border-radius: 8px; color: #111827; font-size: 17px; font-weight: bold; line-height: 1.6;',
    },
  },
  warm: {
    label: '暖橙温柔',
    styles: {
      h1: 'color: #f97316; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;',
      h2: 'color: #f97316; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid #f97316; line-height: 1.4;',
      h3: 'color: #9a3412; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid #fb923c; line-height: 1.4;',
      h4: 'color: #9a3412; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;',
      p: 'margin: 24px 0; line-height: 1.85; color: #7c2d12; font-size: 16px; letter-spacing: 0.5px; text-align: justify;',
      strong: 'color: #9a3412; font-weight: bold;',
      em: 'font-style: italic; color: #9a3412;',
      del: 'text-decoration: line-through; color: #d97706;',
      a: 'color: #f97316; text-decoration: none;',
      ul: 'padding-left: 24px; margin: 24px 0;',
      ol: 'padding-left: 24px; margin: 24px 0;',
      li: 'margin: 12px 0; line-height: 1.8; color: #7c2d12;',
      blockquote: 'background: #fff7ed; border-left: 4px solid #fdba74; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: #9a3412; font-size: 15px;',
      pre: 'background: #7c2d12; color: #ffedd5; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;',
      code: 'background: #ffedd5; color: #c2410c; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;',
      codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
      table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
      th: 'background: #ffedd5; color: #9a3412; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #fed7aa;',
      td: 'padding: 10px; border: 1px solid #fed7aa; color: #7c2d12;',
      hr: 'border: none; height: 1px; background: #fed7aa; margin: 40px 0;',
      img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
      highlightCard: 'display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: #fff7ed; border-radius: 8px; color: #f97316; font-size: 17px; font-weight: bold; line-height: 1.6;',
    },
  },
  zhihu: {
    label: '知乎风',
    styles: {
      h1: 'color: #1e80ff; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;',
      h2: 'color: #1e80ff; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid #1e80ff; line-height: 1.4;',
      h3: 'color: #1f2329; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid #1e80ff; line-height: 1.4;',
      h4: 'color: #1f2329; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;',
      p: 'margin: 24px 0; line-height: 1.85; color: #1f2329; font-size: 16px; letter-spacing: 0.4px; text-align: justify;',
      strong: 'color: #1f2329; font-weight: bold;',
      em: 'font-style: italic; color: #4e5969;',
      del: 'text-decoration: line-through; color: #86909c;',
      a: 'color: #1e80ff; text-decoration: none;',
      ul: 'padding-left: 24px; margin: 24px 0;',
      ol: 'padding-left: 24px; margin: 24px 0;',
      li: 'margin: 12px 0; line-height: 1.8; color: #1f2329;',
      blockquote: 'background: #f5f6f7; border-left: 4px solid #a9c8ff; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: #4e5969; font-size: 15px;',
      pre: 'background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;',
      code: 'background: #e8f1ff; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;',
      codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
      table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
      th: 'background: #f5f6f7; color: #1f2329; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #e5e6eb;',
      td: 'padding: 10px; border: 1px solid #e5e6eb; color: #1f2329;',
      hr: 'border: none; height: 1px; background: #e5e6eb; margin: 40px 0;',
      img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
      highlightCard: 'display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: #e8f1ff; border-radius: 8px; color: #1e80ff; font-size: 17px; font-weight: bold; line-height: 1.6;',
    },
  },
  magazine: {
    label: '杂志风',
    styles: {
      h1: 'color: #111827; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;',
      h2: 'color: #111827; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid #d97706; line-height: 1.4;',
      h3: 'color: #111827; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid #d97706; line-height: 1.4;',
      h4: 'color: #111827; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;',
      p: 'margin: 24px 0; line-height: 1.9; color: #1f2937; font-size: 16px; letter-spacing: 0.6px; text-align: justify;',
      strong: 'color: #111827; font-weight: bold;',
      em: 'font-style: italic; color: #6b7280;',
      del: 'text-decoration: line-through; color: #9ca3af;',
      a: 'color: #b45309; text-decoration: none;',
      ul: 'padding-left: 24px; margin: 24px 0;',
      ol: 'padding-left: 24px; margin: 24px 0;',
      li: 'margin: 12px 0; line-height: 1.8; color: #1f2937;',
      blockquote: 'background: #fffbeb; border-left: 4px solid #d97706; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: #92400e; font-size: 15px;',
      pre: 'background: #111827; color: #f9fafb; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;',
      code: 'background: #fffbeb; color: #b45309; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;',
      codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
      table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
      th: 'background: #fffbeb; color: #111827; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid #f3d9b1;',
      td: 'padding: 10px; border: 1px solid #f3d9b1; color: #1f2937;',
      hr: 'border: none; height: 1px; background: #f3d9b1; margin: 40px 0;',
      img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
      highlightCard: 'display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: #fffbeb; border-radius: 8px; color: #b45309; font-size: 17px; font-weight: bold; line-height: 1.6;',
    },
  },
};

export const CALLOUT_THEMES = {
  '💡': { bg: '#DBEAFE', border: '#3B82F6', label: '提示' },
  '💰': { bg: '#D1FAE5', border: '#10B981', label: '成本' },
  '🎯': { bg: '#FEF3C7', border: '#F59E0B', label: '目标' },
  '🧠': { bg: '#EDE9FE', border: '#8B5CF6', label: '思考' },
  '⚠️': { bg: '#FEE2E2', border: '#EF4444', label: '注意' },
  '🎲': { bg: '#F3F4F6', border: '#6B7280', label: '随机' },
  '✅': { bg: '#DCFCE7', border: '#22C55E', label: '结论' },
  '❗': { bg: '#FFE4E6', border: '#F43F5E', label: '重要' },
  'ℹ️': { bg: '#E0F2FE', border: '#0284C7', label: '信息' },
  '📝': { bg: '#F8FAFC', border: '#64748B', label: '笔记' },
};

const STYLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'strong', 'em', 'del',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'table', 'th', 'td', 'hr'];

const HEX_COLOR_RE = /^#([0-9a-fA-F]{6})$/;

function normalizeHex(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.startsWith('#') ? value : `#${value}`;
  if (HEX_COLOR_RE.test(normalized)) return normalized.toLowerCase();
  return fallback;
}

function hexToRgb(hex) {
  const match = HEX_COLOR_RE.exec(hex);
  if (!match) return { r: 0, g: 0, b: 0 };
  const intVal = parseInt(match[1], 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHex(colorA, colorB, ratio) {
  const safeRatio = Math.min(1, Math.max(0, ratio));
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const mix = {
    r: Math.round(a.r + (b.r - a.r) * safeRatio),
    g: Math.round(a.g + (b.g - a.g) * safeRatio),
    b: Math.round(a.b + (b.b - a.b) * safeRatio),
  };
  return rgbToHex(mix);
}

export function buildCustomTheme(customColors = {}) {
  const primary = normalizeHex(customColors.primary, '#3b82f6');
  const text = normalizeHex(customColors.text, '#334155');
  const background = normalizeHex(customColors.background, '#ffffff');
  const border = mixHex(background, '#000000', 0.12);
  const highlightBg = mixHex(primary, '#ffffff', 0.86);
  const blockquoteBg = mixHex(primary, '#ffffff', 0.92);
  const preBg = mixHex(text, '#000000', 0.7);
  const preText = '#f8fafc';
  const codeBg = mixHex(primary, '#ffffff', 0.9);
  const codeColor = mixHex(primary, '#000000', 0.35);
  const h3Border = mixHex(primary, '#000000', 0.15);
  const h4Color = mixHex(text, '#000000', 0.05);
  const tableHeadBg = mixHex(background, primary, 0.04);
  const tableRowAlt = mixHex(background, primary, 0.03);

  const styles = {
    h1: `color: ${primary}; font-size: 26px; font-weight: bold; text-align: center; margin: 40px 0 24px 0; line-height: 1.4;`,
    h2: `color: ${primary}; font-size: 20px; font-weight: bold; margin: 36px 0 20px 0; padding-bottom: 8px; border-bottom: 2px solid ${primary}; line-height: 1.4;`,
    h3: `color: ${text}; font-size: 17px; font-weight: bold; margin: 32px 0 16px 0; padding-left: 12px; border-left: 4px solid ${h3Border}; line-height: 1.4;`,
    h4: `color: ${h4Color}; font-size: 16px; font-weight: bold; margin: 24px 0 12px 0; line-height: 1.4;`,
    p: `margin: 24px 0; line-height: 1.85; color: ${text}; font-size: 16px; letter-spacing: 0.5px; text-align: justify;`,
    strong: `color: ${text}; font-weight: bold;`,
    em: `font-style: italic; color: ${mixHex(text, '#000000', 0.2)};`,
    del: `text-decoration: line-through; color: ${mixHex(text, '#000000', 0.4)};`,
    a: `color: ${primary}; text-decoration: none;`,
    ul: 'padding-left: 24px; margin: 24px 0;',
    ol: 'padding-left: 24px; margin: 24px 0;',
    li: `margin: 12px 0; line-height: 1.8; color: ${text};`,
    blockquote: `background: ${blockquoteBg}; border-left: 4px solid ${primary}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 28px 2px; color: ${mixHex(text, '#000000', 0.15)}; font-size: 15px;`,
    pre: `background: ${preBg}; color: ${preText}; padding: 16px; border-radius: 10px; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 13px; line-height: 1.6; margin: 24px 0;`,
    code: `background: ${codeBg}; color: ${codeColor}; padding: 2px 6px; border-radius: 4px; font-family: Consolas, Monaco, monospace; font-size: 14px;`,
    codeInPre: 'background: none; color: inherit; padding: 0; font-family: inherit; font-size: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;',
    th: `background: ${tableHeadBg}; color: ${text}; padding: 12px 10px; text-align: left; font-weight: bold; border: 1px solid ${border};`,
    td: `padding: 10px; border: 1px solid ${border}; color: ${text};`,
    hr: `border: none; height: 1px; background: ${border}; margin: 40px 0;`,
    img: 'max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px;',
    highlightCard: `display: block; text-align: center; padding: 16px 20px; margin: 28px 0; background: ${highlightBg}; border-radius: 8px; color: ${primary}; font-size: 17px; font-weight: bold; line-height: 1.6;`,
  };

  const previewVars = {
    '--preview-h1-color': primary,
    '--preview-h2-color': primary,
    '--preview-h2-border': primary,
    '--preview-h3-color': text,
    '--preview-h3-border': h3Border,
    '--preview-h4-color': h4Color,
    '--preview-text-color': text,
    '--preview-strong-color': text,
    '--preview-highlight-bg': highlightBg,
    '--preview-highlight-color': primary,
    '--preview-blockquote-bg': blockquoteBg,
    '--preview-blockquote-border': primary,
    '--preview-blockquote-color': mixHex(text, '#000000', 0.15),
    '--preview-pre-bg': preBg,
    '--preview-pre-color': preText,
    '--preview-code-bg': codeBg,
    '--preview-code-color': codeColor,
    '--preview-link-color': primary,
    '--preview-hr-color': border,
    '--preview-table-head-bg': tableHeadBg,
    '--preview-table-border': border,
    '--preview-table-row-alt': tableRowAlt,
  };

  return { styles, previewVars };
}

export function getStylePreset(styleId, customColors) {
  if (styleId === CUSTOM_STYLE_ID) {
    return { label: '自定义', ...buildCustomTheme(customColors) };
  }
  if (styleId && STYLE_PRESETS[styleId]) return STYLE_PRESETS[styleId];
  return STYLE_PRESETS[DEFAULT_STYLE_ID];
}

export function normalizeNotionMarkdown(markdown) {
  let text = markdown;
  text = text.replace(/^\s*•\s+/gm, '- ');
  text = text.replace(/^\s*◦\s+/gm, '  - ');
  text = text.replace(/^\s*▪\s+/gm, '  - ');
  text = text.replace(/^\s*[-*]\s*\[x\]\s+/gim, '- ✅ ');
  text = text.replace(/^\s*[-*]\s*\[\s\]\s+/gim, '- ☐ ');
  text = text.replace(/^\s*[-*]\s*[▸▶]\s+/gm, '### ');
  return text;
}

export function replaceMermaidBlocks(markdown) {
  return markdown.replace(/```mermaid[\s\S]*?```/g, () => {
    return '⚠️ Mermaid 图表无法在公众号渲染，请在此处插入截图/图片。';
  });
}

export function applyInlineStyles(html, styles) {
  let result = STYLE_TAGS.reduce((acc, tag) => {
    const regex = new RegExp(`<${tag}([ >])`, 'g');
    return acc.replace(regex, `<${tag} style="${styles[tag]}"$1`);
  }, html);

  result = result
    .replace(/<a /g, `<a style="${styles.a}" `)
    .replace(/<img /g, `<img style="${styles.img}" `);

  return result;
}

function scaleStyleSpacing(style, scale) {
  if (scale === 1) return style;
  const declarations = style.split(';').map((item) => item.trim()).filter(Boolean);
  const scaled = declarations.map((decl) => {
    const [prop, ...rest] = decl.split(':');
    if (!prop || rest.length === 0) return decl;
    const property = prop.trim();
    const value = rest.join(':').trim();
    if (!property.startsWith('margin') && !property.startsWith('padding')) {
      return `${property}: ${value}`;
    }
    const nextValue = value.replace(/(-?\d+(\.\d+)?)px/g, (match, num) => {
      const amount = Number.parseFloat(num);
      if (Number.isNaN(amount)) return match;
      const scaledAmount = Math.round(amount * scale * 100) / 100;
      return `${scaledAmount}px`;
    });
    return `${property}: ${nextValue}`;
  });
  return `${scaled.join('; ')};`;
}

function applySpacingScale(styles, scale) {
  if (scale === 1) return styles;
  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [key, scaleStyleSpacing(value, scale)])
  );
}

export function processNotionAside(html, styles, spacingScale = 1) {
  return html.replace(/<aside>([\s\S]*?)<\/aside>/gi, (match, content) => {
    const firstChar = content.trim()[0];
    const theme = CALLOUT_THEMES[firstChar] || CALLOUT_THEMES['💡'];
    const asideStyleBase = `background: ${theme.bg}; border-left: 4px solid ${theme.border}; border-radius: 6px; padding: 12px 16px; margin: 28px 0;`;
    const badgeStyleBase = `display:inline-block; font-size:12px; font-weight:bold; color:${theme.border}; border:1px solid ${theme.border}; border-radius:999px; padding:2px 8px; margin-right:8px;`;
    const asideStyle = scaleStyleSpacing(asideStyleBase, spacingScale);
    const badgeStyle = scaleStyleSpacing(badgeStyleBase, spacingScale);

    let cleanContent = content
      .replace(/^\s*(💡|💰|🎯|🧠|⚠️|🎲|ℹ️|✅|❗|📝)\s*/g, '$1 ')
      .replace(/\n{2,}/g, '<br>')
      .replace(/\n/g, ' ')
      .replace(/\*\*([^*]+)\*\*\s*[:：]/g, `<strong style="${styles.strong}">$1</strong>：`)
      .replace(/\*\*([^*]+)\*\*/g, `<strong style="${styles.strong}">$1</strong>`)
      .trim();

    return `<section style="${asideStyle}"><p style="${styles.p}; margin: 0;"><span style="${badgeStyle}">${theme.label}</span>${cleanContent}</p></section>`;
  });
}

export function fixPreCode(html, styles) {
  return html.replace(
    /<pre style="([^"]+)">\s*<code style="[^"]+">/g,
    `<pre style="$1"><code style="${styles.codeInPre}">`
  );
}

export function processHighlightCards(html, styles) {
  return html.replace(
    /<p style="[^"]*"><strong style="[^"]*">([^<]+)<\/strong><\/p>/g,
    (match, content) => {
      if (isHighlightCandidate(content)) {
        return `<p style="${styles.highlightCard}">${content}</p>`;
      }
      return match;
    }
  );
}

export function fixColonSpacing(html) {
  return html.replace(/<\/strong>\s*([:：])/g, '</strong>$1');
}

export function isHighlightCandidate(text) {
  return text.length <= CONFIG.HIGHLIGHT_MAX_LENGTH && !text.includes('：') && !text.includes(':');
}

export function getStats(markdown) {
  const wordCount = markdown.replace(/\s+/g, '').length;
  const readTime = Math.ceil(wordCount / CONFIG.READ_SPEED);
  const paragraphCount = markdown.split(/\n\s*\n/).filter((p) => p.trim()).length;
  return { wordCount, readTime, paragraphCount };
}

export async function getPreviewHtml(markdown, marked) {
  const normalized = normalizeNotionMarkdown(markdown);
  const processed = replaceMermaidBlocks(normalized);
  let html = marked.parse(processed);
  return html;
}

export async function getWeChatStyledHtml(
  markdown,
  marked,
  styleId = DEFAULT_STYLE_ID,
  customColors,
  spacingScale = 1,
  fontScale = { base: 1, heading: 1, code: 1 },
  contentPaddingX = 0
) {
  const { styles } = getStylePreset(styleId, customColors);
  const scaledStyles = applyContentPaddingX(
    applyFontScale(applySpacingScale(styles, spacingScale), fontScale),
    contentPaddingX
  );
  const normalized = normalizeNotionMarkdown(markdown);
  const processed = replaceMermaidBlocks(normalized);
  let html = marked.parse(processed);
  html = applyInlineStyles(html, scaledStyles);
  html = processNotionAside(html, scaledStyles, spacingScale);
  html = fixPreCode(html, scaledStyles);
  html = processHighlightCards(html, scaledStyles);
  html = fixColonSpacing(html);
  return html;
}

function applyFontScale(styles, fontScale) {
  if (!fontScale) return styles;
  const safeScale = {
    base: Number.isFinite(fontScale.base) ? fontScale.base : 1,
    heading: Number.isFinite(fontScale.heading) ? fontScale.heading : 1,
    code: Number.isFinite(fontScale.code) ? fontScale.code : 1,
  };

  const tagScaleMap = {
    h1: safeScale.heading,
    h2: safeScale.heading,
    h3: safeScale.heading,
    h4: safeScale.heading,
    p: safeScale.base,
    li: safeScale.base,
    blockquote: safeScale.base,
    table: safeScale.base,
    th: safeScale.base,
    td: safeScale.base,
    highlightCard: safeScale.base,
    pre: safeScale.code,
    code: safeScale.code,
  };

  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => {
      const scale = tagScaleMap[key] ?? 1;
      if (scale === 1) return [key, value];
      return [key, scaleFontSize(value, scale)];
    })
  );
}

function scaleFontSize(style, scale) {
  if (scale === 1) return style;
  const declarations = style.split(';').map((item) => item.trim()).filter(Boolean);
  const scaled = declarations.map((decl) => {
    const [prop, ...rest] = decl.split(':');
    if (!prop || rest.length === 0) return decl;
    const property = prop.trim();
    const value = rest.join(':').trim();
    if (property !== 'font-size') {
      return `${property}: ${value}`;
    }
    const nextValue = value.replace(/(-?\d+(\.\d+)?)px/g, (match, num) => {
      const amount = Number.parseFloat(num);
      if (Number.isNaN(amount)) return match;
      const scaledAmount = Math.round(amount * scale * 100) / 100;
      return `${scaledAmount}px`;
    });
    return `${property}: ${nextValue}`;
  });
  return `${scaled.join('; ')};`;
}

function applyContentPaddingX(styles, contentPaddingX) {
  const paddingX = Number.isFinite(contentPaddingX) ? contentPaddingX : 0;
  if (paddingX === 0) return styles;

  const targets = new Set([
    'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'blockquote',
    'pre', 'th', 'td', 'highlightCard',
  ]);

  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => {
      if (key === 'table') {
        return [key, addTableInset(value, paddingX)];
      }
      if (!targets.has(key)) return [key, value];
      const nextValue = addPaddingX(value, paddingX, false);
      return [key, nextValue];
    })
  );
}

function addPaddingX(style, paddingX, ensureBorderBox = false) {
  const declarations = style.split(';').map((item) => item.trim()).filter(Boolean);
  const updated = [];
  let hasPaddingLeft = false;
  let hasPaddingRight = false;
  let hasBoxSizing = false;
  let paddingLeftBase = null;
  let paddingRightBase = null;

  declarations.forEach((decl) => {
    const [prop, ...rest] = decl.split(':');
    if (!prop || rest.length === 0) {
      updated.push(decl);
      return;
    }
    const property = prop.trim();
    const value = rest.join(':').trim();
    if (property === 'padding') {
      const shorthand = parsePaddingShorthand(value);
      paddingLeftBase = shorthand.left;
      paddingRightBase = shorthand.right;
      updated.push(`${property}: ${value}`);
      return;
    }
    if (property === 'padding-left') {
      hasPaddingLeft = true;
      updated.push(`${property}: ${addPx(value, paddingX)}`);
      return;
    }
    if (property === 'padding-right') {
      hasPaddingRight = true;
      updated.push(`${property}: ${addPx(value, paddingX)}`);
      return;
    }
    if (property === 'box-sizing') {
      hasBoxSizing = true;
    }
    updated.push(`${property}: ${value}`);
  });

  if (!hasPaddingLeft) {
    const base = paddingLeftBase ?? 0;
    updated.push(`padding-left: ${Math.round((base + paddingX) * 100) / 100}px`);
  }
  if (!hasPaddingRight) {
    const base = paddingRightBase ?? 0;
    updated.push(`padding-right: ${Math.round((base + paddingX) * 100) / 100}px`);
  }
  if (ensureBorderBox && !hasBoxSizing) {
    updated.push('box-sizing: border-box');
  }
  return `${updated.join('; ')};`;
}

function addPx(value, paddingX) {
  const match = /(-?\d+(\.\d+)?)px/.exec(value);
  if (!match) return value;
  const base = Number.parseFloat(match[1]);
  if (Number.isNaN(base)) return value;
  const total = Math.round((base + paddingX) * 100) / 100;
  return `${total}px`;
}

function addTableInset(style, paddingX) {
  if (paddingX === 0) return style;
  const declarations = style.split(';').map((item) => item.trim()).filter(Boolean);
  const updated = [];
  let hasMarginLeft = false;
  let hasMarginRight = false;
  let hasWidth = false;
  let hasBoxSizing = false;

  declarations.forEach((decl) => {
    const [prop, ...rest] = decl.split(':');
    if (!prop || rest.length === 0) {
      updated.push(decl);
      return;
    }
    const property = prop.trim();
    const value = rest.join(':').trim();
    if (property === 'margin-left') hasMarginLeft = true;
    if (property === 'margin-right') hasMarginRight = true;
    if (property === 'width') hasWidth = true;
    if (property === 'box-sizing') hasBoxSizing = true;
    updated.push(`${property}: ${value}`);
  });

  if (!hasMarginLeft) updated.push(`margin-left: ${paddingX}px`);
  if (!hasMarginRight) updated.push(`margin-right: ${paddingX}px`);
  if (!hasWidth) updated.push(`width: calc(100% - ${paddingX * 2}px)`);
  if (!hasBoxSizing) updated.push('box-sizing: border-box');
  return `${updated.join('; ')};`;
}

function parsePaddingShorthand(value) {
  const parts = value.split(/\s+/).map((part) => part.trim()).filter(Boolean);
  const pxValues = parts.map((part) => {
    const match = /(-?\d+(\.\d+)?)px/.exec(part);
    return match ? Number.parseFloat(match[1]) : 0;
  });

  if (pxValues.length === 1) {
    return { top: pxValues[0], right: pxValues[0], bottom: pxValues[0], left: pxValues[0] };
  }
  if (pxValues.length === 2) {
    return { top: pxValues[0], right: pxValues[1], bottom: pxValues[0], left: pxValues[1] };
  }
  if (pxValues.length === 3) {
    return { top: pxValues[0], right: pxValues[1], bottom: pxValues[2], left: pxValues[1] };
  }
  if (pxValues.length >= 4) {
    return { top: pxValues[0], right: pxValues[1], bottom: pxValues[2], left: pxValues[3] };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
