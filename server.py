#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
博客后端服务 - 提供笔记增删改 API，修改后自动触发 build.py 重建

启动方式:
    python server.py

访问:
    http://localhost:8088/admin.html
"""

import subprocess
import json
import os
import re
import io
import sys
import mimetypes
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

PORT = 8088
BLOG_DIR = os.path.dirname(os.path.abspath(__file__))
MD_DIR = os.path.join(BLOG_DIR, 'md-notes')
NOTES_JSON = os.path.join(BLOG_DIR, 'notes', 'notes.json')
os.makedirs(MD_DIR, exist_ok=True)

# ---------- Markdown 文件操作 ----------

def filename_from_title(title: str) -> str:
    """将标题转为合法的文件名"""
    s = re.sub(r'[\\/:*?"<>|]', '', title)
    s = re.sub(r'\s+', '-', s.strip())
    return s[:50] + '.md'

def md_to_note_item(filepath: str) -> dict:
    """从 .md 文件提取元数据，生成 notes.json 格式条目"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    name = os.path.splitext(os.path.basename(filepath))[0]
    title = name
    date = datetime.now().strftime('%Y-%m-%d')
    tags = '笔记'
    category = 'other'
    intro = ''

    lines = content.split('\n')
    if lines and lines[0].startswith('# '):
        title = lines[0][2:].strip()

    m = re.search(r'日期[:：]\s*(\d{4}-\d{2}-\d{2})', content)
    if m: date = m.group(1)
    m = re.search(r'标签[:：]\s*(.+)', content)
    if m: tags = m.group(1).strip()
    m = re.search(r'分类[:：]\s*(.+)', content)
    if m: category = m.group(1).strip().lower()

    text = re.sub(r'[#*`\[\]()\-_>]', '', content)
    intro = text[:120] + '...' if len(text) > 120 else text

    return {
        'filename': name + '.html',
        'title': title,
        'date': date,
        'tags': tags,
        'category': category,
        'intro': intro
    }

def rebuild():
    """调用 build.py 重建站点"""
    print('[server] 触发 build.py 重建...')
    try:
        result = subprocess.run(
            [sys.executable, 'build.py'],
            cwd=BLOG_DIR,
            capture_output=True, text=True, timeout=60
        )
        print(result.stdout)
        if result.returncode != 0:
            print('[server] build.py 失败:', result.stderr)
        return result.returncode == 0
    except Exception as e:
        print('[server] rebuild 出错:', e)
        return False

def list_notes():
    """列出所有笔记（不含 content）"""
    notes = []
    for fn in os.listdir(MD_DIR):
        if fn.endswith('.md'):
            fp = os.path.join(MD_DIR, fn)
            notes.append(md_to_note_item(fp))
    notes.sort(key=lambda x: x['date'], reverse=True)
    return notes

def get_note(title: str):
    """按标题查找笔记原始内容"""
    # 尝试用文件名匹配
    candidates = []
    for fn in os.listdir(MD_DIR):
        if fn.endswith('.md'):
            fp = os.path.join(MD_DIR, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                content = f.read()
            first_line = content.split('\n')[0]
            note_title = first_line[2:].strip() if first_line.startswith('# ') else fn[:-3]
            if note_title == title or fn[:-3] == title:
                return {
                    'title': note_title,
                    'content': content,
                    'filename': fn
                }
            candidates.append((fn, note_title, fp, content))
    return None

def save_note(title: str, content_md: str, date: str, tags: str, category: str, intro: str, old_filename=None):
    """
    保存笔记到 .md 文件，返回实际文件名。
    title: 笔记标题
    content_md: Markdown 原文
    old_filename: 原文件名（编辑时），None 表示新增
    """
    safe_title = re.sub(r'[\\/:*?"<>|]', '', title).strip()
    safe_title = re.sub(r'\s+', '-', safe_title)
    new_fn = safe_title[:50] + '.md'

    # 如果改名了，删旧文件
    if old_filename and old_filename != new_fn:
        old_path = os.path.join(MD_DIR, old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)
            print(f'[server] 删除旧文件: {old_filename}')

    # 写文件（头部加 YAML front matter 方便未来扩展）
    header = f"# {title}\n日期：{date}\n标签：{tags}\n分类：{category}\n简介：{intro}\n\n"
    filepath = os.path.join(MD_DIR, new_fn)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(header + content_md)

    print(f'[server] 保存: {new_fn}')
    return new_fn

def delete_note(filename: str):
    """删除指定文件"""
    filepath = os.path.join(MD_DIR, filename) if filename.endswith('.md') else os.path.join(MD_DIR, filename + '.md')
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f'[server] 删除: {filepath}')
        return True
    return False

# ---------- HTTP 处理 ----------

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f'[http] {self.address_string()} - {fmt % args}')

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_file(self, path):
        if not os.path.exists(path):
            self.send_error(404, 'Not Found')
            return
        mime, _ = mimetypes.guess_type(path)
        self.send_response(200)
        self.send_header('Content-Type', mime or 'text/plain; charset=utf-8')
        self.end_headers()
        with open(path, 'rb') as f:
            self.wfile.write(f.read())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API: 笔记列表
        if path == '/api/notes':
            self.send_json(list_notes())
            return

        # API: 单篇笔记原始内容
        m = re.match(r'/api/notes/(.+)', path)
        if m:
            title = m.group(1)
            note = get_note(title)
            if note:
                self.send_json(note)
            else:
                self.send_json({'error': '未找到'}, 404)
            return

        # 静态文件（admin.html, index.html 等）
        if path == '/' or path == '/admin.html':
            self.send_file(os.path.join(BLOG_DIR, 'admin.html'))
        elif path == '/index.html':
            self.send_file(os.path.join(BLOG_DIR, 'index.html'))
        elif path == '/notes.html':
            self.send_file(os.path.join(BLOG_DIR, 'notes.html'))
        elif path.startswith('/notes/') or path.startswith('/style.css') or path.startswith('/md-notes/'):
            self.send_file(BLOG_DIR + path)
        else:
            self.send_file(os.path.join(BLOG_DIR, path.lstrip('/')))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        # ---------- 新增笔记 ----------
        if path == '/api/notes':
            title  = data.get('title', '无标题')
            content = data.get('content', '')
            date    = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            tags    = data.get('tags', '笔记')
            category = data.get('category', 'other')
            intro   = data.get('intro', '')

            new_fn = save_note(title, content, date, tags, category, intro)
            rebuild()
            note_item = md_to_note_item(os.path.join(MD_DIR, new_fn))
            self.send_json({'ok': True, 'note': note_item})
            return

        # ---------- 未知路由 ----------
        self.send_json({'error': 'unknown endpoint'}, 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        # ---------- 编辑笔记 ----------
        m = re.match(r'/api/notes/(.+)', path)
        if m:
            old_title = m.group(1)
            note = get_note(old_title)
            if not note:
                self.send_json({'error': '未找到笔记'}, 404)
                return

            title     = data.get('title', note['title'])
            content   = data.get('content', note['content'])
            date      = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            tags      = data.get('tags', '笔记')
            category  = data.get('category', 'other')
            intro     = data.get('intro', '')
            old_fn    = note.get('filename', '')

            new_fn = save_note(title, content, date, tags, category, intro, old_filename=old_fn)
            rebuild()
            note_item = md_to_note_item(os.path.join(MD_DIR, new_fn))
            self.send_json({'ok': True, 'note': note_item})
            return

        self.send_json({'error': 'unknown endpoint'}, 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # ---------- 删除笔记 ----------
        m = re.match(r'/api/notes/(.+)', path)
        if m:
            filename = m.group(1)
            ok = delete_note(filename)
            if ok:
                rebuild()
                self.send_json({'ok': True})
            else:
                self.send_json({'error': '未找到文件'}, 404)
            return

        self.send_json({'error': 'unknown endpoint'}, 404)


# ---------- 启动 ----------
if __name__ == '__main__':
    print(f'📝 博客后端服务启动中...')
    print(f'🌐 访问地址: http://localhost:{PORT}/admin.html')
    print(f'📡 API 端口: http://localhost:{PORT}')
    print()
    server = HTTPServer(('localhost', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 服务已停止')
        server.shutdown()
