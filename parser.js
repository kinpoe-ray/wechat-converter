export const CONFIG = {
  HIGHLIGHT_MAX_LENGTH: 30,
  READ_SPEED: 400,
};

export const STYLES = {
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

export async function renderMermaidBlocks(markdown) {
  const blocks = [];
  const processed = markdown.replace(/```mermaid\s*([\s\S]*?)```/g, (match, code) => {
    const token = `{{MERMAID_${blocks.length}}}`;
    blocks.push({ token, code: sanitizeMermaid(code.trim()) });
    return token;
  });

  if (blocks.length === 0) {
    return { markdown: processed, images: [] };
  }

  const images = [];
  for (const block of blocks) {
    try {
      const svg = await renderMermaidSvg(block.code);
      const dataUrl = await svgToPngDataUrl(svg);
      images.push({ token: block.token, dataUrl });
    } catch (error) {
      images.push({ token: block.token, error: true });
    }
  }
  return { markdown: processed, images };
}

function sanitizeMermaid(code) {
  if (!code.includes('stateDiagram')) return code;

  const lines = code.split('\n');
  const header = lines[0] || 'stateDiagram-v2';
  const descMap = new Map();
  const kept = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*:\s*(.+)$/);
    if (match) {
      const name = match[1];
      const text = match[2].replace(/^•\s*/g, '');
      if (!descMap.has(name)) descMap.set(name, []);
      descMap.get(name).push(text);
    } else {
      kept.push(line);
    }
  }

  const stateLines = [];
  descMap.forEach((items, name) => {
    const body = [name, ...items].join('\\n');
    stateLines.push(`state "${body}" as ${name}`);
  });

  return [header, ...stateLines, ...kept].join('\n');
}

export function replaceMermaidTokens(html, images) {
  let result = html;
  images.forEach((item) => {
    const replacement = item.error
      ? '⚠️ Mermaid 渲染失败，请手动插入截图'
      : `<img src="${item.dataUrl}" alt="Mermaid Diagram" />`;
    result = result
      .replace(new RegExp(`<p>\\s*${item.token}\\s*<\\/p>`, 'g'), replacement)
      .replace(new RegExp(item.token, 'g'), replacement);
  });
  return result;
}

function renderMermaidSvg(code) {
  const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (window.mermaid && window.mermaid.render) {
    return window.mermaid.render(id, code).then((res) => res.svg);
  }
  return new Promise((resolve, reject) => {
    try {
      window.mermaid.mermaidAPI.render(id, code, (svg) => resolve(svg));
    } catch (err) {
      reject(err);
    }
  });
}

async function svgToPngDataUrl(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const viewBox = svgEl.getAttribute('viewBox');
  let width = parseInt(svgEl.getAttribute('width') || '800', 10);
  let height = parseInt(svgEl.getAttribute('height') || '450', 10);
  if (viewBox) {
    const parts = viewBox.split(' ').map(Number);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }

  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL('image/png');
}

export function applyInlineStyles(html) {
  let result = STYLE_TAGS.reduce((acc, tag) => {
    const regex = new RegExp(`<${tag}([ >])`, 'g');
    return acc.replace(regex, `<${tag} style="${STYLES[tag]}"$1`);
  }, html);

  result = result
    .replace(/<a /g, `<a style="${STYLES.a}" `)
    .replace(/<img /g, `<img style="${STYLES.img}" `);

  return result;
}

export function processNotionAside(html) {
  return html.replace(/<aside>([\s\S]*?)<\/aside>/gi, (match, content) => {
    const firstChar = content.trim()[0];
    const theme = CALLOUT_THEMES[firstChar] || CALLOUT_THEMES['💡'];
    const asideStyle = `background: ${theme.bg}; border-left: 4px solid ${theme.border}; border-radius: 6px; padding: 12px 16px; margin: 28px 0;`;
    const badgeStyle = `display:inline-block; font-size:12px; font-weight:bold; color:${theme.border}; border:1px solid ${theme.border}; border-radius:999px; padding:2px 8px; margin-right:8px;`;

    let cleanContent = content
      .replace(/^\s*(💡|💰|🎯|🧠|⚠️|🎲|ℹ️|✅|❗|📝)\s*/g, '$1 ')
      .replace(/\n{2,}/g, '<br>')
      .replace(/\n/g, ' ')
      .replace(/\*\*([^*]+)\*\*\s*[:：]/g, `<strong style="${STYLES.strong}">$1</strong>：`)
      .replace(/\*\*([^*]+)\*\*/g, `<strong style="${STYLES.strong}">$1</strong>`)
      .trim();

    return `<section style="${asideStyle}"><p style="${STYLES.p}; margin: 0;"><span style="${badgeStyle}">${theme.label}</span>${cleanContent}</p></section>`;
  });
}

export function fixPreCode(html) {
  return html.replace(
    /<pre style="([^"]+)">\s*<code style="[^"]+">/g,
    `<pre style="$1"><code style="${STYLES.codeInPre}">`
  );
}

export function processHighlightCards(html) {
  return html.replace(
    /<p style="[^"]*"><strong style="[^"]*">([^<]+)<\/strong><\/p>/g,
    (match, content) => {
      if (isHighlightCandidate(content)) {
        return `<p style="${STYLES.highlightCard}">${content}</p>`;
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
  const { markdown: processed, images } = await renderMermaidBlocks(normalized);
  let html = marked.parse(processed);
  html = replaceMermaidTokens(html, images);
  return html;
}

export async function getWeChatStyledHtml(markdown, marked) {
  const normalized = normalizeNotionMarkdown(markdown);
  const { markdown: processed, images } = await renderMermaidBlocks(normalized);
  let html = marked.parse(processed);
  html = replaceMermaidTokens(html, images);
  html = applyInlineStyles(html);
  html = processNotionAside(html);
  html = fixPreCode(html);
  html = processHighlightCards(html);
  html = fixColonSpacing(html);
  return html;
}
