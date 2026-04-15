---
title: 01JavaScript简介
category: JavaScript
tags: [JavaScript, 入门, ECMAScript, DOM, BOM]
date: 2024-01-01
description: JavaScript入门简介，了解JS的作用、组成和基础语法
---

# JavaScript简介

## 一、什么是JavaScript

JavaScript（简称JS）是一种运行在**客户端（浏览器）**的编程语言，用于实现网页的**人机交互**。

### 对比其他前端技术

| 技术 | 类型 | 作用 |
|------|------|------|
| HTML | 标记语言 | 搭建网页结构 |
| CSS | 样式语言 | 美化网页外观 |
| **JavaScript** | **编程语言** | **实现网页交互** |

### JS的优势

- 无需配置环境，浏览器即可运行
- 比Java、Python等语言入门更简单

---

## 二、JavaScript能做什么

| 类别 | 示例 |
|------|------|
| 网页特效 | 下拉菜单、轮播图、动画效果 |
| 表单验证 | 手机号格式、邮箱格式验证 |
| 数据交互 | 从后台获取数据渲染页面 |
| 后端开发 | Node.js做服务器端开发 |

---

## 三、JavaScript组成

```
JavaScript
├── ECMAScript（ES）  → 规定基础语法（变量、数据类型、函数等）
├── DOM               → Document Object Model，操作网页文档
└── BOM               → Browser Object Model，操作浏览器窗口
```

### 1. ECMAScript（ES）
JS的**核心语法**，包括：
- 变量、数据类型
- 运算符、表达式
- 条件语句、循环语句
- 函数、对象

### 2. DOM（文档对象模型）
操作**网页元素**：
- 获取元素
- 修改元素内容
- 修改元素样式
- 添加/删除元素

### 3. BOM（浏览器对象模型）
操作**浏览器**：
- 弹出框
- 页面跳转
- 定时器

---

## 四、快速体验

### 效果
点击按钮，被点击的按钮变粉色。

### 代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>JS体验</title>
  <style>
    .pink {
      background-color: pink;
    }
  </style>
</head>
<body>
  <button>按钮1</button>
  <button>按钮2</button>
  <button>按钮3</button>
  <button>按钮4</button>

  <script>
    // 1. 获取所有按钮
    const btns = document.querySelectorAll('button');

    // 2. 遍历按钮，添加点击事件
    for (let i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function() {
        // 先清除所有按钮的粉色
        for (let j = 0; j < btns.length; j++) {
          btns[j].classList.remove('pink');
        }
        // 给当前点击的按钮添加粉色
        this.classList.add('pink');
      });
    }
  </script>
</body>
</html>
```

---

## 五、学习路线

```
第一阶段：基础语法
├── 变量与数据类型
├── 运算符与表达式
├── 条件语句（if、switch、三目）
├── 循环语句（for、while）
└── 函数

第二阶段：DOM操作
├── 获取元素
├── 修改元素内容
├── 修改元素样式
├── 事件（点击、鼠标、表单等）
└── 动画效果

第三阶段：高级应用
├── 事件委托
├── 动画与特效
├── 数据交互
└── 第三方框架
```

---

## 六、参考资料

- **MDN**（推荐）：https://developer.mozilla.org/zh-CN/
- 菜鸟教程：https://www.runoob.com/js/js-tutorial.html
