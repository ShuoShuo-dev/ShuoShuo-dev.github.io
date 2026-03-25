#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客构建工具 - 将 Markdown 笔记转换为 HTML
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import os
import re
import markdown
from datetime import datetime

# Markdown 转换器
md = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc'])

def read_md_files():
    """读取所有 Markdown 文件"""
    md_dir = 'md-notes'
    notes = []
    
    if not os.path.exists(md_dir):
        os.makedirs(md_dir)
        return notes
    
    for filename in os.listdir(md_dir):
        if filename.endswith('.md'):
            filepath = os.path.join(md_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 解析元数据
            title = filename[:-3]  # 去掉 .md
            date = datetime.now().strftime('%Y-%m-%d')
            tags = ['笔记']
            excerpt = ''
            
            # 从内容中提取信息
            lines = content.split('\n')
            if lines and lines[0].startswith('# '):
                title = lines[0][2:].strip()
            
            # 提取日期
            date_match = re.search(r'日期[:：]\s*(\d{4}-\d{2}-\d{2})', content)
            if date_match:
                date = date_match.group(1)
            
            # 提取标签
            tag_match = re.search(r'标签[:：]\s*(.+)', content)
            if tag_match:
                tags = [t.strip() for t in tag_match.group(1).split(',')]
            
            # 生成摘要（前100字）
            text_content = re.sub(r'[#*`\[\]()\-_>]', '', content)
            excerpt = text_content[:100] + '...' if len(text_content) > 100 else text_content
            
            notes.append({
                'filename': filename[:-3] + '.html',
                'title': title,
                'date': date,
                'tags': tags,
                'excerpt': excerpt,
                'content': content
            })
    
    # 按日期排序
    notes.sort(key=lambda x: x['date'], reverse=True)
    return notes

def generate_note_html(note):
    """生成单篇笔记的 HTML"""
    html_content = md.convert(note['content'])
    md.reset()
    
    tags_html = ''.join([f'<span class="tag">{tag}</span>' for tag in note['tags']])
    
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{note['title']} - ShuoShuo 的学习笔记</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        .note-content {{
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
        }}
        .note-content h1 {{
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }}
        .note-content h2 {{
            margin-top: 30px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }}
        .note-content h3 {{
            margin-top: 20px;
            color: #555;
        }}
        .note-content pre {{
            background: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #667eea;
        }}
        .note-content code {{
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        .note-content pre code {{
            background: none;
            padding: 0;
        }}
        .note-content blockquote {{
            border-left: 4px solid #667eea;
            margin: 20px 0;
            padding: 10px 20px;
            background: #f9f9f9;
            color: #666;
        }}
        .note-content ul, .note-content ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        .note-content li {{
            margin: 8px 0;
        }}
        .note-content p {{
            margin: 15px 0;
            line-height: 1.8;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 20px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }}
        .back-link:hover {{
            text-decoration: underline;
        }}
        .meta {{
            color: #999;
            font-size: 0.9em;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>📝 ShuoShuo 的学习笔记</h1>
        </div>
    </header>

    <main class="container" style="padding-top: 40px;">
        <a href="../index.html" class="back-link">← 返回首页</a>
        
        <article class="note-content">
            <h1>{note['title']}</h1>
            <div class="meta">
                <span>📅 {note['date']}</span>
                <span style="margin-left: 20px;">{tags_html}</span>
            </div>
            {html_content}
        </article>
    </main>

    <footer style="margin-top: 50px;">
        <div class="container">
            <p>&copy; 2026 ShuoShuo. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>'''

def generate_index(notes):
    """生成首页 HTML"""
    notes_cards = ''
    for note in notes:
        tags_html = ''.join([f'<span class="tag">{tag}</span>' for tag in note['tags']])
        notes_cards += f'''
                <article class="note-card">
                    <h3><a href="notes/{note['filename']}">{note['title']}</a></h3>
                    <p class="date">{note['date']}</p>
                    <p class="excerpt">{note['excerpt']}</p>
                    {tags_html}
                </article>'''
    
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShuoShuo 的学习笔记</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>📝 ShuoShuo 的学习笔记</h1>
            <p class="subtitle">记录学习历程，分享技术心得</p>
        </div>
    </header>

    <nav>
        <div class="container">
            <ul>
                <li><a href="#home" class="active">首页</a></li>
                <li><a href="#notes">学习笔记</a></li>
                <li><a href="#projects">项目展示</a></li>
                <li><a href="#about">关于我</a></li>
            </ul>
        </div>
    </nav>

    <main class="container">
        <section id="home" class="hero">
            <h2>欢迎来到我的学习空间</h2>
            <p>这里记录了我的技术学习笔记、项目实践和心得体会。</p>
        </section>

        <section id="notes" class="notes-section">
            <h2>📚 最新笔记</h2>
            <div class="notes-grid">
                {notes_cards}
            </div>
        </section>

        <section id="projects" class="projects-section">
            <h2>🚀 项目展示</h2>
            <div class="project-list">
                <div class="project-item">
                    <h3>中国优秀传统文化展示互动平台</h3>
                    <p>基于 Spring Boot + Vue 3 开发的前后端分离项目</p>
                    <a href="https://github.com/ShuoShuo-dev/-" target="_blank">查看源码 →</a>
                </div>
            </div>
        </section>

        <section id="about" class="about-section">
            <h2>👋 关于我</h2>
            <p>我是一名热爱技术的学生，正在学习 Java 后端开发和前端技术。</p>
            <p>这个博客用于记录我的学习历程，欢迎交流！</p>
            <div class="contact">
                <p>📧 邮箱：2251058969@qq.com</p>
                <p>💻 GitHub：<a href="https://github.com/ShuoShuo-dev" target="_blank">@ShuoShuo-dev</a></p>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2026 ShuoShuo. All rights reserved.</p>
            <p>Powered by GitHub Pages</p>
        </div>
    </footer>
</body>
</html>'''

def build():
    """构建博客"""
    print("🚀 开始构建博客...")
    
    # 读取 Markdown 文件
    notes = read_md_files()
    print(f"📄 找到 {len(notes)} 篇笔记")
    
    # 确保 notes 目录存在
    if not os.path.exists('notes'):
        os.makedirs('notes')
    
    # 生成每篇笔记的 HTML
    for note in notes:
        html = generate_note_html(note)
        filepath = os.path.join('notes', note['filename'])
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ 生成: {note['filename']}")
    
    # 生成首页
    index_html = generate_index(notes)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("  ✓ 生成: index.html")
    
    print("\n✅ 构建完成！")
    print("💡 提示：运行 'python push.py' 推送到 GitHub")

if __name__ == '__main__':
    build()
