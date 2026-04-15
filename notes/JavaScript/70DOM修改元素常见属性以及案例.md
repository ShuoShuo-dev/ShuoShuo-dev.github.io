---
title: 70DOM修改元素常见属性以及案例
category: JavaScript
tags: [DOM, 属性, img, src]
date: 2026-04-13
description: 通过JS修改元素常见属性及随机图片案例
---

# DOM 修改元素常见属性

## 操作思路

```
HTML标签属性  ←→  DOM对象属性（一一对应）

<img src="1.jpg" alt="图片">  →  img.src / img.alt
<a href="https://..." title="链接"> → a.href / a.title
<input type="text" disabled>  →  input.type / input.disabled
```

> **语法**：`元素.属性名 = '新值'`

## 常见属性

| 元素 | 属性 | 作用 |
|------|------|------|
| 所有元素 | `id` / `className` / `title` | 标识/类名/提示 |
| `<img>` | `src` / `alt` | 图片路径/替代文字 |
| `<a>` | `href` / `target` | 链接地址/打开方式 |
| `<input>` | `type` / `value` / `disabled` | 类型/值/禁用 |
| `<div>` | `style` / `innerHTML` | 样式/内容 |

---

## 案例：随机图片

### 需求
点击按钮，随机切换图片。

### 完整代码

```javascript
// 1. 随机数函数
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 2. 获取元素
const img = document.querySelector('img');

// 3. 随机切换图片
function randomImg() {
  const num = getRandom(1, 6);
  img.src = `./images/${num}.jpg`;
  img.title = `第${num}张图片`;
}
```

### 执行流程

```
点击按钮 → getRandom(1,6) → 得到随机数 3
→ img.src = './images/3.jpg' → 页面图片自动更新
```

> **注意**：修改 `src` 时路径格式要和原始路径一致（相对路径/绝对路径）。
