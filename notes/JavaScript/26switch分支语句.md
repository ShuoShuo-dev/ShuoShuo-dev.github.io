---
title: 26switch分支语句
category: JavaScript
tags: []
date: 2026-04-10
description:
---

## 为什么需要 switch？

if else 适合范围判断，switch 适合**值匹配**的场景

## 语法结构

```javascript
switch (表达式) {
    case 值1:
        // 匹配成功执行的代码
        break;
    case 值2:
        // 匹配成功执行的代码
        break;
    default:
        // 都不匹配时执行
        break;
}
```

## 执行流程

```
表达式 → 依次匹配 case → 匹配成功执行 → break 退出
              ↓
         都不匹配 → default
```

## 穿透现象

**不写 break 会穿透！**

```javascript
switch (num) {
    case 1:
        console.log(1);
        break;  // 写上break才停止
    case 2:
        console.log(2);
        break;
    default:
        console.log('其他');
}
```

## 案例：简单计算器

```javascript
let num1 = +prompt('请输入第一个数：');
let operator = prompt('请输入运算符（+ - * /）：');
let num2 = +prompt('请输入第二个数：');
let result;

switch (operator) {
    case '+':
        result = num1 + num2;
        break;
    case '-':
        result = num1 - num2;
        break;
    case '*':
        result = num1 * num2;
        break;
    case '/':
        result = num1 / num2;
        break;
    default:
        alert('运算符错误');
}

alert(`结果：${result}`);
```

## if else vs switch

| 场景 | 推荐 | 原因 |
|------|------|------|
| 值确定且较少 | switch | 效率高、结构清晰 |
| 范围判断 | if else | 如 `score > 90` |

**性能**：switch 采用哈希查找，分支多时效率比 if else 高 2 倍以上

## 注意事项

1. **全等匹配**：值和类型都必须相等（`===`）
2. **记得 break**：否则会穿透执行
3. **default 可省略**：类似 else

## 记忆口诀

> **switch**：switch 小括号放表达式，case 找值来匹配，break 记得加上去
