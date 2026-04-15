---
title: 90事件解绑、mouseover和mouseenter的区别
category: JavaScript
tags: []
date: 2026-04-15
description: 事件解绑的3种方式，以及mouseover和mouseenter事件的区别
---

# 事件解绑、mouseover和mouseenter的区别

## 一、事件解绑

### 1.1 传统方式解绑

```javascript
// 绑定
box.onclick = function() {
    console.log('点击了');
}

// 解绑 - 直接赋值为 null
box.onclick = null;
```

### 1.2 addEventListener 方式解绑

```javascript
function fn() {
    console.log('点击了');
}

// 绑定
box.addEventListener('click', fn);

// 解绑 - 必须使用同一个函数引用
box.removeEventListener('click', fn);
```

:::warning 重要
`removeEventListener` 必须使用**和绑定时同一个函数引用**，匿名函数无法解绑！
:::

```javascript
// ❌ 错误 - 无法解绑
box.addEventListener('click', function() {
    console.log('点击了');
});
box.removeEventListener('click', function() {  // 这个是新的匿名函数
    console.log('点击了');
});

// ✅ 正确
function fn() {
    console.log('点击了');
}
box.addEventListener('click', fn);
box.removeEventListener('click', fn);
```

### 1.3 attachEvent 解绑（IE8 兼容）

```javascript
// 绑定
box.attachEvent('onclick', fn);

// 解绑
box.detachEvent('onclick', fn);
```

### 1.4 兼容性封装

```javascript
function removeEvent(element, eventName, fn) {
    if (element.removeEventListener) {
        element.removeEventListener(eventName, fn);
    } else if (element.detachEvent) {
        element.detachEvent('on' + eventName, fn);
    } else {
        element['on' + eventName] = null;
    }
}
```

---

## 二、mouseover 和 mouseenter 的区别

### 2.1 基本概念

| 事件 | 说明 |
|------|------|
| `mouseover` | 鼠标进入元素或其子元素时触发（会冒泡） |
| `mouseenter` | 鼠标只进入元素本身时触发（不冒泡） |

### 2.2 核心区别演示

```html
<style>
    .father {
        width: 200px;
        height: 200px;
        background: pink;
    }
    .son {
        width: 100px;
        height: 100px;
        background: skyblue;
    }
</style>

<div class="father">
    <div class="son"></div>
</div>
```

```javascript
const father = document.querySelector('.father');

// mouseover - 从父盒子进入子盒子也会触发
father.addEventListener('mouseover', function() {
    console.log('mouseover 触发了');
});

// mouseenter - 只有进入父盒子本身才触发
father.addEventListener('mouseenter', function() {
    console.log('mouseenter 触发了');
});
```

### 2.3 运行结果对比

| 操作 | mouseover | mouseenter |
|------|-----------|------------|
| 从父盒子外部进入父盒子 | ✅ 触发 | ✅ 触发 |
| 从父盒子进入子盒子 | ✅ 触发 | ❌ 不触发 |
| 从子盒子回到父盒子 | ✅ 触发 | ❌ 不触发 |
| 从子盒子外部进入子盒子 | ✅ 触发 | ✅ 触发 |

### 2.4 事件委托中使用 mouseover

```javascript
// mouseover 会冒泡，可以用于事件委托
ul.addEventListener('mouseover', function(e) {
    if (e.target.tagName === 'LI') {
        e.target.style.background = 'lightyellow';
    }
});

// mouseenter 不冒泡，不能用于事件委托
// 下面的写法无效
ul.addEventListener('mouseenter', function(e) {
    if (e.target.tagName === 'LI') {  // 永远不会触发
        e.target.style.background = 'lightyellow';
    }
});
```

### 2.5 实际应用场景

```javascript
// mouseover - 适合需要检测子元素变化的场景
// 比如：导航菜单的子菜单展开

// mouseenter - 适合简单的鼠标悬停效果
// 比如：表格行的背景色高亮
const rows = document.querySelectorAll('tr');
rows.forEach(row => {
    row.addEventListener('mouseenter', function() {
        this.style.background = '#f5f5f5';
    });
    row.addEventListener('mouseleave', function() {
        this.style.background = '';
    });
});
```

---

## 三、综合案例：卡片悬停效果

```javascript
const cards = document.querySelectorAll('.card');

// 使用 mouseenter/mouseleave 实现卡片悬浮效果
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
    });
});
```

---

## 四、总结

1. **事件解绑**：记住用 `onclick = null` 解绑传统方式，用 `removeEventListener` 解绑监听方式
2. **mouseover vs mouseenter**：前者会冒泡，后者不会
3. **实际选择**：
   - 需要检测子元素变化 → 用 `mouseover/mouseout`
   - 只需要检测进入/离开 → 用 `mouseenter/mouseleave`
   - 需要事件委托 → 用 `mouseover`
