---
title: 31for循环及其案例
category: JavaScript
tags: []
date: 2026-04-10
description:
---

## 为什么需要 for 循环？

while 循环三要素分散，for 循环**三要素写在一行**，更紧凑

## 语法

```javascript
for (let i = 1; i <= 5; i++) {
    // 循环体
}
```

```
for (起始值; 终止条件; 变化量) { 循环体 }
```

## 执行顺序

```
1. let i = 1        （只执行一次）
      ↓
2. i <= 5 ?         （判断）
      ↓
   ┌──┴──┐
   ↓     ↓
 true   false
   ↓     ↓
  执行   结束
  循环体
   ↓
3. i++              （变化）
   ↓
   返回第2步
```

## 案例：打印5句话

```javascript
for (let i = 1; i <= 5; i++) {
    document.write('月薪过万<br>');
}
```

## 案例：输出1-100岁

```javascript
for (let age = 1; age <= 100; age++) {
    console.log(`年龄：${age}岁`);
}
```

## 案例：求偶数和

```javascript
let sum = 0;
for (let i = 1; i <= 100; i++) {
    if (i % 2 === 0) {
        sum += i;
    }
}
console.log('1-100偶数和：' + sum);  // 2550
```

## for vs while

| 特点 | for | while |
|------|-----|-------|
| 三要素位置 | 集中在一行 | 分散 |
| 适用场景 | 明确循环次数 | 不确定循环次数 |
| 代码可读性 | 更好 | 一般 |

**优先使用 for 循环**

## 注意事项

1. **分号不能省**：`let i=1; i<=5; i++`
2. **变化量在前**：如 `i++`
3. **避免死循环**：确保条件最终为 false

## 记忆口诀

> **for循环**：for小括号三兄弟，起始终止变化量，循环体写大括号里
