---
title: 30简单ATM取款机案例
category: JavaScript
tags: []
date: 2026-04-10
description:
---

## 需求分析

ATM 取款机功能：
- 查询余额
- 存款
- 取款
- 退出

## 流程图

```
┌─────────────────┐
│   欢迎使用ATM   │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
  继续      退出
    ↓         ↓
 ┌─────────────┐
 │ 1.查询余额  │
 │ 2.存款      │
 │ 3.取款      │
 │ 4.退出      │
 └──────┬──────┘
        ↓
   选择操作 → 执行 → 返回继续/退出
```

## 完整代码

```javascript
let balance = 1000;  // 初始余额

while (true) {
    let choice = prompt(`
        请选择操作：
        1. 查询余额
        2. 存款
        3. 取款
        4. 退出
    `);

    switch (choice) {
        case '1':
            alert(`当前余额：${balance}元`);
            break;
        case '2':
            let deposit = +prompt('请输入存款金额：');
            if (deposit > 0) {
                balance += deposit;
                alert(`存款成功！余额：${balance}元`);
            } else {
                alert('存款金额必须大于0');
            }
            break;
        case '3':
            let withdraw = +prompt('请输入取款金额：');
            if (withdraw > 0 && withdraw <= balance) {
                balance -= withdraw;
                alert(`取款成功！余额：${balance}元`);
            } else {
                alert('余额不足或金额错误');
            }
            break;
        case '4':
            alert('感谢使用，再见！');
            break;
        default:
            alert('输入错误，请重新选择');
    }

    if (choice === '4') {
        break;  // 退出循环
    }
}
```

## 关键点

| 要点 | 说明 |
|------|------|
| 初始余额 | 用变量存储当前余额 |
| 循环菜单 | while(true) 配合 switch |
| 退出条件 | choice === '4' 时 break |
| 余额判断 | 取款前检查余额是否足够 |

## 运行示例

```
初始余额：1000元

选择 2（存款）→ 输入 500 → 余额变为 1500元
选择 3（取款）→ 输入 200 → 余额变为 1300元
选择 1（查询）→ 显示 1300元
选择 4（退出）→ 程序结束
```

## 记忆口诀

> **ATM**：初始余额1000，循环菜单选操作，switch 分支处理，break 退出循环
