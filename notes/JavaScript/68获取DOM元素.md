---
title: 68获取DOM元素
category: JavaScript
tags: [DOM, querySelector, querySelectorAll]
date: 2026-04-13
description: 通过CSS选择器获取页面中的DOM元素
---

# 获取 DOM 元素

操作 DOM 的第一步：**获取元素**。

## 推荐方式：CSS 选择器

### `querySelector` — 获取单个

```javascript
// 获取第一个匹配的元素
const div = document.querySelector('div');          // 标签名
const box = document.querySelector('.box');          // 类名
const nav = document.querySelector('#nav');          // ID
const li  = document.querySelector('ul li:first-child'); // 伪类
```

> **返回**：DOM 对象（单个），找不到返回 `null`

### `querySelectorAll` — 获取多个

```javascript
// 获取所有匹配的元素（伪数组）
const lis = document.querySelectorAll('ul li');
console.log(lis);  // NodeList(5) [li, li, li, li, li]
```

> **返回**：NodeList（伪数组），没有 `push`/`pop` 等数组方法，但可以 `for` 循环遍历

## 两种方式对比

| 对比 | `querySelector` | `querySelectorAll` |
|------|----------------|-------------------|
| 返回数量 | **1个** | **所有**匹配元素 |
| 返回类型 | DOM 对象 | NodeList（伪数组） |
| 找不到时 | `null` | 空的 NodeList `[]` |
| 遍历 | 直接操作 | 需 `for` 循环 |

## 伪数组遍历

```javascript
const lis = document.querySelectorAll('ul li');

// ✅ for 循环遍历（推荐）
for (let i = 0; i < lis.length; i++) {
  lis[i].style.color = 'red';
}

// ❌ 不能直接操作伪数组
// lis.style.color = 'red';  // 报错！
```

## 了解即可：旧方式

```javascript
document.getElementById('nav')         // 通过ID
document.getElementsByClassName('box') // 通过类名（伪数组）
document.getElementsByTagName('div')   // 通过标签名（伪数组）
```

> 这些是旧语法，代码长且不统一，了解即可，**优先用 querySelector**。
