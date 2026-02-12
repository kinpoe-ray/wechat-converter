export async function copyHtmlToClipboard(html, previewEl, toast, duration, notify) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    showToast(toast, '✅ 已复制！粘贴到公众号即可', duration, notify);
  } catch (error) {
    const copied = fallbackCopyHtml(html) || fallbackCopy(previewEl);
    if (copied) {
      showToast(toast, '✅ 已复制（兼容模式）', duration, notify);
      return;
    }
    showToast(toast, '⚠️ 复制失败，请手动选择', duration, notify);
  }
}

export async function copyPlainToClipboard(text, toast, duration, notify) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(toast, '✅ 已复制纯文本', duration, notify);
  } catch (error) {
    showToast(toast, '⚠️ 复制失败，请手动选择', duration, notify);
  }
}

function fallbackCopy(previewEl) {
  if (!previewEl) return false;
  const range = document.createRange();
  range.selectNodeContents(previewEl);
  const selection = window.getSelection();
  if (!selection) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand('copy');
  selection.removeAllRanges();
  return copied;
}

function fallbackCopyHtml(html) {
  if (!html || typeof document === 'undefined') return false;
  const container = document.createElement('div');
  container.setAttribute('contenteditable', 'true');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.opacity = '0';
  container.innerHTML = html;
  document.body.appendChild(container);

  const selection = window.getSelection();
  if (!selection) {
    container.remove();
    return false;
  }
  const range = document.createRange();
  range.selectNodeContents(container);
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand('copy');
  selection.removeAllRanges();
  container.remove();
  return copied;
}

function showToast(toast, text, duration, notify) {
  if (typeof notify === 'function') {
    notify(text, duration);
    return;
  }
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
