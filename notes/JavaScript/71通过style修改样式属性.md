---
title: 71通过style修改样式属性
category: JavaScript
tags: [DOM, style, CSS, 样式]
date: 2026-04-13
description: 通过JS的style属性修改元素样式
---

# 通过 style 修改样式

## 基本语法

```javascript
const box = document.querySelector('.box');

box.style.width = '300px';
box.style.height = '200px';
box.style.backgroundColor = 'hotpink';
box.style.border = '2px solid red';
```

> **语法**：`元素.style.样式名 = '值'`

## ⚠️ 三大注意点

### 1. 值必须是字符串，要加单位

```javascript
box.style.width = 300;      // ❌ 无效，没单位
box.style.width = '300px';  // ✅ 正确
```

### 2. 多词属性用小驼峰

```javascript
// CSS 中的写法        JS 中的写法
background-color   →   backgroundColor
font-size          →   fontSize
margin-top         →   marginTop
border-left-width  →   borderLeftWidth
```

> 去掉短横线，第二个单词首字母大写

### 3. 生成的是行内样式（权重最高）

```javascript
box.style.color = 'red';
// 等价于 <div style="color: red">
// 行内样式 > 内部样式表，只有 !important 能覆盖
```

## 案例：随机更换背景图

```javascript
// body 可直接用 document.body 获取
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const num = getRandom(1, 10);
document.body.style.backgroundImage = `url('./images/${num}.jpg')`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundRepeat = 'no-repeat';
```

## 适用场景

| 场景 | 推荐度 |
|------|--------|
| 修改少量样式 | ✅ 适合 |
| 修改大量样式 | ❌ 太繁琐，用 className 或 classList |
| 动态计算样式（如随机值） | ✅ 适合 |
