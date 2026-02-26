#!/usr/bin/env python3
"""修复 P0 高优先级问题"""

import re

# 读取文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复 P0-1: 移除 user-scalable=no，改用 CSS 防止表单缩放
# 移除 maximum-scale=1.0, user-scalable=no
content = re.sub(
    r'maximum-scale=1\.0, user-scalable=no, ',
    '',
    content
)

# 修复 P0-2: 将 alert() 替换为 toast()
content = re.sub(
    r"alert\('请先输入Markdown内容'\)",
    "showToast('⚠️ 请先输入Markdown内容')",
    content
)

content = re.sub(
    r"alert\('输入为空，无法复制'\)",
    "showToast('⚠️ 输入为空，无法复制')",
    content
)

# 写入文件
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 修复完成:")
print("  - P0-1: 移除 user-scalable=no（无障碍问题）")
print("  - P0-2: 将 alert() 替换为 toast()（交互阻塞问题）")
