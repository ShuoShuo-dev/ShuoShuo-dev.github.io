#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客构建工具 - 将 Markdown 笔记转换为 HTML（VitePress 风格）
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import os
import re
import json
import markdown
from datetime import datetime

# Markdown 转换器
md = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc'])

# 侧边栏 HTML（供 notes/ 子目录下的页面使用，路径以 ../ 开头）
SIDEBAR_HTML = '''
    <nav>
      <div class="sidebar-group" id="grp-web">
        <div class="sidebar-group-title" onclick="toggleGroup('grp-web')">HTML5 笔记 <span class="arrow">▼</span></div>
        <div class="sidebar-items">
          <a href="../notes.html?cat=html" class="sidebar-item">HTML5 语义标签</a>
          <a href="../notes.html?cat=html" class="sidebar-item">HTML5 表单与媒体</a>
        </div>
      </div>
      <div class="sidebar-group" id="grp-css">
        <div class="sidebar-group-title" onclick="toggleGroup('grp-css')">CSS3 笔记 <span class="arrow">▼</span></div>
        <div class="sidebar-items">
          <a href="../notes.html?cat=css" class="sidebar-item">CSS3 核心技术</a>
          <a href="../notes.html?cat=css" class="sidebar-item">现代网页布局</a>
          <a href="../notes.html?cat=css" class="sidebar-item">交互动效设计</a>
          <a href="../notes.html?cat=css" class="sidebar-item">前沿技术拓展</a>
          <a href="../notes.html?cat=css" class="sidebar-item">移动网页与响应式开发</a>
        </div>
      </div>
      <div class="sidebar-group" id="grp-js">
        <div class="sidebar-group-title" onclick="toggleGroup('grp-js')">Javascript 笔记 <span class="arrow">▼</span></div>
        <div class="sidebar-items">
          <a href="../notes.html?cat=javascript" class="sidebar-item">JS 基础</a>
          <a href="../notes.html?cat=javascript" class="sidebar-item">WEB APIs</a>
          <a href="../notes.html?cat=javascript" class="sidebar-item">JS 进阶</a>
          <a href="../notes.html?cat=javascript" class="sidebar-item">jQuery 笔记</a>
        </div>
      </div>
      <div class="sidebar-group" id="grp-java">
        <div class="sidebar-group-title" onclick="toggleGroup('grp-java')">Java 笔记 <span class="arrow">▼</span></div>
        <div class="sidebar-items">
          <a href="../notes.html?cat=java" class="sidebar-item">Java 基础</a>
          <a href="../notes.html?cat=java" class="sidebar-item">面向对象编程</a>
          <a href="../notes.html?cat=java" class="sidebar-item">Spring Boot</a>
          <a href="../notes.html?cat=java" class="sidebar-item">MyBatis</a>
        </div>
      </div>
      <div class="sidebar-group" id="grp-other">
        <div class="sidebar-group-title" onclick="toggleGroup('grp-other')">其他 <span class="arrow">▼</span></div>
        <div class="sidebar-items">
          <a href="../projects.html" class="sidebar-item">项目展示</a>
          <a href="../about.html" class="sidebar-item">关于我</a>
        </div>
      </div>
    </nav>
'''

NAV_HTML = '''<header class="vp-nav">
  <button class="mobile-menu-btn" id="menuBtn" aria-label="菜单">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>
  </button>
  <a href="../index.html" class="vp-nav-logo">
    <span class="logo-icon">📝</span>
    <span>ShuoShuo</span>&nbsp;<span style="font-weight:400;color:var(--c-text-2)">的学习笔记</span>
  </a>
  <div class="vp-nav-center">
    <div class="vp-search" tabindex="0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" placeholder="搜索..." autocomplete="off">
      <div class="vp-search-kbd"><kbd>Ctrl</kbd><kbd>K</kbd></div>
    </div>
  </div>
  <div class="vp-nav-actions">
    <a href="https://github.com/ShuoShuo-dev" target="_blank" title="GitHub">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
    </a>
    <button class="theme-toggle" onclick="toggleTheme()">
      <span id="themeIcon">🌙</span>
      <span id="themeText">Auto</span>
    </button>
  </div>
</header>'''

PAGE_JS = '''<script>
function toggleGroup(id) { document.getElementById(id).classList.toggle('collapsed'); }
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
});
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}
function toggleTheme() {
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon.textContent === '🌙') { icon.textContent = '☀️'; text.textContent = 'Dark'; }
  else { icon.textContent = '🌙'; text.textContent = 'Auto'; }
}
// 自动生成右侧目录
function buildToc() {
  const headings = document.querySelectorAll('.vp-doc h2, .vp-doc h3');
  const toc = document.getElementById('toc');
  if (!headings.length) { document.getElementById('tocAside').style.display = 'none'; return; }
  toc.innerHTML = '<li><a href="#" class="active">Overview</a></li>';
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'heading-' + i;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    if (h.tagName === 'H3') a.classList.add('toc-h3');
    li.appendChild(a);
    toc.appendChild(li);
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = toc.querySelector('a[href="#' + e.target.id + '"]');
      if (link) link.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin: '-20% 0px -75% 0px' });
  headings.forEach(h => obs.observe(h));
}
buildToc();
</script>'''


def read_md_files():
    """读取所有 Markdown 文件（从桌面 Shuo Study 文件夹）"""
    import os
    desktop = os.environ.get('USERPROFILE', os.path.expanduser('~'))
    md_dir = os.path.join(desktop, 'Desktop', 'Shuo Study')
    notes = []
    
    if not os.path.exists(md_dir):
        os.makedirs(md_dir)
        return notes
    
    for filename in os.listdir(md_dir):
        if not filename.endswith('.md'):
            continue
        filepath = os.path.join(md_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        title = filename[:-3]
        date = datetime.now().strftime('%Y-%m-%d')
        tags = ['笔记']
        category = 'other'
        intro = ''
        
        lines = content.split('\n')
        if lines and lines[0].startswith('# '):
            title = lines[0][2:].strip()
        
        date_match = re.search(r'日期[:：]\s*(\d{4}-\d{2}-\d{2})', content)
        if date_match:
            date = date_match.group(1)
        
        tag_match = re.search(r'标签[:：]\s*(.+)', content)
        if tag_match:
            tags = [t.strip() for t in tag_match.group(1).split(',')]
        
        cat_match = re.search(r'分类[:：]\s*(.+)', content)
        if cat_match:
            category = cat_match.group(1).strip().lower()
        
        text_content = re.sub(r'[#*`\[\]()\-_>]', '', content)
        intro = text_content[:120] + '...' if len(text_content) > 120 else text_content
        
        notes.append({
            'filename': filename[:-3] + '.html',
            'title': title,
            'date': date,
            'tags': ','.join(tags),
            'category': category,
            'intro': intro,
            'content': content
        })
    
    notes.sort(key=lambda x: x['date'], reverse=True)
    return notes


def generate_note_html(note):
    """生成单篇笔记的 HTML（VitePress 风格）"""
    html_content = md.convert(note['content'])
    md.reset()
    
    tags_list = [t.strip() for t in note['tags'].split(',') if t.strip()]
    tags_html = ''.join([f'<span class="tag">{t}</span>' for t in tags_list])
    
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{note['title']} - ShuoShuo 的学习笔记</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>

{NAV_HTML}

<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<div class="vp-layout">
  <aside class="vp-sidebar" id="sidebar">
    {SIDEBAR_HTML}
  </aside>

  <div class="vp-content-wrapper">
    <div class="vp-content">

      <article class="note-detail vp-doc">
        <a href="../notes.html" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回笔记列表
        </a>

        <h1>{note['title']}</h1>
        <p style="color:var(--c-text-3);font-size:14px;margin-top:-12px;margin-bottom:32px;">
          📅 {note['date']}
          <span style="margin-left:16px">{tags_html}</span>
        </p>

        {html_content}
      </article>

      <aside class="vp-aside" id="tocAside">
        <p class="aside-title">On this page</p>
        <ul class="aside-toc" id="toc"></ul>
      </aside>

    </div>
  </div>
</div>

{PAGE_JS}
</body>
</html>'''


def build():
    """构建博客"""
    print("🚀 开始构建博客...")
    
    notes = read_md_files()
    print(f"📄 找到 {len(notes)} 篇笔记")
    
    if not os.path.exists('notes'):
        os.makedirs('notes')
    
    # 生成每篇笔记 HTML
    for note in notes:
        html = generate_note_html(note)
        filepath = os.path.join('notes', note['filename'])
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓ 生成: {note['filename']}")
    
    # 生成 notes.json（去掉 content 字段以减小体积）
    notes_json = [{k: v for k, v in n.items() if k != 'content'} for n in notes]
    with open(os.path.join('notes', 'notes.json'), 'w', encoding='utf-8') as f:
        json.dump(notes_json, f, ensure_ascii=False, indent=2)
    print("  ✓ 生成: notes/notes.json")
    
    print("\n✅ 构建完成！")
    print("💡 提示：运行 'python push.py' 推送到 GitHub")


if __name__ == '__main__':
    build()
