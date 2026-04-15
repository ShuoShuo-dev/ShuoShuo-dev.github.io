---
title: 69修改DOM元素以及年会抽奖案例
category: JavaScript
tags: [DOM, innerHTML, innerText, 随机数]
date: 2026-04-13
description: 修改元素内容和年会抽奖案例实现
---

# 修改 DOM 元素内容 + 年会抽奖

## 修改内容

### `innerText` — 纯文本

```javascript
const div = document.querySelector('.box');
div.innerText = '<strong>加粗</strong>';
// 页面显示：<strong>加粗</strong>（原样显示，不解析标签）
```

### `innerHTML` — 解析 HTML（常用）

```javascript
const div = document.querySelector('.box');
div.innerHTML = '<strong>加粗</strong>';
// 页面显示：**加粗**（解析为HTML标签）
```

| 属性 | 解析标签 | 使用场景 |
|------|----------|----------|
| `innerText` | ❌ 不解析 | 只改文字 |
| `innerHTML` | ✅ 解析 | 写入HTML结构（推荐） |

## 读取内容

```javascript
div.innerText   // 只读文字（不含隐藏元素）
div.innerHTML   // 读取HTML（包含标签）
```

---

## 年会抽奖案例

### 需求
从数组中随机抽取一、二、三等奖，**不重复**。

### 完整代码

```javascript
// 1. 准备数据
const persons = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];

// 2. 获取元素
const one = document.querySelector('.one');
const two = document.querySelector('.two');
const three = document.querySelector('.three');

// 3. 抽奖函数（随机 + 删除，保证不重复）
function draw(arr, element) {
  const random = Math.floor(Math.random() * arr.length);
  const name = arr[random];
  element.innerText = name;
  arr.splice(random, 1);  // 从数组中删除，防止重复
}

// 4. 依次抽取
draw(persons, one);    // 一等奖
draw(persons, two);    // 二等奖
draw(persons, three);  // 三等奖
```

### 核心思路

```
随机下标 → 取名字 → 渲染 → 从数组中删除（防重复）
```

> `splice(start, count)` 会**修改原数组**，抽过的名字被移除，下次不会再抽到。
