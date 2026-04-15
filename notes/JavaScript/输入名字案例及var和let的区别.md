---
title: 09输入名字案例及var和let的区别
category: JavaScript
tags: [JavaScript, var, let, 变量声明, 输入]
date: 2024-01-01
description: 多个输入框案例，以及var和let的三大区别
---

# 输入名字案例及var和let的区别

## 一、多输入框案例

### 需求
输入姓名、年龄、性别，页面显示

### 代码

```javascript
// 1. 输入
let uname = prompt('请输入姓名');
let age = prompt('请输入年龄');
let gender = prompt('请输入性别');

// 2. 输出
document.write('姓名：' + uname + '<br>');
document.write('年龄：' + age + '<br>');
document.write('性别：' + gender);
```

---

## 二、var vs let 三大区别

### 区别1：变量提升

| 写法 | var | let |
|------|-----|-----|
| 先打印后声明 | ✅ 显示 undefined | ❌ 报错 |

```javascript
// var - 变量提升（预解析）
console.log(name);  // undefined
var name = '张三';

// let - 不会提升
console.log(age);   // ❌ ReferenceError
let age = 18;
```

### 区别2：先使用后声明

| 写法 | var | let |
|------|-----|-----|
| 先赋值后声明 | ✅ 正常显示 | ❌ 报错 |

```javascript
// var - 允许（不报错但不推荐）
name = '张三';
var name;

// let - 不允许
age = 18;     // ❌ ReferenceError
let age;
```

### 区别3：重复声明

| 写法 | var | let |
|------|-----|-----|
| 多次声明同一变量 | ✅ 允许 | ❌ 报错 |

```javascript
// var - 允许（不报错但不推荐）
var name = '张三';
var name = '李四';  // ⚠️ 不报错

// let - 不允许
let age = 18;
let age = 20;      // ❌ 报错：age已被声明
```

---

## 三、为什么推荐用 let

| 问题 | var | let |
|------|-----|-----|
| 变量提升 | 有（易出bug） | 无（更安全） |
| 重复声明 | 允许 | 禁止 |
| 作用域 | 函数级 | 块级 |
| 推荐程度 | ❌ 不推荐 | ✅ 推荐 |

---

## 四、记忆口诀

```
var 有问题，let 来替代
var 会提升，let 不会
var 可重复，let 不行
开发用 let，代码更安全
```

---

## 五、综合示例

```javascript
// ✅ 正确写法
let name = '张三';
let age = 18;

// ✅ 修改变量值
age = 20;  // 可以重新赋值

// ❌ 不能重复声明
let age = 25;  // 报错

// ✅ let 不会变量提升
console.log(gender);  // 报错
let gender = '男';
```
