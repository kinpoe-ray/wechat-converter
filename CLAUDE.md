# CLAUDE.md - WeChat Converter

**继承自父目录**: `/Users/ray/1-Projects/VibeCodingSpace/CLAUDE.md`

---

## 项目上下文

**项目名称**: Markdown → 微信公众号格式转换器
**线上地址**: https://wechat-converter.vercel.app
**代码仓库**: https://github.com/kinpoe-ray/wechat-converter.git
**技术栈**: 纯静态单页应用 (HTML + Vanilla JS + marked.js)
**核心功能**: Markdown 转带内联样式的富文本 HTML，可直接粘贴到微信公众号编辑器

**最新提交**: `c5fb272` - sync preview CSS with copy logic
**开发状态**: ✅ 核心功能完成，持续优化中

---

## 项目架构

```
wechat-converter/
├── .git/                        # Git 仓库
├── index.html                   # 单页应用（1397行，HTML + CSS + JS）
├── CLAUDE.md                    # 项目上下文（本文件）
└── docs/
    ├── DESIGN.md                # 完整设计文档（394行）
    └── CLAUDE_CODE_GUIDE.md     # Claude Code 扩展系统指南
```

**架构特点**:
- 零依赖服务器，浏览器直接打开即可使用
- CDN 引入 `marked.js` 解析 Markdown
- 内联样式确保微信公众号编辑器兼容性
- 响应式设计（桌面/平板/移动端）
- Vercel 自动部署（Git push → 30-60s → 生产环境）

---

## 核心挑战与解决方案

### 挑战：微信公众号编辑器剥离 CSS 类

```
用户粘贴传统 HTML
    ↓
微信后台处理: 删除所有 <style> 标签和 class 属性
    ↓
结果: 样式全丢，排版崩溃 ❌
```

### 解决：双轨制渲染

```
┌─────────────────────────────────────────┐
│  用户输入 Markdown                       │
└──────────────┬──────────────────────────┘
               ▼
       marked.parse() → HTML
               │
       ┌───────┴────────┐
       ▼                ▼
   预览轨道          复制轨道
   (CSS 类)       (内联样式)
   实时显示         一次生成
       │                │
       ▼                ▼
   浏览器预览      剪贴板 API
                        │
                        ▼
                  微信公众号编辑器
                   (样式保留 ✅)
```

**关键设计**:
- 预览区：用 CSS 类快速渲染（性能优先）
- 复制时：`getWeChatStyledHtml()` 生成内联样式（兼容性优先）
- 两者必须同步（同样式值）

---

## 核心实现

### 1. Markdown 解析流程

```javascript
input.addEventListener('input', () => {
    const markdown = input.value;
    preview.innerHTML = marked.parse(markdown);
    processHighlightSentences();  // 智能识别高亮卡片
});
```

### 2. 样式系统（24px 间距体系）

| 元素 | 样式特点 | 设计意图 |
|------|----------|----------|
| **H2 标题** | 蓝色 + 下划线 (`border-bottom: 2px solid #3b82f6`) | 章节分隔 |
| **H3 标题** | 左侧蓝条 (`border-left: 4px solid #3b82f6`) | 子章节 |
| **段落** | 24px 上下边距，1.85 行高 | 呼吸感，移动端可读 |
| **高亮卡片** | 居中蓝色背景 (≤30字 且 无冒号) | 核心观点突出 |
| **代码块** | 暗色主题 (`#1e293b`) | 技术内容区分 |
| **Callout** | emoji 自动识别（💡/⚠️/ℹ️） | Notion 兼容 |

### 3. 高亮卡片智能识别

**规则** (`index.html:1024-1033`):
```javascript
// 条件：独立段落 + 短内容 + 无冒号
if (content.length <= 30 &&
    !content.includes('：') &&
    !content.includes(':')) {
    return `<p style="${styles.highlightCard}">${content}</p>`;
}
return match;  // 保持普通加粗
```

**效果**:
```markdown
**核心观点**           → 高亮卡片 ✅
**选项 A**：内容       → 普通加粗 ✅ (有冒号)
团队重建了 **4 次**    → 保持内联 ✅ (句中加粗)
```

### 4. Notion Callout 支持

**输入** (`<aside>` 标签):
```html
<aside>
💡
**提示**：这是重要信息
</aside>
```

**输出** (内联样式):
```html
<section style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px;">
  <p>💡 <strong>提示</strong>：这是重要信息</p>
</section>
```

**样式映射**:
- `💡` / "提示" / "TIP" → 黄色背景
- `⚠️` / "警告" / "WARNING" → 红色背景
- 默认 → 蓝色背景

---

## 已解决的关键问题

### 问题 1: 预览与复制不同步

**现象**: 修改代码后预览看起来没变化

**根因**:
```css
/* 预览 CSS */
#preview p { margin: 12px 0; }

/* 复制逻辑 */
p: 'margin: 20px 0; ...'
```

**解决**: 强制同步为 24px（commit `c5fb272`）

---

### 问题 2: Aside emoji 与内容分离

**现象**:
```
💰

**成本差距惊人**：...
```

**根因**: Notion 导出的 Markdown 中 emoji 后有 `\n\n`

**解决**:
```javascript
cleanContent = content
    .replace(/^\s*(💡|⚠️|ℹ️)\s*/g, '$1 ')  // emoji 后只留一个空格
    .replace(/\n{2,}/g, '<br>')            // 双换行 → 单 <br>
    .replace(/\n/g, ' ')                   // 单换行 → 空格
```

---

### 问题 3: 冒号被换行

**现象**: `**选项 A**：内容` → "选项 A" 和 "：" 分到两行

**根因**: Markdown 解析后 `</strong>` 和 `：` 之间有空格

**解决**:
```javascript
// 全局清理
html = html.replace(/\<\/strong\>\s*([:：])/g, '</strong>$1');
```

---

### 问题 4: 句中加粗被误判为高亮卡片

**现象**: "团队重建了 **4 次** 框架" 中的 "4 次" 变成卡片

**根因**: 旧逻辑只判断 `p > strong:only-child`

**解决**: 加条件判断（长度 ≤ 30 且无冒号）

---

## 继承的设计原则

### Good Taste 实践

✅ **消除特殊分支**: 高亮卡片通过条件前置，避免 if/else 嵌套
```javascript
// 好品味：条件即边界
if (符合高亮条件) return highlight;
return normal;  // 默认即正确
```

✅ **数据驱动**: `styles` 对象集中管理，修改一处即可
```javascript
const styles = {
    h2: '...',
    p: '...',
    // 所有样式集中定义
};
```

✅ **单一职责**:
- `getWeChatStyledHtml()` - 生成内联样式 HTML
- `copyToClipboard()` - 复制到剪贴板
- `processHighlightSentences()` - 识别高亮卡片

### 实用主义体现

✅ **单文件架构**: 1397 行可接受（零依赖、秒启动）
✅ **双轨渲染**: 性能与兼容性分离，各司其职
✅ **错误降级**: Clipboard API 失败 → `execCommand` 兜底

### 当前可优化点

⚠️ **函数过长**: `getWeChatStyledHtml()` 130 行
```javascript
// 建议拆分为：
function getWeChatStyledHtml() {
    let html = marked.parse(markdown);
    html = applyInlineStyles(html);      // 标签替换
    html = processNotionAside(html);     // Aside 处理
    html = processHighlightCards(html);  // 高亮卡片
    html = fixColonWrapping(html);       // 冒号修复
    return html;
}
```

⚠️ **重复模式**: 多个 `.replace()` 可提取工具函数
```javascript
function injectStyle(html, tag, style) {
    return html.replace(
        new RegExp(`<${tag}>`, 'g'),
        `<${tag} style="${style}">`
    );
}
```

⚠️ **Magic Number**: `30`, `24px`, `80` 应提取为常量
```javascript
const HIGHLIGHT_MAX_LENGTH = 30;
const SPACING_PARAGRAPH = '24px';
const SWIPE_THRESHOLD = 80;
```

---

## 代码质量现状

| 指标 | 当前值 | 目标 | 状态 | 备注 |
|------|--------|------|------|------|
| **文件行数** | 1397 | <800 | ⚠️ 超标 | 可接受（单文件性质） |
| **最长函数** | ~130行 | <20行 | ❌ 严重 | 需拆分 `getWeChatStyledHtml()` |
| **嵌套层级** | 3层 | <3层 | ✅ 合格 | - |
| **重复逻辑** | 多个 replace | - | ⚠️ 中等 | 可提取工具函数 |
| **测试覆盖** | 无 | - | ❌ 缺失 | 手动测试为主 |

---

## 开发指南

### 本地运行

```bash
# 方式1: 直接打开（最简单）
open index.html

# 方式2: 本地服务器（避免 CORS）
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 部署流程

```bash
# 1. 修改代码
vim index.html

# 2. 提交
git add .
git commit -m "feat: 功能描述"
git push origin main

# 3. 等待部署（30-60s）
# Vercel 自动部署到 https://wechat-converter.vercel.app

# 4. 验证
# 浏览器硬刷新 (Cmd+Shift+R)
```

### 修改样式

**1. 预览区样式**:
```css
/* 位置: <style> 标签中的 #preview 选择器 */
#preview p {
    margin: 24px 0;        /* 修改这里 */
    line-height: 1.85;
}
```

**2. 复制逻辑样式**:
```javascript
/* 位置: getWeChatStyledHtml() 的 styles 对象 */
const styles = {
    p: 'margin: 24px 0; ...',  // 必须与上面同步
};
```

**⚠️ 关键**: 两处样式值必须完全一致！

### 添加新 Markdown 语法支持

1. 在 `styles` 对象中添加新样式定义
2. 在 `html.replace()` 链中添加对应替换
3. 在预览 CSS 中添加对应样式
4. 测试验证

---

## 测试用例

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

`行内代码` 测试

```python
# 代码块测试
def hello():
    print("Hello")
```
```

---

## 项目哲学

### 1. 约束驱动设计
**微信的限制 = 创新的方向**
- 不能用 CSS 类 → 内联样式成为唯一解
- 约束让方案更简单、更直接

### 2. 分离的智慧
**预览和输出是两个问题**
- 预览优化性能（CSS 类）
- 输出保证兼容（内联样式）
- 好设计不追求统一，而是各司其职

### 3. 24px 的哲学
**留白不是浪费，而是尊重读者的眼睛**
- 手机屏幕小，密集文字产生焦虑
- 24px 提供舒适的阅读体验
- 设计服务于人的生理和心理

### 4. 单文件的勇气
**实用主义 > 理论完美**
- 用户 `open index.html` 即可用
- 无需 `npm install`、构建工具
- 1397 行可读、可维护

---

## 相关文档

- **设计文档**: `docs/DESIGN.md` - 完整技术设计与问题解决方案
- **Claude Code 指南**: `docs/CLAUDE_CODE_GUIDE.md` - 扩展系统教程
- **线上地址**: https://wechat-converter.vercel.app
- **代码仓库**: https://github.com/kinpoe-ray/wechat-converter

---

## 快速诊断

**遇到问题？**

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 预览和复制样式不一致 | CSS 和 JS 样式值不同步 | 检查 `#preview p` 和 `styles.p` |
| 高亮卡片误判 | 条件判断逻辑问题 | 检查长度和冒号判断 |
| Aside 格式错乱 | Notion 导出的换行符 | 检查 `cleanContent` 逻辑 |
| 部署后看不到更新 | 浏览器缓存 | Cmd+Shift+R 硬刷新 |

---

**记忆继承**: 三层认知架构（现象/本质/哲学）、Good Taste 原则、实用主义、简洁性铁律

**最后更新**: 2026-01-10
