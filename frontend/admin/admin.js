// Базовый адрес API. По умолчанию стучимся на локальный бекенд uvicorn.
const API_BASE = (() => {
  const env = window.API_BASE_URL || window.VITE_API_BASE_URL
  if (env) return env
  return 'http://localhost:8000'
})()

const LOCALES = ['ru', 'uz', 'en', 'ja']

function baseSlug(slug) {
  if (!slug) return ''
  const parts = slug.split('-')
  const last = parts[parts.length - 1]
  return LOCALES.includes(last) ? parts.slice(0, -1).join('-') : slug
}

function siblingLocaleMap(section, record) {
  const map = {}
  if (!record) return map
  const items = state.data[section] || []
  if (section === 'courses' || section === 'blog') {
    const base = baseSlug(record.slug)
    items.forEach((item) => {
      if (baseSlug(item.slug) === base) {
        map[item.locale || ''] = item
      }
    })
  } else {
    map[record.locale || ''] = record
  }
  return map
}

const state = {
  token: localStorage.getItem('adminToken') || null,
  section: 'courses',
  data: {},
  modal: null, // {section, mode, record}
  message: '',
  sidebarOpen: false,
}

const sections = [
  { id: 'courses', label: 'Курсы', icon: '📚' },
  { id: 'track', label: 'Трек', icon: '🧭' },
  { id: 'reviews', label: 'Отзывы', icon: '💬' },
  { id: 'partners', label: 'Партнёры', icon: '🤝' },
  { id: 'blog', label: 'Блог', icon: '📝' },
  { id: 'contacts', label: 'Контакты', icon: '📇' },
  { id: 'applications', label: 'Заявки', icon: '📨' },
]

const adminRoot = document.getElementById('admin-root')

function setMessage(msg, isError = false) {
  state.message = msg ? `${isError ? '⚠️ ' : ''}${msg}` : ''
  const msgEl = document.getElementById('admin-message')
  if (msgEl) {
    msgEl.textContent = state.message
    msgEl.style.color = isError ? '#b91c1c' : '#0f172a'
  }
}

async function api(path, options = {}) {
  const headers = Object.assign({}, options.headers || {}, { 'Content-Type': 'application/json' })
  if (state.token) headers.Authorization = `Bearer ${state.token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('adminToken')
    state.token = null
    render()
    throw new Error('Нужен вход')
  }
  if (!res.ok) throw new Error(await res.text())
  return res.status === 204 ? null : res.json()
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File) || !file.size) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result || '').toString().split(',').pop() || null)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function loadSection(section) {
  setMessage('Загрузка...')
  const map = {
    courses: '/api/admin/courses',
    track: '/api/admin/track',
    reviews: '/api/admin/reviews',
    partners: '/api/admin/partners',
    blog: '/api/admin/blog',
    contacts: '/api/admin/contacts',
    applications: '/api/admin/applications',
  }
  const url = map[section]
  if (!url) return
  try {
    const data = await api(url)
    state.data[section] = data
    setMessage('Данные обновлены')
  } catch (err) {
    setMessage(err.message || 'Ошибка загрузки', true)
  }
  render()
}

function renderLogin() {
  adminRoot.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div class="card" style="width: 360px;">
        <div class="text-sm text-slate-500 mb-2">Вход в админку</div>
        <div class="text-xl font-semibold mb-4">Educational Center</div>
        <form id="login-form" class="kv" style="gap:10px;">
          <div>
            <label class="label">Логин</label>
            <input name="login" class="input" placeholder="admin" required />
          </div>
          <div>
            <label class="label">Пароль</label>
            <input type="password" name="password" class="input" placeholder="пароль" required />
          </div>
          <button class="btn btn-primary w-full" type="submit" title="Войти">🔑</button>
          <div id="login-status" class="text-xs text-slate-500"></div>
        </form>
      </div>
    </div>
  `
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = { login: fd.get('login'), password: fd.get('password') }
    const status = document.getElementById('login-status')
    status.textContent = 'Проверяем...'
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload), headers: {} })
      state.token = data.access_token
      localStorage.setItem('adminToken', state.token)
      status.textContent = 'Успешно'
      loadSection(state.section)
    } catch (err) {
      status.textContent = err.message || 'Ошибка'
    }
  })
}

function renderSidebar() {
  return `
    <div class="sidebar">
      <div class="logo">
        <div class="h-10 w-10 rounded-xl bg-primary-500 text-white grid place-items-center font-bold">EC</div>
        <div>
          <div class="text-xs text-slate-300">Админка</div>
          <div class="font-semibold">Educational Center</div>
        </div>
      </div>
      <nav>
        ${sections
          .map(
            (s) => `<button class="nav-btn ${state.section === s.id ? 'active' : ''}" data-section="${s.id}" title="${s.label}">
              <span style="margin-right:8px;">${s.icon || '•'}</span> ${s.label}
            </button>`
          )
          .join('')}
      </nav>
      <div style="padding:12px 16px; border-top: 1px solid rgba(255,255,255,0.08);">
        <button class="btn btn-ghost w-full" id="logout-btn" title="Выйти">🚪Выйти</button>
      </div>
    </div>
  `
}

function listTable(section) {
  const raw = state.data[section] || []
  let data = raw
  if (section === 'courses' || section === 'blog') {
    const groups = {}
    raw.forEach((item) => {
      const key = baseSlug(item.slug)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    data = Object.values(groups).map((items) => {
      const main = items[0]
      return {
        ...main,
        groupedLocales: items.map((i) => i.locale).join(', '),
        groupedIds: items.map((i) => i.id),
      }
    })
  }
  const buttonAdd = section === 'applications' ? '' : `<button class="btn btn-primary" data-open="${section}" title="Добавить">➕</button>`
  const visibleData = data
  const rows = {
    courses: () =>
      visibleData
        .map(
          (c) => `
        <tr>
          <td>${c.name}</td>
          <td>${c.groupedLocales || c.locale}</td>
          <td>${c.language}</td>
          <td>${c.price ?? ''}</td>
          <td>${c.is_active ? '<span class="badge badge-green">Активен</span>' : '<span class="badge badge-gray">Скрыт</span>'}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="courses" data-id="${c.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="courses" data-id="${c.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    track: () =>
      visibleData
        .map(
          (t) => `
        <tr>
          <td>#${t.order ?? 0}</td>
          <td>${t.title}</td>
          <td>${t.locale}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="track" data-id="${t.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="track" data-id="${t.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    reviews: () =>
      visibleData
        .map(
          (r) => `
        <tr>
          <td>${r.name}</td>
          <td>${r.locale}</td>
          <td>${r.role ?? ''}</td>
          <td>${r.is_visible ? 'Видим' : 'Скрыт'}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="reviews" data-id="${r.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="reviews" data-id="${r.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    partners: () =>
      visibleData
        .map(
          (p) => `
        <tr>
          <td>${p.logo_base64 ? `<img src="data:image/png;base64,${p.logo_base64}" alt="${p.name || ''}" style="height:40px;object-fit:contain;">` : ''}</td>
          <td>${p.name || ''}</td>
          <td>#${p.order ?? 0}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="partners" data-id="${p.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="partners" data-id="${p.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    blog: () =>
      visibleData
        .map(
          (b) => `
        <tr>
          <td>${b.title}</td>
          <td>${b.slug}</td>
          <td>${b.locale}</td>
          <td>${b.is_published ? 'Опубликован' : 'Черновик'}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="blog" data-id="${b.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="blog" data-id="${b.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    contacts: () =>
      visibleData
        .map(
          (c) => `
        <tr>
          <td>${c.locale}</td>
          <td>${c.address ?? ''}</td>
          <td>${c.phone ?? ''}</td>
          <td>${c.email ?? ''}</td>
          <td class="text-right">
            <button class="btn btn-ghost" data-edit="contacts" data-id="${c.id}" title="Редактировать">✏️</button>
            <button class="btn" data-delete="contacts" data-id="${c.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
    applications: () =>
      data
        .map(
          (a) => `
        <tr>
          <td>#${a.id}</td>
          <td>${a.name}</td>
          <td>${a.phone}</td>
          <td>${a.course_title ?? '—'}</td>
          <td>${a.status}</td>
          <td class="text-right">
            ${['new', 'in_progress', 'done']
              .map(
                (s) => `<button class="btn btn-ghost" data-status="${s}" data-id="${a.id}" title="${s}">${
                  s === 'new' ? '🆕' : s === 'in_progress' ? '⏳' : '✅'
                }</button>`
              )
              .join('')}
            <button class="btn" data-delete="applications" data-id="${a.id}" title="Удалить">🗑️</button>
          </td>
        </tr>`
        )
        .join(''),
  }[section]

  return `
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div>
          <div class="text-sm text-slate-500">Раздел</div>
          <div class="text-xl font-semibold">${sections.find((s) => s.id === section)?.label ?? ''}</div>
        </div>
        ${buttonAdd}
      </div>
      <div class="overflow-auto">
        <table class="table">
          <thead>
            <tr>
              ${
                {
                  courses: '<th>Название</th><th>Locale</th><th>Язык</th><th>Цена</th><th>Статус</th><th></th>',
                  track: '<th>#</th><th>Название</th><th>Locale</th><th></th>',
                  reviews: '<th>Имя</th><th>Locale</th><th>Роль</th><th>Статус</th><th></th>',
                  partners: '<th>Лого</th><th>Имя</th><th>Порядок</th><th></th>',
                  blog: '<th>Заголовок</th><th>Slug</th><th>Locale</th><th>Статус</th><th></th>',
                  contacts: '<th>Locale</th><th>Адрес</th><th>Телефон</th><th>Email</th><th></th>',
                  applications: '<th>ID</th><th>Имя</th><th>Телефон</th><th>Курс</th><th>Статус</th><th></th>',
                }[section] || ''
              }
            </tr>
          </thead>
          <tbody>
            ${rows ? rows() : ''}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderLayout() {
  adminRoot.innerHTML = `
    <div style="display:flex; min-height:100vh;">
      ${renderSidebar()}
      <div class="main" style="flex:1; flex-direction:column;">
        <div class="header">
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-ghost mobile-only" id="sidebar-toggle" title="Меню">☰</button>
            <div class="text-xs text-slate-500">API</div>
            <div class="text-sm font-semibold">${API_BASE}</div>
          </div>
          <div id="admin-message" class="text-sm text-slate-600">${state.message || ''}</div>
        </div>
        <div class="content" id="content-area">${listTable(state.section)}</div>
      </div>
    </div>
    ${state.modal ? renderModal(state.modal) : ''}
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `
  document.body.classList.toggle('sidebar-open', state.sidebarOpen)
}

function renderModal(modal) {
  const { section, mode, record } = modal
  const localeMap = siblingLocaleMap(section, record)
  const titleMap = {
    courses: 'Курс',
    track: 'Этап трека',
    reviews: 'Отзыв',
    partners: 'Партнёр',
    blog: 'Пост',
    contacts: 'Контакты',
  }
  const title = `${mode === 'edit' ? 'Редактировать' : 'Создать'} ${titleMap[section] ?? ''}`

  const val = (loc, key) => (localeMap?.[loc]?.[key] != null ? localeMap[loc][key] : '')
  const valArr = (loc, key) => (Array.isArray(localeMap?.[loc]?.[key]) ? localeMap[loc][key].join('\n') : '')

  const forms = {
    courses: `
      <label class="label">Slug (база, без пробелов)</label><input name="slug" class="input" value="${record?.slug ?? ''}" required />
      <label class="label">Язык курса (ru/uz/en/ja)</label><input name="language" class="input" value="${record?.language ?? ''}" required />
      <div class="kv" style="grid-template-columns: repeat(auto-fit,minmax(140px,1fr));">
        <div><label class="label">Цена</label><input name="price" class="input" value="${record?.price ?? ''}" /></div>
        <div><label class="label">Скидка</label><input name="discount" class="input" value="${record?.discount ?? ''}" /></div>
        <div><label class="label">Длительность</label><input name="duration" class="input" value="${record?.duration ?? ''}" /></div>
      </div>
      <label class="label">Уровень</label><input name="level" class="input" value="${record?.level ?? ''}" />
      <label class="label"><input type="checkbox" name="is_active" ${record ? (record.is_active ? 'checked' : '') : 'checked'} /> Активен</label>
      <div class="locale-grid">
        ${LOCALES.map(
          (loc) => `
          <div class="locale-card">
            <div class="locale-title">Locale: ${loc}</div>
            <label class="label">Название (${loc})</label><input name="name_${loc}" class="input" value="${val(loc, 'name')}" ${mode === 'create' ? '' : record?.locale === loc ? 'required' : ''} />
            <label class="label">Преимущества (${loc}, по строкам)</label><textarea name="advantages_${loc}" class="input" rows="3">${valArr(
              loc,
              'advantages'
            )}</textarea>
            <label class="label">Описание (${loc})</label><textarea name="description_${loc}" class="input" rows="3">${val(loc, 'description')}</textarea>
          </div>
        `
        ).join('')}
      </div>
    `,
    track: `
      <label class="label">Порядок</label><input name="order" type="number" class="input" value="${record?.order ?? 0}" />
      <label class="label">Ссылки (по строкам)</label><textarea name="course_links" class="input" rows="3">${Array.isArray(record?.course_links) ? record.course_links.join('\n') : ''}</textarea>
      <div class="locale-grid">
        ${LOCALES.map(
          (loc) => `
          <div class="locale-card">
            <div class="locale-title">Locale: ${loc}</div>
            <label class="label">Заголовок (${loc})</label><input name="title_${loc}" class="input" value="${val(loc, 'title')}" ${mode === 'create' ? '' : record?.locale === loc ? 'required' : ''} />
            <label class="label">Описание (${loc})</label><textarea name="body_${loc}" class="input" rows="3">${val(loc, 'body')}</textarea>
          </div>
        `
        ).join('')}
      </div>
    `,
    reviews: `
      <label class="label"><input type="checkbox" name="is_visible" ${record ? (record.is_visible ? 'checked' : '') : 'checked'} /> Показывать</label>
      <div class="locale-grid">
        ${LOCALES.map(
          (loc) => `
          <div class="locale-card">
            <div class="locale-title">Locale: ${loc}</div>
            <label class="label">Имя (${loc})</label><input name="name_${loc}" class="input" value="${val(loc, 'name')}" ${mode === 'create' ? '' : record?.locale === loc ? 'required' : ''} />
            <label class="label">Роль (${loc})</label><input name="role_${loc}" class="input" value="${val(loc, 'role')}" />
            <label class="label">Отзыв (${loc})</label><textarea name="quote_${loc}" class="input" rows="3">${val(loc, 'quote')}</textarea>
          </div>
        `
        ).join('')}
      </div>
    `,
    partners: `
      <label class="label">Название (опционально)</label><input name="name_single" class="input" value="${record?.name ?? ''}" />
      <label class="label">Порядок</label><input name="order" type="number" class="input" value="${record?.order ?? 0}" />
      <label class="label">Логотип</label><input type="file" name="logo_single" class="input" accept="image/*" />
    `,
    blog: `
      <label class="label">Slug (база, без пробелов)</label><input name="slug" class="input" value="${record?.slug ?? ''}" required />
      <label class="label"><input type="checkbox" name="is_published" ${record ? (record.is_published ? 'checked' : '') : 'checked'} /> Опубликовано</label>
      <div class="locale-grid">
        ${LOCALES.map(
          (loc) => `
          <div class="locale-card">
            <div class="locale-title">Locale: ${loc}</div>
            <label class="label">Заголовок (${loc})</label><input name="title_${loc}" class="input" value="${val(loc, 'title')}" ${mode === 'create' ? '' : record?.locale === loc ? 'required' : ''} />
            <label class="label">Кратко (${loc})</label><textarea name="excerpt_${loc}" class="input" rows="2">${val(loc, 'excerpt')}</textarea>
            <label class="label">Текст (${loc})</label><textarea name="body_${loc}" class="input" rows="4">${val(loc, 'body')}</textarea>
            <label class="label">SEO Title (${loc})</label><input name="seo_title_${loc}" class="input" value="${val(loc, 'seo_title')}" />
            <label class="label">SEO Description (${loc})</label><input name="seo_description_${loc}" class="input" value="${val(loc, 'seo_description')}" />
          </div>
        `
        ).join('')}
      </div>
    `,
    contacts: `
      <label class="label">Адрес</label><input name="address" class="input" value="${record?.address ?? ''}" />
      <label class="label">Телефон</label><input name="phone" class="input" value="${record?.phone ?? ''}" />
      <label class="label">Email</label><input name="email" class="input" value="${record?.email ?? ''}" />
      <label class="label">Соцсети — JSON или key:value</label><textarea name="socials" class="input" rows="2">${
        record?.socials ? JSON.stringify(record.socials) : ''
      }</textarea>
      <label class="label">Код карты</label><textarea name="map_embed" class="input" rows="2">${record?.map_embed ?? ''}</textarea>
    `,
  }[section]

  return `
    <div class="modal-backdrop">
      <div class="modal">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;">
          <div>
            <div class="text-xs text-slate-500">${section}</div>
            <div class="text-lg font-semibold">${title}</div>
          </div>
          <button class="btn" id="modal-close" title="Закрыть">✖</button>
        </div>
        <form id="modal-form" class="kv" style="gap:10px;">
          ${forms || '<p class="text-sm text-slate-500">Форма не доступна</p>'}
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-primary" type="submit" title="${mode === 'edit' ? 'Сохранить' : 'Создать'}">${mode === 'edit' ? '💾' : '➕'}</button>
            <button class="btn" type="button" id="modal-cancel" title="Отмена">✖</button>
          </div>
        </form>
      </div>
    </div>
  `
}

function render() {
  if (!state.token) {
    renderLogin()
    return
  }
  renderLayout()
  bindEvents()
}

function bindEvents() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.section = btn.getAttribute('data-section')
      state.modal = null
      state.sidebarOpen = false
      loadSection(state.section)
    })
  })

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('adminToken')
    state.token = null
    state.data = {}
    render()
  })

  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen
    render()
  })
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    state.sidebarOpen = false
    render()
  })

  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-open')
      state.modal = { section, mode: 'create', record: null }
      render()
    })
  })

  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-edit')
      const id = Number(btn.getAttribute('data-id'))
      let record = (state.data[section] || []).find((i) => i.id === id)
      if ((section === 'courses' || section === 'blog') && !record?.slug.includes('-')) {
        // если клик по сгруппированному — раскрываем первую запись
        record = (state.data[section] || []).find((i) => baseSlug(i.slug) === baseSlug(record?.slug))
      }
      if (!record) return
      state.modal = { section, mode: 'edit', record }
      render()
    })
  })

  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const section = btn.getAttribute('data-delete')
      const id = Number(btn.getAttribute('data-id'))
      if (!confirm('Удалить запись?')) return
      try {
        setMessage('Удаляем...')
        if (section === 'courses' || section === 'blog') {
          const items = state.data[section] || []
          const record = items.find((i) => i.id === id)
          const base = baseSlug(record?.slug || '')
          const idsToDelete = items
            .filter((i) => (section === 'courses' || section === 'blog') && baseSlug(i.slug) === base)
            .map((i) => i.id)
          for (const targetId of idsToDelete) {
            await api(`/api/admin/${section}/${targetId}`, { method: 'DELETE' })
          }
        } else {
          await api(`/api/admin/${section}/${id}`, { method: 'DELETE' })
        }
        loadSection(section)
      } catch (err) {
        setMessage(err.message || 'Ошибка удаления', true)
      }
    })
  })

  document.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const status = btn.getAttribute('data-status')
      const id = btn.getAttribute('data-id')
      try {
        setMessage('Обновляем статус...')
        await api(`/api/admin/applications/${id}?status_value=${status}`, { method: 'PATCH' })
        loadSection('applications')
      } catch (err) {
        setMessage(err.message || 'Ошибка', true)
      }
    })
  })

  // Modal events
  document.getElementById('modal-close')?.addEventListener('click', () => {
    state.modal = null
    render()
  })
  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    state.modal = null
    render()
  })

  const modalForm = document.getElementById('modal-form')
  modalForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(modalForm)
    const section = state.modal.section
    const mode = state.modal.mode
    const record = state.modal.record
    try {
      setMessage('Сохраняем...')
      const parseLines = (val) =>
        (val || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)

      const parseSocials = (raw) => {
        if (!raw) return null
        try {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
        } catch {
          const lines = parseLines(raw)
          if (!lines.length) return null
          const map = {}
          lines.forEach((l) => {
            const [k, v] = l.split(':').map((s) => s.trim())
            if (k && v) map[k] = v
          })
          return Object.keys(map).length ? map : null
        }
        return null
      }

      const payloads = []
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const recordLocale = record?.locale || 'ru'

      switch (section) {
        case 'courses': {
          const slugBase = (fd.get('slug') || '').trim()
          if (!slugBase) throw new Error('Укажите slug')
          const common = {
            language: (fd.get('language') || '').trim(),
            level: (fd.get('level') || '').trim() || null,
            price: (fd.get('price') || '').trim() || null,
            discount: (fd.get('discount') || '').trim() || null,
            duration: (fd.get('duration') || '').trim() || null,
            is_active: fd.get('is_active') === 'on',
          }

          if (!common.language) throw new Error('Укажите язык курса')

          const base = baseSlug(slugBase) || slugBase
          const existing = state.data.courses || []
          LOCALES.forEach((loc) => {
            const name = (fd.get(`name_${loc}`) || '').trim()
            const desc = (fd.get(`description_${loc}`) || '').trim()
            const advantagesArr = parseLines(fd.get(`advantages_${loc}`))
            const hasData = name || desc || advantagesArr.length
            if (!hasData) return
            const targetExisting = existing.find((i) => baseSlug(i.slug) === base && i.locale === loc)
            const payload = {
              ...common,
              slug: targetExisting?.slug || `${base}-${loc}`,
              name,
              description: desc || null,
              advantages: advantagesArr.length ? advantagesArr : null,
              locale: loc,
            }
            payloads.push(payload)
          })
          if (mode === 'edit' && !payloads.length) throw new Error('Заполните поля для нужной локали')
          break
        }
        case 'track': {
          const links = parseLines(fd.get('course_links'))
          const common = {
            order: Number(fd.get('order')) || 0,
            course_links: links.length ? links : null,
          }

          if (mode === 'edit') {
            const loc = recordLocale
            const title = (fd.get(`title_${loc}`) || '').trim()
            if (!title) throw new Error('Заголовок обязателен')
            const payload = {
              ...common,
              title,
              body: (fd.get(`body_${loc}`) || '').trim() || null,
              locale: loc,
            }
            payloads.push(payload)
          } else {
            LOCALES.forEach((loc) => {
              const title = (fd.get(`title_${loc}`) || '').trim()
              const body = (fd.get(`body_${loc}`) || '').trim()
              if (!title && !body) return
              const payload = { ...common, title, body: body || null, locale: loc }
              payloads.push(payload)
            })
          }
          break
        }
        case 'reviews': {
          const common = {
            is_visible: fd.get('is_visible') === 'on',
          }
          if (mode === 'edit') {
            const loc = recordLocale
            const name = (fd.get(`name_${loc}`) || '').trim()
            const quote = (fd.get(`quote_${loc}`) || '').trim()
            if (!name || !quote) throw new Error('Имя и отзыв обязательны')
            const payload = {
              ...common,
              name,
              role: (fd.get(`role_${loc}`) || '').trim() || null,
              quote,
              locale: loc,
            }
            payloads.push(payload)
          } else {
            LOCALES.forEach((loc) => {
              const name = (fd.get(`name_${loc}`) || '').trim()
              const quote = (fd.get(`quote_${loc}`) || '').trim()
              const role = (fd.get(`role_${loc}`) || '').trim()
              if (!name && !quote && !role) return
              if (!name || !quote) return
              payloads.push({ ...common, name, role: role || null, quote, locale: loc })
            })
          }
          break
        }
        case 'partners': {
          const common = {
            url: (fd.get('url') || '').trim() || null,
            order: Number(fd.get('order')) || 0,
          }
          const name = (fd.get('name_single') || '').trim() || null
          const file = fd.get('logo_single')
          const logo_base64 = (await readFileAsBase64(file)) || record?.logo_base64 || null
          if (!logo_base64 && !name) throw new Error('Добавьте логотип партнёра')
          payloads.push({
            ...common,
            name,
            locale: 'ru',
            logo_base64,
          })
          break
        }
        case 'blog': {
          const slugBase = (fd.get('slug') || '').trim()
          if (mode === 'create' && !slugBase) throw new Error('Укажите slug')
          const common = {
            is_published: fd.get('is_published') === 'on',
          }
          if (mode === 'edit') {
            const loc = recordLocale
            const title = (fd.get(`title_${loc}`) || '').trim()
            const body = (fd.get(`body_${loc}`) || '').trim()
            if (!title || !body) throw new Error('Заголовок и текст обязательны')
            const payload = {
              ...common,
              slug: slugBase || record?.slug || '',
              title,
              body,
              excerpt: (fd.get(`excerpt_${loc}`) || '').trim() || null,
              seo_title: (fd.get(`seo_title_${loc}`) || '').trim() || null,
              seo_description: (fd.get(`seo_description_${loc}`) || '').trim() || null,
              locale: loc,
            }
            payloads.push(payload)
          } else {
            LOCALES.forEach((loc) => {
              const title = (fd.get(`title_${loc}`) || '').trim()
              const body = (fd.get(`body_${loc}`) || '').trim()
              const excerpt = (fd.get(`excerpt_${loc}`) || '').trim()
              const seoTitle = (fd.get(`seo_title_${loc}`) || '').trim()
              const seoDesc = (fd.get(`seo_description_${loc}`) || '').trim()
              const hasData = title || body || excerpt || seoTitle || seoDesc
              if (!hasData) return
              if (!title || !body) return
              payloads.push({
                ...common,
                slug: slugBase ? `${slugBase}-${loc}` : '',
                title,
                body,
                excerpt: excerpt || null,
                seo_title: seoTitle || null,
                seo_description: seoDesc || null,
                locale: loc,
              })
            })
          }
          break
        }
        case 'contacts': {
          const socials = parseSocials(fd.get('socials'))
          payloads.push({
            locale: recordLocale || 'ru',
            address: (fd.get('address') || '').trim() || null,
            phone: (fd.get('phone') || '').trim() || null,
            email: (fd.get('email') || '').trim() || null,
            socials: socials || null,
            map_embed: (fd.get('map_embed') || '').trim() || null,
          })
          break
        }
        default:
          break
      }

      if (!payloads.length) throw new Error('Заполните хотя бы один язык')

      if (mode === 'edit' && !record?.id) throw new Error('Нет ID записи для обновления')

      if (mode === 'edit') {
        if (section === 'courses' || section === 'blog') {
          // Обновляем каждую локаль отдельно по её id
          const items = state.data[section] || []
          for (const payload of payloads) {
            const target = items.find((i) => i.locale === payload.locale && baseSlug(i.slug) === baseSlug(record.slug))
            if (target?.id) {
              await api(`/api/admin/${section}/${target.id}`, { method, body: JSON.stringify(payload) })
            } else {
              await api(`/api/admin/${section}`, { method: 'POST', body: JSON.stringify(payload) })
            }
          }
        } else {
          // остальные сущности — один id
          const targetUrl = `/api/admin/${section}/${record?.id}`
          for (const payload of payloads) {
            await api(targetUrl, { method, body: JSON.stringify(payload) })
          }
        }
      } else {
        const targetUrl = `/api/admin/${section}`
        for (const payload of payloads) {
          await api(targetUrl, { method, body: JSON.stringify(payload) })
        }
      }

      state.modal = null
      loadSection(section)
    } catch (err) {
      setMessage(err.message || 'Ошибка сохранения', true)
    }
  })
}

// init
if (state.token) {
  loadSection(state.section)
} else {
  renderLogin()
}
