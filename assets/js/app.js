/**
 * Shuo's Study Blog - 核心逻辑
 * 纯静态，基于文件系统 API（需 HTTP 服务器）
 * 使用 marked.js 渲染 Markdown，highlight.js 代码高亮
 */

const API_BASE = 'http://localhost:8182';

// ============================================================
// 全局状态
// ============================================================
const STATE = {
  config: null,
  notes: [],        // 所有笔记的元数据
  currentNote: null,
  currentCategory: null,
  history: [],      // 浏览历史（用于返回）
  stats: {},        // 阅读统计 { noteId: count }
  searchIndex: [],  // 搜索索引
  theme: 'auto',
  sidebarOpen: true,
  adminTab: 'overview',
  currentSort: 'date-desc',
};

// ============================================================
// 初始化
// ============================================================
async function init() {
  loadTheme();
  await loadConfig();
  await scanNotes();
  renderSidebar();
  renderCategoryGrid();
  renderLatestNotes();
  buildSearchIndex();
  setupScrollEvents();
  // 等 stats 加载完成后更新显示
  loadStats().then(() => updateStatsDisplay());
  console.log('✅ Shuo Study Blog 初始化完成，共加载', STATE.notes.length, '篇笔记');
}

// ============================================================
// 配置加载
// ============================================================
async function loadConfig() {
  try {
    const res = await fetch('config.json?' + Date.now());
    STATE.config = await res.json();
  } catch (e) {
    console.warn('配置加载失败，使用默认配置', e);
    STATE.config = getDefaultConfig();
  }
  // 加载扁平分类列表（含路径）
  try {
    const resp = await fetch(API_BASE + '/api/categories-flat?' + Date.now());
    if (resp.ok) {
      STATE.flatCategories = await resp.json();
    }
  } catch (e) {
    STATE.flatCategories = [];
  }
}

function getDefaultConfig() {
  return {
    site: { title: "Shuo's Study Blog", author: "张高硕", description: "学习记录" },
    categories: [
      { id: 'web-frontend', name: 'Web 前端', icon: '🌐', color: '#4F8EF7', folder: 'Web前端' },
      { id: 'java-backend', name: 'Java 后端', icon: '☕', color: '#F7A94F', folder: 'Java后端' },
      { id: 'interview', name: '面试题', icon: '📝', color: '#F74F7A', folder: '面试题' },
      { id: 'algorithm', name: '算法', icon: '🧮', color: '#4FF7A9', folder: '算法与数据结构' },
    ]
  };
}


// 扫描笔记
// 由于浏览器无法直接列目录，使用 fetch 探测 + notes-index.json 方式
// ============================================================
async function scanNotes() {
  STATE.notes = [];
  // 优先从后端 API 获取笔记列表（实时同步新增/编辑）
  try {
    const res = await fetch(API_BASE + '/api/notes?' + Date.now());
    if (res.ok) {
      const data = await res.json();
      // 兼容两种格式：数组（旧）或 {notes:[], total:N}（新）
      STATE.notes = Array.isArray(data) ? data : (data.notes || []);
      console.log('[Notes] 从 API 加载', STATE.notes.length, '篇笔记');
      return;
    }
  } catch (e) { /* API 不可用时降级到静态文件 */ }

  // 降级：加载索引文件（GitHub Pages 部署后使用）
  try {
    const res = await fetch('notes-index.json?' + Date.now());
    if (res.ok) {
      const index = await res.json();
      STATE.notes = index;
      return;
    }
  } catch (e) { /* 索引不存在，用内置演示数据 */ }

  // 再降级：内置演示笔记数据（当没有HTTP服务器时）
  STATE.notes = getDemoNotes();
}

function getDemoNotes() {
  return [
    {
      id: 'web-1',
      title: 'HTML5 语义标签详解',
      category: 'Web 前端',
      categoryId: 'web-frontend',
      folder: 'Web前端',
      file: 'notes/Web前端/HTML5语义标签.md',
      date: '2026-04-06',
      tags: ['HTML5', '语义化', '前端基础'],
      description: '深入理解HTML5语义标签的使用场景和最佳实践',
    },
    {
      id: 'web-2',
      title: 'CSS3 弹性布局 Flexbox 完全指南',
      category: 'Web 前端',
      categoryId: 'web-frontend',
      folder: 'Web前端',
      file: 'notes/Web前端/CSS3弹性布局Flexbox.md',
      date: '2026-04-06',
      tags: ['CSS3', 'Flexbox', '布局'],
      description: '从零掌握Flexbox弹性盒子布局，告别浮动布局的烦恼',
    },
    {
      id: 'java-1',
      title: 'Java 面向对象编程核心概念',
      category: 'Java 后端',
      categoryId: 'java-backend',
      folder: 'Java后端',
      file: 'notes/Java后端/Java面向对象核心概念.md',
      date: '2026-04-06',
      tags: ['Java', 'OOP', '面向对象'],
      description: '封装、继承、多态——Java三大特性深度解析',
    },
    {
      id: 'interview-1',
      title: '前端面试高频题精选',
      category: '面试题',
      categoryId: 'interview',
      folder: '面试题',
      file: 'notes/面试题/前端面试高频题精选.md',
      date: '2026-04-06',
      tags: ['面试', '前端', 'JavaScript'],
      description: '整理前端面试中出现频率最高的题目及答案',
    },
  ];
}

// ============================================================
// 构建搜索索引
// ============================================================
async function buildSearchIndex() {
  STATE.searchIndex = [];
  for (const note of STATE.notes) {
    // 基础索引（标题+描述+标签）
    const baseEntry = {
      id: note.id, title: note.title,
      category: note.categoryPath || note.category, file: note.file,
      description: note.description || '',
      tags: (note.tags || []).join(' '),
      content: '',
    };
    STATE.searchIndex.push(baseEntry);
    // 异步加载内容（不阻塞）
    // 添加 /notes/ 前缀，因为服务器静态文件路由处理 /notes/ 路径
    const safeUrl = '/notes/' + note.file.split('/').map(seg => encodeURIComponent(seg)).join('/');
    fetch(safeUrl).then(r => r.text()).then(text => {
      baseEntry.content = text.replace(/^---\n[\s\S]*?\n---\n*/, '').trimStart().substring(0, 2000);
    }).catch(() => {});
  }
}

// ============================================================
// 渲染侧边栏
// ============================================================
function renderSidebar() {
  const container = document.getElementById('sidebarContent');
  const cats = STATE.config.categories || [];
  let html = '';
  cats.forEach(cat => {
    // 严格匹配：categoryId 必须非空且相等，或 category 名称必须匹配
    const notes = STATE.notes.filter(n => {
      const idMatch = n.categoryId && cat.id && n.categoryId === cat.id;
      const nameMatch = n.category && n.category === cat.name;
      return idMatch || nameMatch;
    }).sort((a, b) => a.title.localeCompare(b.title, 'zh', { numeric: true, sensitivity: 'base' }));
    html += `
    <div class="cat-item">
      <div class="cat-header" onclick="toggleCatExpand(this, '${cat.id}')" style="--cat-color:${cat.color}">
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${notes.length}</span>
        <span class="cat-arrow">▶</span>
      </div>
      <div class="cat-notes" id="catNotes-${cat.id}">
        ${notes.map(n => `
          <span class="cat-note-item" onclick="openNote('${n.id}')" title="${n.title}">
            📄 ${n.title}
          </span>
        `).join('')}
        ${notes.length === 0 ? '<span style="font-size:12px;color:var(--text-muted);padding:6px 10px;display:block;">暂无笔记</span>' : ''}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function toggleCatExpand(el, catId) {
  el.classList.toggle('open');
  const notes = document.getElementById('catNotes-' + catId);
  notes.classList.toggle('show');
}

// ============================================================
// 渲染分类卡片
// ============================================================
function renderCategoryGrid() {
  const grid = document.getElementById('categoryGrid');
  const cats = STATE.config.categories || [];
  grid.innerHTML = cats.map(cat => {
    const count = STATE.notes.filter(n => n.category === cat.name).length;
    return `
    <div class="category-card" style="--cat-color:${cat.color}">
      <div class="category-card-clickable" onclick="filterByCategory('${cat.id}', '${cat.name}')">
        <div class="cat-card-icon">${cat.icon}</div>
        <div class="cat-card-name">${cat.name}</div>
        <div class="cat-card-desc">${cat.description || ''}</div>
        <span class="cat-card-count">${count} 篇笔记</span>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// 渲染最新笔记列表
// ============================================================
function renderLatestNotes() {
  const list = document.getElementById('latestNotesList');
  const latest = [...STATE.notes]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  const catMap = getCatMap();
  list.innerHTML = latest.map(n => {
    const cat = Object.values(catMap).find(c => c.name === n.category) || {};
    return `
    <div class="note-list-item" onclick="openNote('${n.id}')">
      <span class="note-list-icon">${cat.icon || '📄'}</span>
      <div class="note-list-body">
        <div class="note-list-title">${n.title}</div>
        <div class="note-list-meta">
          <span class="note-cat-badge" style="background:${cat.color || '#4F8EF7'}18;color:${cat.color || '#4F8EF7'}">${n.category}</span>
          <span class="note-date">📅 ${n.date}</span>
        </div>
        <div class="note-desc">${n.description || ''}</div>
      </div>
    </div>`;
  }).join('') || '<div class="empty-state"><div class="empty-icon">📝</div><p>还没有笔记，快去新建吧！</p></div>';
}

// ============================================================
// 打开笔记详情
// ============================================================
async function openNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return showToast('笔记不存在');

  // 记录统计
  recordView(noteId);
  STATE.currentNote = noteId;
  STATE.history.push({ type: 'note', id: noteId });

  showView('noteView');
  highlightSidebarNote(noteId);

  // 填充 meta
  document.getElementById('noteTitle').textContent = note.title;
  // categoryId 可能为空（来自索引的笔记），按 name 兜底匹配
  const catMap = getCatMap();
  const cat = catMap[note.categoryId]
    || Object.values(catMap).find(c => c.name === note.category)
    || {};
  document.getElementById('noteCategory').textContent = (cat.icon ? cat.icon + ' ' : '') + (note.categoryPath || note.category || '');
  document.getElementById('noteDate').textContent = note.date;
  document.getElementById('noteViews').textContent = (STATE.stats[noteId] || 0) + ' 次阅读';
  document.getElementById('noteTags').innerHTML = (note.tags || [])
    .map(t => `<span class="note-tag">#${t}</span>`).join('');
  document.getElementById('noteBreadcrumb').innerHTML =
    `<span onclick="showHome()" style="cursor:pointer;color:var(--primary)">首页</span> / ${note.categoryPath || note.category} / ${note.title}`;

  // 加载 Markdown
  document.getElementById('noteBody').innerHTML = '<div class="skeleton" style="height:200px"></div>';
  try {
    let text;
    let apiSuccess = false;
    // 优先从 API 获取笔记内容（实时同步编辑内容）
    try {
      const resp = await fetch(API_BASE + '/api/note/' + noteId + '?' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        // 后端现在返回 {meta: {...}, body: "去除了frontmatter的内容"}
        text = data.body || '';
        apiSuccess = true;
        // body 已经去除了 frontmatter，无需再次处理
      }
    } catch (e) { /* API 不可用，降级到静态文件 */ }
    // 只有当 API 未成功且 text 为空时，才降级到静态文件
    if (!apiSuccess && !text) {
      // 降级：直接 fetch 静态 md 文件
      // 添加 /notes/ 前缀，因为服务器静态文件路由处理 /notes/ 路径
      const safeUrl = '/notes/' + note.file.split('/').map(seg => encodeURIComponent(seg)).join('/') + '?' + Date.now();
      const res = await fetch(safeUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      text = await res.text();
      text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '').trimStart();
    }
    if (!text.trim()) throw new Error('笔记内容为空');
    const html = renderMarkdown(text);
    if (!html) throw new Error('Markdown 渲染返回空内容');
    document.getElementById('noteBody').innerHTML = html;
    // 添加复制按钮
    addCopyButtons();
    // 生成目录
    buildTOC();
  } catch (e) {
    console.error('笔记加载失败:', e);
    document.getElementById('noteBody').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p>笔记加载失败</p>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">错误: ${e.message}</p>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">请刷新页面重试</p>
      </div>`;
  }

  // 上下篇
  setupNoteNav(noteId);
  // 进度条
  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Markdown 渲染
// ============================================================
function renderMarkdown(text) {
  if (typeof marked === 'undefined') {
    // 降级：原样显示
    return '<pre>' + escapeHtml(text) + '</pre>';
  }
  try {
    const renderer = new marked.Renderer();

    // 自定义代码块渲染
    renderer.code = function({ text: code, lang: language }) {
      const validLang = language && typeof hljs !== 'undefined' && hljs.getLanguage(language) ? language : 'plaintext';
      let highlighted;
      if (typeof hljs !== 'undefined') {
        try {
          highlighted = hljs.highlight(code, { language: validLang }).value;
        } catch (e) {
          highlighted = escapeHtml(code);
        }
      } else {
        highlighted = escapeHtml(code);
      }
      return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
    };

    // 自定义图片渲染
    renderer.image = function({ href, text, title }) {
      if (href && href.startsWith('/images/')) {
        href = API_BASE + href;
      }
      return `<img src="${href}" alt="${text || ''}" ${title ? 'title="' + title + '"' : ''} loading="lazy" />`;
    };

    return marked.parse(text, { renderer, breaks: true, gfm: true });
  } catch (e) {
    console.error('Markdown 渲染失败:', e);
    return marked.parse(text);
  }
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ============================================================
// 生成目录
// ============================================================
function buildTOC() {
  const body = document.getElementById('noteBody');
  const toc = document.getElementById('tocList');
  const headings = body.querySelectorAll('h1,h2,h3,h4');
  if (headings.length < 3) { document.getElementById('noteToc').style.display = 'none'; return; }
  document.getElementById('noteToc').style.display = 'block';

  let html = '';
  headings.forEach((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
    const level = h.tagName.toLowerCase();
    html += `<a class="toc-item ${level}" onclick="scrollToHeading('${id}')">${h.textContent}</a>`;
  });
  toc.innerHTML = html;

  // 监听滚动，高亮当前标题
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-item').forEach(item => item.classList.remove('active'));
        const active = toc.querySelector(`[onclick="scrollToHeading('${entry.target.id}')"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

function scrollToHeading(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// 代码复制按钮
// ============================================================
function addCopyButtons() {
  document.querySelectorAll('.note-body pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.onclick = () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent)
        .then(() => { btn.textContent = '✅ 已复制'; setTimeout(() => btn.textContent = '复制', 2000); })
        .catch(() => showToast('复制失败'));
    };
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

// ============================================================
// 上下篇导航
// ============================================================
function setupNoteNav(noteId) {
  const idx = STATE.notes.findIndex(n => n.id === noteId);
  const prevBtn = document.getElementById('prevNoteBtn');
  const nextBtn = document.getElementById('nextNoteBtn');
  const prevTitle = document.getElementById('prevNoteTitle');
  const nextTitle = document.getElementById('nextNoteTitle');

  if (idx > 0) {
    prevBtn.disabled = false;
    prevTitle.textContent = STATE.notes[idx - 1].title;
  } else {
    prevBtn.disabled = true;
    prevTitle.textContent = '已是第一篇';
  }
  if (idx < STATE.notes.length - 1) {
    nextBtn.disabled = false;
    nextTitle.textContent = STATE.notes[idx + 1].title;
  } else {
    nextBtn.disabled = true;
    nextTitle.textContent = '已是最后一篇';
  }
}

function navigateNote(dir) {
  const idx = STATE.notes.findIndex(n => n.id === STATE.currentNote);
  const next = STATE.notes[idx + dir];
  if (next) openNote(next.id);
}

// ============================================================
// 进度条
// ============================================================
function updateProgressBar() {
  const bar = document.getElementById('progressBar');
  const onScroll = () => {
    const scrollTop = document.documentElement.scrollTop;
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.removeEventListener('scroll', window._progressHandler);
  window._progressHandler = onScroll;
  window.addEventListener('scroll', onScroll);
}

// ============================================================
// 侧边栏高亮
// ============================================================
function highlightSidebarNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  document.querySelectorAll('.cat-note-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.cat-header').forEach(el => el.classList.remove('active'));
  if (!note) return;
  // 展开对应分类
  const catNotesEl = document.getElementById('catNotes-' + note.categoryId);
  if (catNotesEl && !catNotesEl.classList.contains('show')) {
    catNotesEl.classList.add('show');
    const header = catNotesEl.previousElementSibling;
    if (header) header.classList.add('open');
  }
  // 高亮笔记条目
  document.querySelectorAll('.cat-note-item').forEach(el => {
    if (el.getAttribute('onclick') === `openNote('${noteId}')`) {
      el.classList.add('active');
    }
  });
}

// ============================================================
// 分类筛选
// ============================================================
function filterByCategory(catId, catName) {
  STATE.currentCategory = catId;
  showView('allNotesView');
  const catMap = getCatMap();
  const cat = catMap[catId] || {};
  const displayName = cat.icon ? `${cat.icon} ${cat.name}` : (cat.name || '📝 全部笔记');
  document.getElementById('allNotesTitle').textContent = displayName;
  const notes = catId === 'all'
    ? STATE.notes
    : STATE.notes.filter(n => n.category === catName);
  renderNotesGrid(notes);
  setActiveNav('');
}

// ============================================================
// 全部笔记视图
// ============================================================
function showAllNotes() {
  STATE.currentCategory = 'all';
  showView('allNotesView');
  document.getElementById('allNotesTitle').textContent = '📝 全部笔记';
  renderNotesGrid(getSortedNotes(STATE.notes));
  setActiveNav('');
}

function renderNotesGrid(notes) {
  const grid = document.getElementById('allNotesGrid');
  const catMap = getCatMap();
  if (!notes.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>没有找到相关笔记</p></div>';
    return;
  }
  grid.innerHTML = notes.map(n => {
    const cat = catMap[n.categoryId] || Object.values(catMap).find(c => c.name === n.category) || {};
    return `
    <div class="note-grid-card" onclick="openNote('${n.id}')">
      <div class="note-grid-title">${cat.icon || '📄'} ${n.title}</div>
      <div class="note-grid-desc">${n.description || '暂无简介'}</div>
      <div class="note-grid-footer">
        <div class="note-grid-tags">
          <span class="note-cat-badge" style="background:${cat.color || '#4F8EF7'}18;color:${cat.color || '#4F8EF7'}">${n.categoryPath || n.category}</span>
          ${(n.tags || []).slice(0,2).map(t => `<span class="note-tag-sm">#${t}</span>`).join('')}
        </div>
        <span class="note-date" style="font-size:12px;color:var(--text-muted)">${n.date}</span>
      </div>
    </div>`;
  }).join('');
}

function sortNotes(order) {
  STATE.currentSort = order;
  const cat = STATE.currentCategory === 'all'
    ? null
    : (STATE.config.categories || []).find(c => c.id === STATE.currentCategory);
  const catName = cat ? cat.name : '';
  const notes = STATE.currentCategory === 'all'
    ? STATE.notes
    : STATE.notes.filter(n => n.categoryId === STATE.currentCategory || n.category === catName);
  renderNotesGrid(getSortedNotes(notes));
}

function getSortedNotes(notes) {
  const sorted = [...notes];
  if (STATE.currentSort === 'date-desc') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (STATE.currentSort === 'date-asc') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (STATE.currentSort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh', { numeric: true, sensitivity: 'base' }));
  return sorted;
}

// ============================================================
// 全局搜索
// ============================================================
function handleSearch(query) {
  const dd = document.getElementById('searchDropdown');
  query = query.trim();
  if (!query) { dd.classList.remove('show'); return; }

  const q = query.toLowerCase();
  const results = STATE.searchIndex.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.tags.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q)
  ).slice(0, 8);

  if (!results.length) {
    dd.innerHTML = '<div class="search-empty">没有找到相关笔记</div>';
  } else {
    dd.innerHTML = results.map(r => `
      <div class="search-item" onclick="openNote('${r.id}'); closeSearch()">
        <div class="search-item-title">${highlight(r.title, query)}</div>
        <div class="search-item-category">📂 ${r.category}</div>
        ${r.description ? `<div class="search-item-excerpt">${highlight(r.description, query)}</div>` : ''}
      </div>
    `).join('');
  }
  dd.classList.add('show');
}

function highlight(text, query) {
  if (!query) return text;
  const reg = new RegExp('(' + escapeRegex(query) + ')', 'gi');
  return text.replace(reg, '<mark style="background:rgba(79,142,247,0.25);border-radius:3px;padding:0 2px">$1</mark>');
}
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function closeSearch() { document.getElementById('searchDropdown').classList.remove('show'); document.getElementById('globalSearch').value = ''; }

document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar')) closeSearch();
});

// Enter 键跳转搜索页
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) showSearchResults(q);
    }
  });
});

function showSearchResults(query) {
  closeSearch();
  const q = query.toLowerCase();
  const results = STATE.searchIndex.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.tags.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q)
  );
  showView('searchView');
  document.getElementById('searchKeyword').textContent = query;
  document.getElementById('searchCount').textContent = results.length;
  const catMap = getCatMap();
  document.getElementById('searchResults').innerHTML = results.length ? results.map(n => {
    const cat = catMap[n.categoryId] || Object.values(catMap).find(c => c.name === n.category) || {};
    return `
    <div class="note-grid-card search-card" onclick="openNote('${n.id}')">
      <div class="note-grid-title">${highlight(n.title, query)}</div>
      <div class="note-grid-desc">${highlight(n.description || '', query)}</div>
      <div class="note-grid-footer">
        <span class="note-cat-badge">${n.categoryPath || n.category}</span>
      </div>
    </div>`;
  }).join('') : `
  <div class="search-empty-state">
    <div class="search-empty-icon">🔍</div>
    <h3>未找到相关笔记</h3>
    <p>没有找到与 "<strong>${query}</strong>" 相关的笔记</p>
    <p class="search-empty-tip">试试其他关键词，或浏览全部笔记</p>
    <button class="search-empty-btn" onclick="showAllNotes()">浏览全部笔记 →</button>
  </div>`;
}

// ============================================================
// 视图切换
// ============================================================
const VIEWS = ['homeView', 'allNotesView', 'noteView', 'searchView', 'adminView'];
function showView(viewId) {
  VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = v === viewId ? '' : 'none';
  });
  // 非笔记页隐藏目录和进度条
  if (viewId !== 'noteView') {
    document.getElementById('noteToc').style.display = 'none';
    document.getElementById('progressBar').style.width = '0';
    window.removeEventListener('scroll', window._progressHandler);
  }
}

function showHome() {
  showView('homeView');
  setActiveNav('首页');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  STATE.history.pop();
  const prev = STATE.history[STATE.history.length - 1];
  if (prev) {
    if (prev.type === 'note') openNote(prev.id);
    else if (prev.type === 'category') filterByCategory(prev.id);
    else showHome();
  } else {
    showHome();
  }
}

function setActiveNav(name) {
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.textContent.trim() === name);
  });
  if (name === '首页') document.querySelector('.nav-link').classList.add('active');
}

// ============================================================
// 后台管理
// ============================================================
function showAdmin() {
  showView('adminView');
  setActiveNav('后台管理');
  showAdminTab('overview');
}

function showAdminTab(tab) {
  STATE.adminTab = tab;
  document.querySelectorAll('.admin-menu-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick') === `showAdminTab('${tab}')`);
  });
  const main = document.getElementById('adminMain');
  switch (tab) {
    case 'overview': renderAdminOverview(main); break;
    case 'notes': renderAdminNotes(main); break;
    case 'categories': renderAdminCategories(main); break;
    case 'stats': renderAdminStats(main); break;
    case 'new': renderAdminNew(main); break;
  }
}

function renderAdminOverview(el) {
  const totalViews = Object.values(STATE.stats).reduce((a, b) => a + b, 0);
  const latestNote = STATE.notes.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  el.innerHTML = `
    <h2 class="admin-title">📊 数据概览</h2>
    <div class="admin-stats-grid">
      <div class="admin-stat-card">
        <div class="admin-stat-num">${STATE.notes.length}</div>
        <div class="admin-stat-label">总笔记数</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-num">${(STATE.config.categories || []).length}</div>
        <div class="admin-stat-label">分类数</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-num">${totalViews}</div>
        <div class="admin-stat-label">总阅读量</div>
      </div>
    </div>
    <div style="background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border);padding:18px;margin-bottom:16px">
      <div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:10px">📋 最新动态</div>
      ${latestNote ? `<div style="font-size:14px">最近更新：<b>${latestNote.title}</b>（${latestNote.date}）</div>` : '暂无笔记'}
    </div>
    <div style="font-size:13px;color:var(--text-muted);line-height:1.8">
      💡 <b>使用提示：</b><br>
      1. 在 <code>notes/</code> 下对应分类文件夹中新建 <code>.md</code> 文件即可添加笔记<br>
      2. Markdown 文件顶部添加 frontmatter 设置标题、标签等<br>
      3. 编辑 <code>config.json</code> 可自定义分类、个人信息<br>
      4. 运行 <code>generate-index.py</code> 重新生成笔记索引
    </div>`;
}

function renderAdminNotes(el) {
  const catMap = getCatMap();
  el.innerHTML = `
    <h2 class="admin-title">📝 笔记管理</h2>
    <table class="admin-table">
      <thead><tr><th>标题</th><th>分类</th><th>日期</th><th>阅读数</th><th>操作</th></tr></thead>
      <tbody>
        ${STATE.notes.map(n => {
          const cat = catMap[n.categoryId] || catMap[n.categoryPath] || Object.values(catMap).find(c => c.name === n.category || c.path === n.categoryPath) || {};
          return `<tr>
            <td><b>${n.title}</b></td>
            <td><span class="note-cat-badge" style="background:${cat.color || '#4F8EF7'}18;color:${cat.color || '#4F8EF7'}">${n.categoryPath || n.category}</span></td>
            <td>${n.date}</td>
            <td>${STATE.stats[n.id] || 0}</td>
            <td>
              <button class="admin-btn admin-btn-primary" onclick="openNote('${n.id}')" style="margin-right:6px">查看</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderAdminCategories(el) {
  const cats = STATE.config.categories || [];
  el.innerHTML = `
    <h2 class="admin-title">📁 分类管理</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:18px">编辑 <code>config.json</code> 文件中的 categories 字段来管理分类</p>
    <table class="admin-table">
      <thead><tr><th>图标</th><th>名称</th><th>文件夹</th><th>笔记数</th><th>颜色</th></tr></thead>
      <tbody>
        ${cats.map(cat => {
          const count = STATE.notes.filter(n => {
            const idMatch = n.categoryId && cat.id && n.categoryId === cat.id;
            const nameMatch = n.category && n.category === cat.name;
            return idMatch || nameMatch;
          }).length;
          return `<tr>
            <td style="font-size:22px">${cat.icon}</td>
            <td><b>${cat.name}</b></td>
            <td><code>notes/${cat.folder}/</code></td>
            <td>${count}</td>
            <td><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:${cat.color};display:inline-block"></span>${cat.color}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderAdminStats(el) {
  const sorted = STATE.notes
    .map(n => ({ title: n.title, views: STATE.stats[n.id] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  const maxViews = sorted[0]?.views || 1;
  el.innerHTML = `
    <h2 class="admin-title">📈 阅读统计</h2>
    <div class="stats-chart">
      <div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:14px">热门笔记 Top 10</div>
      <div class="bar-chart">
        ${sorted.map(item => `
          <div class="bar-item">
            <span class="bar-label" title="${item.title}">${item.title}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width:${(item.views / maxViews) * 100}%"></div>
            </div>
            <span class="bar-count">${item.views}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderAdminNew(el) {
  const cats = STATE.config.categories || [];
  el.innerHTML = `
    <h2 class="admin-title">✏️ 新建笔记</h2>
    <div style="font-size:13px;color:var(--text-muted);background:var(--bg);border-radius:8px;padding:14px 18px;margin-bottom:22px;border:1px solid var(--border)">
      💡 填写信息后，点击「生成 Markdown 模板」，将内容复制并保存到对应文件夹中
    </div>
    <div class="form-group">
      <label class="form-label">📝 笔记标题 *</label>
      <input class="form-input" id="newTitle" placeholder="例：Vue3 组合式 API 详解">
    </div>
    <div class="form-group">
      <label class="form-label">📁 所属分类 *</label>
      <select class="form-select" id="newCategory">
        ${cats.map(c => `<option value="${c.id}" data-folder="${c.folder}">${c.icon} ${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">🏷️ 标签（逗号分隔）</label>
      <input class="form-input" id="newTags" placeholder="例：Vue3, 前端, 组合式API">
    </div>
    <div class="form-group">
      <label class="form-label">📄 简介</label>
      <input class="form-input" id="newDesc" placeholder="一句话描述这篇笔记">
    </div>
    <div class="form-group">
      <label class="form-label">✍️ 笔记内容（Markdown）</label>
      <textarea class="form-textarea" id="newContent" placeholder="# 笔记标题&#10;&#10;开始写你的笔记..."></textarea>
    </div>
    <div style="display:flex;gap:12px;margin-top:8px">
      <button class="admin-btn admin-btn-primary" onclick="generateTemplate()" style="padding:10px 24px">📋 生成 Markdown 模板</button>
      <button class="admin-btn" onclick="previewNote()" style="padding:10px 24px;border:1px solid var(--border)">👁️ 预览效果</button>
    </div>
    <div id="generatedTemplate" style="display:none;margin-top:20px">
      <div class="form-label" style="margin-bottom:8px">📋 生成的 Markdown（复制并保存到对应文件夹）：</div>
      <div style="position:relative">
        <pre id="templateContent" style="background:var(--bg-code);padding:18px;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:13px;overflow-x:auto;white-space:pre-wrap"></pre>
        <button class="copy-btn" onclick="copyTemplate()">复制</button>
      </div>
      <div id="savePathHint" style="margin-top:10px;font-size:13px;color:var(--primary);font-weight:600"></div>
    </div>`;
}

function generateTemplate() {
  const title = document.getElementById('newTitle').value.trim();
  const catEl = document.getElementById('newCategory');
  const catName = catEl.options[catEl.selectedIndex].text.replace(/^[^\w\u4e00-\u9fa5]+/, '').trim();
  const folder = catEl.options[catEl.selectedIndex].dataset.folder;
  const tags = document.getElementById('newTags').value.split(',').map(t => t.trim()).filter(Boolean);
  const desc = document.getElementById('newDesc').value.trim();
  const content = document.getElementById('newContent').value;
  const date = new Date().toISOString().slice(0, 10);

  if (!title) { showToast('请填写笔记标题'); return; }

  const template = `---
title: ${title}
category: ${catName}
tags: [${tags.join(', ')}]
date: ${date}
description: ${desc}
---

${content || `# ${title}\n\n> 开始你的学习笔记...\n\n## 主要内容\n\n`}`;

  document.getElementById('generatedTemplate').style.display = 'block';
  document.getElementById('templateContent').textContent = template;
  document.getElementById('savePathHint').textContent =
    `💾 保存路径：notes/${folder}/${title}.md`;
}

function copyTemplate() {
  const content = document.getElementById('templateContent').textContent;
  navigator.clipboard.writeText(content).then(() => showToast('模板已复制到剪贴板！'));
}

// ============================================================
// 统计记录（LocalStorage 持久化）
// ============================================================
async function loadStats() {
  try {
    const url = API_BASE + '/api/stats?' + Date.now();
    console.log('[Stats] 正在从 API 获取:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('API 返回错误: ' + res.status);
    const data = await res.json();
    console.log('[Stats] API 返回数据 total_views:', data.total_views, 'views:', data.views);
    STATE.stats = data.views || {};
    STATE.totalViews = data.total_views || 0;
  } catch (e) {
    console.warn('[Stats] API 获取失败，使用降级方案:', e.message);
    try { STATE.stats = JSON.parse(localStorage.getItem('shuo_blog_stats') || '{}'); }
    catch (e2) { STATE.stats = {}; }
    STATE.totalViews = Object.values(STATE.stats).reduce((a, b) => a + b, 0);
    console.log('[Stats] 降级 localStorage stats:', STATE.stats);
  }
  // 学习天数：固定从 2025-02-03 起算（2026-04-09 = 第400天），每天自动 +1
  STATE.studyStartDate = new Date('2025-02-03T00:00:00');
}

function recordView(noteId) {
  if (!noteId) return;
  // 更新本地存储（前台显示用）
  STATE.stats[noteId] = (STATE.stats[noteId] || 0) + 1;
  try { localStorage.setItem('shuo_blog_stats', JSON.stringify(STATE.stats)); } catch (e) {}
  // 调用后端 API（后台仪表盘统计用）
  try {
    fetch(`${API_BASE}/api/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: noteId }),
    });
  } catch (e) {
    console.warn('记录阅读失败', e);
  }
}

function updateStatsDisplay() {
  document.getElementById('totalNotes').textContent = STATE.notes.length;
  document.getElementById('totalCategories').textContent = (STATE.config.categories || []).length;
  // 学习天数：从固定起点自动计算
  const days = STATE.studyStartDate
    ? Math.max(1, Math.ceil((Date.now() - STATE.studyStartDate.getTime()) / 86400000))
    : 1;
  document.getElementById('totalDays').textContent = days;
  // 总阅读量
  document.getElementById('totalViews').textContent = STATE.totalViews || 0;
}

// ============================================================
// 主题切换
// ============================================================
function loadTheme() {
  const saved = localStorage.getItem('shuo_blog_theme') || 'auto';
  applyTheme(saved);
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('shuo_blog_theme', next);
}

function applyTheme(theme) {
  STATE.theme = theme;
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
  // 代码高亮主题
  const hlLink = document.getElementById('highlight-theme');
  if (hlLink) hlLink.href = theme === 'dark'
    ? 'assets/css/highlight-dark.min.css'
    : 'assets/css/highlight.min.css';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (STATE.theme === 'auto') applyTheme('auto');
});

// ============================================================
// 侧边栏折叠
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  STATE.sidebarOpen = !sidebar.classList.contains('collapsed');
}

// ============================================================
// 滚动事件
// ============================================================
function setupScrollEvents() {
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Toast 通知
// ============================================================
function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ============================================================
// 工具函数
// ============================================================
function getCatMap() {
  const map = {};
  // 优先使用扁平分类列表（带路径），否则用树形
  if (STATE.flatCategories && STATE.flatCategories.length) {
    STATE.flatCategories.forEach(c => { map[c.id] = c; map[c.path] = c; });
  } else {
    (STATE.config.categories || []).forEach(c => { map[c.id] = c; });
  }
  return map;
}

// ============================================================
// 启动
// ============================================================
window.addEventListener('DOMContentLoaded', init);
