---
title: 15布尔型，null，undefined以及数据类型检测
category: JavaScript
tags: [JavaScript, 布尔, boolean, null, undefined, typeof]
date: 2024-01-01
description: 布尔型、null、undefined的特点和typeof数据类型检测
---

# 布尔型、null、undefined及数据类型检测

## 一、布尔型 (boolean)

只有两个值：`true` 和 `false`

```javascript
let isVip = true;    // 是会员
let isLogin = false;  // 未登录
```

### 典型应用

```javascript
let age = 18;
console.log(age >= 18);  // true（成年）
console.log(age < 18);   // false（未成年）
```

---

## 二、undefined（未定义）

声明变量但**不赋值**：

```javascript
let name;
console.log(name);  // undefined
```

### 开发场景

检测是否有值传入：

```javascript
let data = getData();
if (data === undefined) {
  console.log('数据还没来');
}
```

---

## 三、null（空值）

明确表示"**值为空**"或"**对象还没准备好**"：

```javascript
let obj = null;  // 准备放对象，但还没准备好
```

### 与 undefined 的区别

```javascript
console.log(undefined + 1);  // NaN（未知+数字=未知）
console.log(null + 1);        // 1（空值+1=1）
```

---

## 四、typeof 数据类型检测

### 基本语法

```javascript
typeof 数据
// 或
typeof(数据)
```

### 检测示例

| 代码 | 结果 |
|------|------|
| `typeof 18` | `'number'` |
| `typeof 'hello'` | `'string'` |
| `typeof true` | `'boolean'` |
| `typeof undefined` | `'undefined'` |
| `typeof null` | `'object'` ⚠️ |
| `typeof {name:'张三'}` | `'object'` |

### 注意

```javascript
// null 的检测结果是 'object'（历史遗留bug）
let obj = null;
console.log(typeof obj);  // 'object'
```

---

## 五、综合应用

```javascript
let age = 18;
let name;
let obj = null;

console.log(typeof age);   // number
console.log(typeof name);   // undefined
console.log(typeof obj);    // object
console.log(typeof true);  // boolean
```

---

## 六、记忆口诀

```
布尔布尔，真真假假
true表示对，false表示错
undefined声明未赋值
null空值对象未准备好
typeof检测数据类型
```
