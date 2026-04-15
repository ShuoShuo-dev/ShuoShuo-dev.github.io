---
title: 86环境对象this以及回调函数
category: JavaScript
tags: [this, 回调函数, 作用域]
date: 2026-04-14
description: this的指向规则和回调函数的概念
---

# 环境对象 this + 回调函数

## this 是什么

`this` 是函数内部的特殊变量，代表**函数运行时所在的环境（调用者）**。

## this 指向规则

| 场景 | this 指向 | 示例 |
|------|----------|------|
| 普通函数 | `window` | `function fn() { console.log(this); }` |
| 事件回调 | **事件源**（触发事件的元素） | `btn.onclick = function() { this → btn }` |
| 对象方法 | **对象本身** | `obj.fn()` → `this → obj` |
| 定时器回调 | `window` | `setInterval(fn, 1000)` → `this → window` |
| 箭头函数 | **外层 this** | 继承外层作用域的 this |

```javascript
// 1. 普通函数 → window
function fn() {
  console.log(this);  // window
}
fn();

// 2. 事件回调 → 事件源（重点！）
const btn = document.querySelector('button');
btn.addEventListener('click', function() {
  console.log(this);       // → <button>...</button>
  this.style.color = 'red'; // ✅ this 就是按钮本身
});

// 3. 对象方法 → 对象
const obj = {
  name: '张三',
  sayHi() {
    console.log(this.name);  // this → obj
  }
};
obj.sayHi();  // '张三'
```

## 实用技巧：用 this 简化代码

```javascript
// ❌ 不用 this：需要知道具体变量名
const btn = document.querySelector('button');
btn.addEventListener('click', function() {
  btn.style.color = 'red';
  btn.style.backgroundColor = 'pink';
});

// ✅ 用 this：简洁
btn.addEventListener('click', function() {
  this.style.color = 'red';
  this.style.backgroundColor = 'pink';
});
```

---

## 回调函数

### 什么是回调函数

> 把函数 A 作为参数传给函数 B，**函数 A 就是回调函数**

```javascript
// 函数 B（接收回调）
function B(callback) {
  callback();  // 在某个时机"回头调用"
}

// 函数 A（回调函数）
function A() {
  console.log('我是回调函数');
}

B(A);  // A 作为参数传给 B
```

### 常见回调场景

| 场景 | 回调函数 |
|------|----------|
| `setTimeout(fn, 1000)` | `fn` 是回调 |
| `setInterval(fn, 1000)` | `fn` 是回调 |
| `btn.addEventListener('click', fn)` | `fn` 是回调 |
| `arr.forEach(fn)` | `fn` 是回调 |

### 特点

```javascript
// 回调函数不会立即执行，等条件满足才执行
setTimeout(function() {
  console.log('1秒后才执行');  // 不会立即执行
}, 1000);

// 通常用匿名函数
btn.addEventListener('click', function() {
  // 这个匿名函数就是回调函数
});
```
