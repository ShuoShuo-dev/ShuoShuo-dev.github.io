#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
一键推送工具 - 构建并推送到 GitHub
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import os
import subprocess
import sys

def run_command(cmd, description):
    """运行命令"""
    print(f"\n📌 {description}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  ✓ 成功")
        if result.stdout:
            print(result.stdout)
        return True
    else:
        print(f"  ✗ 失败")
        print(result.stderr)
        return False

def main():
    print("=" * 50)
    print("🚀 博客一键推送工具")
    print("=" * 50)
    
    # 1. 构建博客
    print("\n📦 步骤 1: 构建博客")
    try:
        import build
        build.build()
    except Exception as e:
        print(f"  ✗ 构建失败: {e}")
        input("\n按回车键退出...")
        return
    
    # 2. Git 操作
    print("\n📤 步骤 2: 推送到 GitHub")
    
    # 添加所有文件
    if not run_command('git add .', '添加文件到 Git'):
        input("\n按回车键退出...")
        return
    
    # 提交
    commit_msg = input("\n💬 请输入提交信息（直接回车使用默认）: ").strip()
    if not commit_msg:
        commit_msg = "更新博客内容"
    
    if not run_command(f'git commit -m "{commit_msg}"', '提交更改'):
        print("  ⚠️ 可能没有变更需要提交")
    
    # 推送
    if run_command('git push', '推送到 GitHub'):
        print("\n" + "=" * 50)
        print("✅ 推送成功！")
        print("=" * 50)
        print("\n🌐 博客地址: https://shuoshuo-dev.github.io/")
        print("⏰ 等待 1-2 分钟后刷新网页查看更新")
    else:
        print("\n❌ 推送失败，请检查网络连接")
    
    input("\n按回车键退出...")

if __name__ == '__main__':
    main()
