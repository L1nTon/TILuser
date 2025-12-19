const API_BASE = (() => {
  const env = window.API_BASE_URL || window.VITE_API_BASE_URL
  if (env) return env
  if (window.location.port === '5173') return 'http://localhost:8000'
  return 'http://localhost:8000'
})()

const params = new URLSearchParams(window.location.search)
let currentLang = params.get('lang') || 'ru'
const slug = params.get('slug')

const langButtons = document.querySelectorAll('[data-lang]')
const titleEl = document.getElementById('post-title')
const excerptEl = document.getElementById('post-excerpt')
const bodyEl = document.getElementById('post-body')
const metaEl = document.getElementById('post-meta')

function syncLangButtons() {
  langButtons.forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-lang') === currentLang)
  })
}

async function loadPost() {
  if (!slug) {
    titleEl.textContent = 'Нет slug'
    return
  }
  titleEl.textContent = 'Загрузка...'
  excerptEl.textContent = ''
  bodyEl.innerHTML = ''
  metaEl.textContent = ''
  try {
    let rightSlug = slug.slice(0, -2) + currentLang;
    const res = await fetch(`${API_BASE}/api/public/blog/${rightSlug}`)
    if (!res.ok) throw new Error('Не найдено')
    const data = await res.json()
    titleEl.textContent = data.title
    excerptEl.textContent = data.excerpt || ''
    bodyEl.innerHTML = data.body || ''
    metaEl.textContent = `${data.locale.toUpperCase()} · ${data.is_published ? 'Опубликовано' : 'Черновик'}`
  } catch (err) {
    titleEl.textContent = 'Пост не найден'
    console.warn(err)
  }
}

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentLang = btn.getAttribute('data-lang')
    syncLangButtons()
    loadPost()
  })
})

syncLangButtons()
loadPost()
