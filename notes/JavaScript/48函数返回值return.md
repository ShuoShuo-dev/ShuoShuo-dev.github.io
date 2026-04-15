---
title: 48函数返回值return
category: JavaScript
tags: []
date: 2026-04-12
description:
---

## 为什么需要返回值？

让调用者决定如何使用结果：

```javascript
// ❌ 结果固定
function getSum() {
    alert(100 + 200);  // 只能弹框
}

// ✅ 结果可变
function getSum() {
    return 100 + 200;  // 返回给调用者
}

let result = getSum();  // 300
document.write(result); // 可以用其他方式
```

## return 语法

```javascript
function 函数名() {
    return 结果;
}

// 调用
let result = 函数名();
```

## 案例

```javascript
function getPrice(qty, unit) {
    return qty * unit;
}

let total = getPrice(5, 100);
console.log(`总价：${total}`);  // 总价：500
```

## return 两个作用

| 作用 | 说明 |
|------|------|
| 返回结果 | 把值带回调用处 |
| 终止函数 | return 后的代码不执行 |

```javascript
function fn() {
    console.log(1);
    return 100;
    console.log(2);  // 不会执行
}
```

## 注意事项

1. **return 后的代码不执行**
2. **return 只能返回一个值**
3. **不写 return 返回 undefined**
4. **return 不能换行写**

```javascript
// 错误示例
return      // 相当于 return undefined
    100;
```

## 记忆口诀

> **return**：return 关键字作用大，返回结果给调用者，同时终止函数执行
