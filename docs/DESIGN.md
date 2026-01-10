# Markdown → 公众号格式转换器 - 完整设计文档

## 项目概述

### 目标
将 Markdown 格式内容转换为微信公众号编辑器兼容的富文本格式，解决公众号编辑器剥离 CSS 类导致的样式丢失问题。

### 核心挑战
微信公众号编辑器会剥离所有 CSS 类名，只保留内联样式（inline styles），这导致传统的 CSS 类方案完全失效。

### 解决方案
采用"双轨制"渲染策略：
- **预览区**：使用 CSS 类 + `marked.js` 渲染，提供实时预览
- **复制逻辑**：使用 `getWeChatStyledHtml()` 函数将所有样式转换为内联样式

---

## 技术架构

### 前端技术栈
```
- 纯 HTML/CSS/JavaScript (无框架依赖)
- marked.js (Markdown 解析)
- 双主题系统 (浅色/深色模式)
- CSS 变量驱动的主题切换
```

### 部署环境
- **生产环境**: Vercel (https://wechat-converter.vercel.app)
- **代码仓库**: GitHub (github.com/kinpoe-ray/wechat-converter)
- **自动部署**: Git push → Vercel 自动构建

---

## 核心功能模块

### 1. Markdown 解析与预览
```javascript
// 使用 marked.js 实时解析
input.addEventListener('input', () => {
    const html = marked.parse(input.value);
    preview.innerHTML = html;
    processHighlightSentences(); // 处理高亮卡片
});
```

**支持的 Markdown 元素**:
- 标题 (H1-H4)
- 段落、加粗、斜体、删除线
- 列表 (有序/无序)
- 引用块
- 代码块 (语法高亮)
- 表格
- 分割线
- 图片
- 链接

### 2. Notion 兼容性

#### Aside/Callout 元素
```html
<!-- Notion 输入 -->
<aside>
💡
**提示**：这是一个重要提示
</aside>

<!-- 转换为 -->
<section style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px;">
  <p>💡 <strong>提示</strong>：这是一个重要提示</p>
</section>
```

**动态样式映射**:
- `💡` / "提示" / "TIP" → 黄色 (#fef3c7)
- `⚠️` / "警告" / "WARNING" → 红色 (#fee2e2)
- 默认 → 蓝色 (#f0f9ff)

### 3. 内联样式生成 (核心)

`getWeChatStyledHtml()` 函数负责将 HTML 转换为带内联样式的版本：

```javascript
function getWeChatStyledHtml() {
    let html = marked.parse(markdown);
    
    // 1. 标签替换（添加内联样式）
    html = html
        .replace(/<h2>/g, `<h2 style="color: #3b82f6; margin: 36px 0 20px 0;">`)
        .replace(/<p>/g, `<p style="margin: 24px 0; line-height: 1.85;">`)
        // ... 更多替换
    
    // 2. 处理 Notion aside
    html = html.replace(/<aside>([\s\S]*?)<\/aside>/gi, (match, content) => {
        // 根据 emoji 选择样式
        // 清理换行，保持紧凑
        return `<section style="...">${cleanContent}</section>`;
    });
    
    // 3. 修复冒号换行
    html = html.replace(/<\/strong>\s*([:：])/g, '</strong>$1');
    
    // 4. 高亮卡片条件判断
    html = html.replace(/<p ...><strong ...>([^<]+)<\/strong><\/p>/g, (match, text) => {
        if (text.length <= 30 && !text.includes('：') && !text.includes(':')) {
            return `<p style="...highlight card...">${text}</p>`;
        }
        return match;
    });
    
    return html;
}
```

### 4. 高亮卡片智能识别

**规则**:
- 段落中只有一个 `<strong>` 元素
- 内容 ≤ 30 字
- 不包含冒号（`:` 或 `：`）

**示例**:
```markdown
**核心观点**        → 高亮卡片 ✅
**选项 A**：内容    → 普通加粗 ✅ (有冒号)
团队重建了 **4 次** → 保持内联 ✅ (句中)
```

---

## 样式设计系统

### 间距规范 (24px 体系)

| 元素 | 上边距 | 下边距 | 设计意图 |
|------|--------|--------|----------|
| H2 标题 | 36px | 20px | 章节分隔 |
| H3 标题 | 32px | 16px | 子章节 |
| 段落 p | 24px | 24px | 呼吸感 |
| 列表 ul/ol | 24px | 24px | 与段落对齐 |
| Callout | 28px | 28px | 视觉突出 |
| 引用块 | 28px | 28px | 独立性 |
| 代码块 | 24px | 24px | 清晰边界 |

### 颜色体系

```css
/* 主题色 */
--primary: #3b82f6;        /* 标题、链接、边框 */
--text-primary: #333;      /* 正文 */
--text-secondary: #57606a; /* 引用、次要文本 */
--code-bg: #f1f5f9;        /* 代码背景 */
--code-color: #be185d;     /* 代码文字 */

/* Callout 颜色 */
--tip-bg: #fef3c7;         /* 提示背景 */
--tip-border: #f59e0b;     /* 提示边框 */
--warn-bg: #fee2e2;        /* 警告背景 */
--warn-border: #ef4444;    /* 警告边框 */
```

---

## 关键设计决策

### 1. 为什么使用内联样式？
- **微信限制**: 公众号编辑器剥离所有 CSS 类
- **必然选择**: 内联样式是唯一能保留的样式方式

### 2. 为什么预览和复制分开处理？
- **性能考虑**: 预览使用 CSS 类更快，避免每次输入都生成大量内联样式
- **用户体验**: 预览需要即时响应，复制只执行一次

### 3. 为什么选择 24px 间距？
- **公众号内容创作者视角**: 手机端阅读需要更大留白
- **数据支撑**: 24px 比 12px/16px 提供明显更好的可读性
- **层次分明**: 配合 28px (Callout)、36px (H2) 形成清晰层次

### 4. Callout 为什么要紧凑？
- **视觉平衡**: 大间距的正文 + 紧凑的强调框 = 对比突出
- **信息密度**: emoji + 内容同行，减少垂直空间浪费

---

## 已解决的核心问题

### 问题 1: 预览与复制不同步 ⚠️

**现象**: 用户修改代码后，预览区看起来"没变化"

**根因**:
```
预览区 CSS:  #preview p { margin: 12px 0; }
复制逻辑 JS: p: 'margin: 20px 0; ...'
```

**解决方案**: 强制同步预览 CSS 和 JS 内联样式
```css
#preview p {
    margin: 24px 0;
    line-height: 1.85;
    text-align: justify;
    letter-spacing: 0.5px;
}
```

### 问题 2: Aside emoji 与内容分离

**现象**:
```
💰

**成本差距惊人**：...
```

**根因**: Notion 复制的 Markdown 中 emoji 后有双换行符

**解决方案**:
```javascript
cleanContent = content
    .replace(/^\s*(💡|⚠️|ℹ️)\s*/g, '$1 ')  // emoji 后只保留一个空格
    .replace(/\n{2,}/g, '<br>')             // 双换行变单 <br>
    .replace(/\n/g, ' ')                    // 单换行变空格
```

### 问题 3: 冒号被换行

**现象**: `**选项 A**：内容` → "选项 A" 和 "：" 被分到两行

**根因**: Markdown 解析后 `</strong>` 和 `：` 之间有空格/换行

**解决方案**:
```javascript
// 全局清理
html = html.replace(/<\/strong>\s*([:：])/g, '</strong>$1');

// Aside 内特殊处理
.replace(/\*\*([^*]+)\*\*\s*[:：]/g, '<strong>$1</strong>：')
```

### 问题 4: 句中加粗变卡片

**现象**: "团队重建了 **4 次** 框架" 中的 "4 次" 被误识别为高亮卡片

**根因**: 旧逻辑只判断 `p > strong:only-child`

**解决方案**: 条件判断
```javascript
if (content.length <= 30 && !content.includes('：') && !content.includes(':')) {
    return highlightCard;
}
return match; // 保持原样
```

---

## 代码结构

### 文件组织
```
index.html (单文件应用)
├── <head>
│   ├── Meta 标签 (viewport, theme-color)
│   ├── <style> 预览区 CSS
│   └── 外部依赖: marked.js
├── <body>
│   ├── Header (标题 + 切换按钮)
│   ├── Container
│   │   ├── Panel Input (Markdown 输入)
│   │   └── Panel Preview (HTML 预览)
│   └── FAB Buttons (复制、回顶)
└── <script>
    ├── 主题切换逻辑
    ├── Markdown 实时预览
    ├── getWeChatStyledHtml() 核心转换
    ├── copyToClipboard() 复制逻辑
    ├── processHighlightSentences() 高亮识别
    └── FAB 显隐控制
```

### 关键变量
```javascript
const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('theme-toggle');
```

### 核心函数调用链
```
用户输入 Markdown
    ↓
input.addEventListener('input')
    ↓
marked.parse(markdown) → HTML
    ↓
preview.innerHTML = HTML
    ↓
processHighlightSentences() → 添加 .highlight-card
    ↓
[用户点击复制]
    ↓
getWeChatStyledHtml()
    ↓
    ├─ 标签替换 (添加内联样式)
    ├─ Aside 处理 (emoji + 紧凑)
    ├─ 冒号修复
    └─ 高亮卡片条件判断
    ↓
Clipboard API → 复制到剪贴板
```

---

## 测试与验证

### 浏览器兼容性
- ✅ Chrome/Edge (主要测试)
- ✅ Safari (深色模式适配)
- ✅ Firefox
- ⚠️ 移动端 (响应式布局)

### 验证流程
1. 本地修改 `index.html`
2. `git add && git commit && git push`
3. Vercel 自动部署 (30-60s)
4. 浏览器硬刷新 (Cmd+Shift+R)
5. 输入测试内容验证

### 测试用例
```markdown
## 标题测试

段落间距测试。这是第一段。

这是第二段，检查 24px 间距。

**核心观点**

**选项 A**：这是一个定义项

<aside>
💰
**成本差距惊人**：10 倍差异！
</aside>

- 列表项 1
- 列表项 2

但这条路也不容易——Manus 团队重建了 **4 次** Agent 框架。
```

---

## 维护指南

### 修改样式
1. **预览区**: 修改 `<style>` 中的 `#preview` 选择器
2. **复制逻辑**: 修改 `getWeChatStyledHtml()` 中的 `styles` 对象
3. **⚠️ 必须同步**: 确保两处样式值完全一致

### 添加新元素支持
1. 在 `styles` 对象中添加新样式定义
2. 在 `html.replace()` 链中添加对应替换
3. 在预览 CSS 中添加对应样式
4. 测试验证

### 调试技巧
```javascript
// 查看生成的内联样式 HTML
console.log(getWeChatStyledHtml());

// 检查预览元素计算样式
const p = document.querySelector('#preview p');
console.log(window.getComputedStyle(p).margin);
```

---

## 部署信息

- **线上地址**: https://wechat-converter.vercel.app
- **仓库地址**: https://github.com/kinpoe-ray/wechat-converter
- **最新提交**: `c5fb272` - sync preview CSS with copy logic

---

## 未来优化方向

1. **支持更多 Notion 块**: Toggle、Database、Callout 变体
2. **自定义主题**: 用户可配置颜色方案
3. **模板系统**: 预设常用文章结构
4. **导出功能**: 支持导出为 PDF/图片
5. **性能优化**: 大文档的渲染性能
