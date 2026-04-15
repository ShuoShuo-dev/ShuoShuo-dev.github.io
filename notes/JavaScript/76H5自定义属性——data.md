---
title: 76H5自定义属性——data
category: JavaScript
tags: [HTML5, data, dataset, 自定义属性]
date: 2026-04-14
description: H5自定义属性data的添加和获取方法
---

# H5 自定义属性 data-

## 属性分类

| 类型 | 说明 | 示例 |
|------|------|------|
| 标准属性 | 标签天生自带 | `class` `id` `src` `href` |
| 自定义属性 | 开发者自己定义 | `data-id` `data-name` |

## 添加自定义属性

> **规则**：必须以 `data-` 开头

```html
<div data-id="1" data-spm="10086">商品</div>
<div data-index="0" data-name="张三">用户</div>
```

## 获取自定义属性

### 方式一：传统方式

```javascript
const div = document.querySelector('div');
div.getAttribute('data-id');    // '1'
div.getAttribute('data-name');  // '张三'
```

### 方式二：dataset（推荐）✅

```javascript
const div = document.querySelector('div');

// 获取所有自定义属性的集合
console.log(div.dataset);  // { id: '1', spm: '10086' }

// 获取单个属性（省略 data- 前缀）
div.dataset.id;     // '1'
div.dataset.spm;    // '10086'

// 如果是 data-index（带连字符），用驼峰
div.dataset.index;  // '0'（对应 data-index）
```

## 命名对应规则

| HTML 写法 | dataset 取法 |
|-----------|-------------|
| `data-id` | `dataset.id` |
| `data-index` | `dataset.index` |
| `data-user-name` | `dataset.userName` |
| `data-list-id` | `dataset.listId` |

> **规则**：`data-` 后面的部分，去掉短横线，转成小驼峰

## 实际应用场景

```html
<!-- 标签上存储数据，JS中读取 -->
<ul>
  <li data-id="1">张三</li>
  <li data-id="2">李四</li>
  <li data-id="3">王五</li>
</ul>

<script>
const lis = document.querySelectorAll('li');
lis.forEach(li => {
  li.addEventListener('click', function() {
    const id = this.dataset.id;  // 获取当前点击的ID
    console.log('点击了ID为', id, '的用户');
  });
});
</script>
```

> **好处**：把数据绑在标签上，避免用全局变量传值，代码更清晰。
