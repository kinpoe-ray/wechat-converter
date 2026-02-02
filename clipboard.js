export async function copyHtmlToClipboard(html, previewEl, toast, duration) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
    showToast(toast, '✅ 已复制！粘贴到公众号即可', duration);
  } catch (error) {
    fallbackCopy(previewEl);
    showToast(toast, '✅ 已复制（兼容模式）', duration);
  }
}

export async function copyPlainToClipboard(text, toast, duration) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(toast, '✅ 已复制纯文本', duration);
  } catch (error) {
    showToast(toast, '⚠️ 复制失败，请手动选择', duration);
  }
}

function fallbackCopy(previewEl) {
  const range = document.createRange();
  range.selectNodeContents(previewEl);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
}

function showToast(toast, text, duration) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
