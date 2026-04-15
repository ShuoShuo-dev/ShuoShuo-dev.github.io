---
title: 73通过classList修改样式
category: JavaScript
tags: [DOM, classList, CSS, toggle]
date: 2026-04-13
description: 使用classList操作类名，解决className覆盖问题
---

# 通过 classList 修改样式

> **classList** 是操作类名的**终极方案**，不会覆盖已有类名。

## 三个方法

| 方法 | 作用 | 示例 |
|------|------|------|
| `add('类名')` | **追加**类名 | `el.classList.add('active')` |
| `remove('类名')` | **删除**类名 | `el.classList.remove('active')` |
| `toggle('类名')` | **切换**（有则删，无则加） | `el.classList.toggle('dark')` |

## 基本使用

```javascript
const box = document.querySelector('.box');

// ✅ 追加类名，不影响原有类名
box.classList.add('active');
// <div class="box active">

box.classList.add('rounded');
// <div class="box active rounded">

// ✅ 删除类名
box.classList.remove('active');
// <div class="box rounded">
```

## toggle 切换（重点）

```javascript
// 第一次调用：没有 active → 添加
box.classList.toggle('active');  // 添加了

// 第二次调用：有 active → 删除
box.classList.toggle('active');  // 删除了
```

### 实战：开关灯效果

```javascript
const btn = document.querySelector('button');
btn.addEventListener('click', function() {
  document.body.classList.toggle('dark');
});
```

```css
.dark { background: #000; color: #fff; }
```

## 三种方式对比

| 方式 | 覆盖问题 | 适用场景 | 推荐度 |
|------|----------|----------|--------|
| `style` | 无（只改指定属性） | 少量样式/动态值 | ⭐⭐ |
| `className` | ⚠️ **覆盖所有类名** | 简单场景 | ⭐ |
| `classList` | ✅ **不影响已有类名** | **首选** | ⭐⭐⭐ |

## 最佳实践

```javascript
// ❌ 不推荐：style 一行行写
box.style.width = '300px';
box.style.height = '200px';
box.style.backgroundColor = 'pink';

// ❌ 不推荐：className 会覆盖
box.className = 'active';

// ✅ 推荐：classList 追加，不影响其他类名
box.classList.add('active');
box.classList.remove('hidden');
box.classList.toggle('dark');
```
