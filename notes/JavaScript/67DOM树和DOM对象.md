---
title: 67DOM树和DOM对象
category: JavaScript
tags: [DOM, DOM树, 文档对象模型]
date: 2026-04-13
description: DOM的概念、DOM树结构和DOM对象的基本理解
---

# DOM 树和 DOM 对象

## 什么是 DOM

**DOM**（Document Object Model）= **文档对象模型**

> 用 JS 去操作 HTML 标签的一套 API

```
JS 组成：
├── ECMAScript（语法：变量、函数、循环...）
└── Web API
    ├── DOM（操作页面内容）  ← 本课重点
    └── BOM（操作浏览器）
```

## DOM 树

浏览器将 HTML 文档解析成**树状结构**：

```
            document
               │
            ┌──┴──┐
           html  （根元素）
          ┌─┴─┐
        head  body
        │     ├─ div
        title  ├─ p
               └─ img
```

- **document** 是最大的对象，代表整个网页
- 每个标签对应一个**DOM 对象**
- DOM 对象有**属性**和**方法**，用来操作标签

## DOM 能做什么

| 操作 | 说明 | 示例 |
|------|------|------|
| 获取元素 | 找到页面中的标签 | `document.querySelector('div')` |
| 修改内容 | 改标签里的文字 | `div.innerHTML = '新内容'` |
| 修改样式 | 改标签的 CSS | `div.style.color = 'red'` |
| 增删节点 | 添加/删除标签 | `document.createElement('div')` |
| 绑定事件 | 监听用户操作 | `div.addEventListener('click', fn)` |

## 核心理解

```
HTML标签  ←→  JS对象（DOM对象）

<p class="box">你好</p>  ←→  { className: 'box', innerHTML: '你好', ... }

改对象属性 = 改标签表现
```

> **记住**：JS 里的 DOM 操作，本质就是操作对象。
