---
title: 85事件对象event以及常见属性
category: JavaScript
tags: []
date: 2026-04-14
description: 
---

## 事件对象

### 什么是事件对象

当事件发生时，会产生一个**事件对象**（Event Object），它包含了与该事件相关的所有信息。

```javascript
element.addEventListener('click', function(e) {
    console.log(e);  // 事件对象
});
```

### 事件对象的获取方式

```javascript
// 方式1：给事件处理函数添加形参
div.addEventListener('click', function(e) {
    console.log(e);
});

// 方式2：使用 window.event（兼容性）
div.onclick = function() {
    var e = window.event;
    console.log(e);
}
```

### 事件对象常见属性

| 属性 | 说明 |
|------|------|
| `e.target` | 触发事件的**目标元素** |
| `e.currentTarget` | 绑定事件的元素（与 this 相同） |
| `e.type` | 事件的类型（如 'click'） |
| `e.clientX` | 鼠标相对**可视区**的 X 坐标 |
| `e.clientY` | 鼠标相对**可视区**的 Y 坐标 |
| `e.pageX` | 鼠标相对**页面**的 X 坐标 |
| `e.pageY` | 鼠标相对**页面**的 Y 坐标 |
| `e.key` | 按下的键值 |
| `e.preventDefault()` | 阻止默认行为 |
| `e.stopPropagation()` | 阻止事件冒泡 |

### target vs currentTarget

```javascript
ul.addEventListener('click', function(e) {
    // e.target 是实际点击的元素（可能是 li）
    console.log('点击了:', e.target.textContent);
    
    // e.currentTarget 是绑定事件的元素（ul）
    console.log('绑定事件的元素:', e.currentTarget);
    
    // this 等于 currentTarget
    console.log(this === e.currentTarget);  // true
});
```

### 案例：点击哪个按钮

```javascript
const buttons = document.querySelectorAll('button');

buttons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        // this 是绑定事件的按钮
        console.log('this:', this.textContent);
        
        // e.target 是实际点击的元素
        console.log('target:', e.target.textContent);
        
        // 获取自定义属性
        console.log('data-id:', e.target.dataset.id);
    });
});
```

### 鼠标坐标属性对比

```javascript
document.addEventListener('click', function(e) {
    // 可视区坐标（页面没有滚动时与 page 相同）
    console.log('可视区:', e.clientX, e.clientY);
    
    // 页面坐标（相对于整个文档）
    console.log('页面:', e.pageX, e.pageY);
    
    // 屏幕坐标（相对于整个屏幕）
    console.log('屏幕:', e.screenX, e.screenY);
});
```

### 阻止默认行为

```javascript
// 阻止链接跳转
<a href="http://baidu.com" id="link">百度</a>

link.addEventListener('click', function(e) {
    e.preventDefault();  // 阻止默认跳转行为
    console.log('链接被阻止了');
});

// 阻止表单提交
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('表单不提交');
});
```

### 阻止事件冒泡

```javascript
parent.addEventListener('click', function() {
    console.log('父元素被点击');
});

child.addEventListener('click', function(e) {
    e.stopPropagation();  // 阻止冒泡
    console.log('子元素被点击');
});
```

## 小结

1. 事件对象包含事件的所有相关信息
2. `e.target` 是触发事件的实际元素
3. `e.currentTarget` 和 `this` 是绑定事件的元素
4. 鼠标事件常用 `e.clientX/Y` 或 `e.pageX/Y`
5. `e.preventDefault()` 阻止默认行为
6. `e.stopPropagation()` 阻止事件冒泡
