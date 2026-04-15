---
title: 87tab切换案例
category: JavaScript
tags: [事件, 排他思想, classList, tab]
date: 2026-04-14
description: Tab栏切换案例的完整实现
---

# Tab 切换案例

## 需求

鼠标移入选项卡 → 选项卡高亮 + 下方内容切换

## 排他思想（核心）

```
第一步：干掉所有人（移除所有 active）
第二步：复活我自己（给当前元素添加 active）
```

## 完整代码

```javascript
// 1. 获取所有选项卡
const tabs = document.querySelectorAll('.tab-nav a');
// 2. 获取所有内容区
const items = document.querySelectorAll('.tab-content .item');

// 3. 给每个选项卡绑定事件
for (let i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener('mouseenter', function() {
    // --- 排他：选项卡 ---
    // 先移除所有 active
    document.querySelector('.tab-nav .active')
      .classList.remove('active');
    // 再给当前添加 active
    this.classList.add('active');

    // --- 排他：内容区 ---
    // 先移除所有 active
    document.querySelector('.tab-content .active')
      .classList.remove('active');
    // 再给对应内容添加 active
    items[i].classList.add('active');
  });
}
```

## 执行流程

```
鼠标移入第3个选项卡（i=2）
  → 移除所有选项卡的 active
  → 给第3个选项卡添加 active  （高亮）
  → 移除所有内容区的 active
  → 给第3个内容区添加 active   （显示对应内容）
```

## 为什么要用 `for` 循环 + `i`

```javascript
// 关键：i 和选项卡、内容区一一对应
tabs[0] ↔ items[0]  // 第1个选项卡 ↔ 第1个内容
tabs[1] ↔ items[1]  // 第2个选项卡 ↔ 第2个内容
tabs[2] ↔ items[2]  // 第3个选项卡 ↔ 第3个内容
```

> 利用闭包，每个事件回调里的 `i` 值不同，从而找到对应的内容区

## 小结

| 步骤 | 操作 | 代码 |
|------|------|------|
| 遍历选项卡 | `for` 循环 | `for (let i = 0; ...)` |
| 选项卡排他 | 先删再加 | `remove('active')` → `add('active')` |
| 内容排他 | 先删再加 | `remove('active')` → `add('active')` |
| 对应关系 | 用 `i` 关联 | `items[i].classList.add(...)` |
