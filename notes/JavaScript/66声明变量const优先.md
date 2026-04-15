---
title: 66声明变量const优先
category: JavaScript
tags: [let, const, var, 变量声明]
date: 2026-04-13
description: var/let/const三种声明方式的区别和使用原则
---

# 声明变量 const 优先

## 三种声明方式对比

| 特性 | `var` | `let` | `const` |
|------|-------|-------|---------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | ✅ | ❌ | ❌ |
| 重复声明 | ✅ 允许 | ❌ 报错 | ❌ 报错 |
| 重新赋值 | ✅ | ✅ | ❌ 报错 |
| **推荐度** | ❌ 淘汰 | ✅ 备用 | ✅✅ **优先** |

## 使用原则

```
能用 const 就用 const，不行再用 let，永远不用 var
```

### 什么时候用 const？

```javascript
// ✅ 值不会变的变量 → const
const PI = 3.14;
const userName = '张三';
const arr = [1, 2, 3];
const obj = { name: '张三' };
```

### 什么时候用 let？

```javascript
// ✅ 值会变的变量 → let
let count = 0;
count++;  // 需要重新赋值，必须用 let

for (let i = 0; i < 10; i++) {
  // i 需要自增，必须用 let
}
```

## const 与复杂数据类型

> **const 保护的是地址，不是内容！**

```javascript
const arr = [1, 2, 3];

// ✅ 允许：修改内容（地址没变）
arr.push(4);       // [1, 2, 3, 4]
arr[0] = 100;      // [100, 2, 3, 4]

// ❌ 报错：重新赋值（地址变了）
arr = [5, 6, 7];   // Assignment to constant variable.

const obj = { name: '张三' };

// ✅ 允许：修改属性
obj.age = 18;      // { name: '张三', age: 18 }

// ❌ 报错：重新赋值
obj = {};          // Assignment to constant variable.
```

## 判断流程

```
声明变量
  ├── 值会不会变？
  │     ├── 不会 → const ✅
  │     └── 会   → let ✅
  └── var → 永远不要用 ❌
```
