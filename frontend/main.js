const API_BASE = (() => {
  const env = window.API_BASE_URL || window.VITE_API_BASE_URL
  if (env) return env
  if (window.location.port === '5173') return 'http://localhost:8000'
  return "http://localhost:8000"
})()

const i18n = {
  ru: {
    hero_tagline: 'Учись. Расти. Побеждай.',
    nav_courses: 'Курсы',
    nav_track: 'Трек',
    nav_blog: 'Блог',
    nav_contacts: 'Контакты',
    cta_apply: 'Оставить заявку',
    hero_lead: 'Технологии. Языки. Карьера.',
    hero_title: 'Премиальное обучение с реальным результатом',
    hero_subtitle: 'Интенсивные курсы, индивидуальный трек развития и поддержка менторов 24/7. Учись там, где ценят время.',
    btn_choose: 'Выбрать курс',
    btn_how: 'Как мы учим',
    stat_langs: 'Языка обучения',
    stat_hw: 'Проверка ДЗ',
    stat_support: 'Поддержка',
    stat_projects: 'Пет‑проекта',
    stat_live: 'Обновление данных с сервера',
    section_courses: 'Курсы',
    section_courses_sub: 'Актуальные направления с живыми менторами.',
    section_track: 'Трек развития',
    section_track_sub: 'Пошаговый план до результата.',
    section_reviews: 'Отзывы',
    section_reviews_sub: 'Результаты студентов и партнёров.',
    section_blog: 'Блог',
    section_blog_sub: 'Полезные материалы и новости.',
    section_contacts: 'Контакты',
    section_contacts_sub: 'Мы всегда на связи.',
    contact_address: 'Адрес',
    contact_phone: 'Телефон',
    contact_email: 'Почта',
    contact_socials: 'Соцсети',
    form_title: 'Оставьте заявку',
    form_subtitle: 'Свяжемся за 10 минут',
    form_name: 'Имя',
    form_phone: 'Телефон',
    form_tg: 'Telegram',
    form_course: 'Курс',
    form_submit: 'Отправить',
    ph_name: 'Ваше имя',
    ph_phone: '+998...',
    ph_tg: '@username',
    ph_course: 'Название или выберите ниже',
    empty_courses: 'Нет курсов',
    empty_track: 'Нет шагов трека',
    empty_reviews: 'Нет отзывов',
    empty_blog: 'Нет записей',
    empty_contacts: 'Контакты не указаны',
    course_active: 'Активен',
    course_hidden: 'Скрыт',
  },
  uz: {
    hero_tagline: 'O‘qing. O‘sib. G‘alaba qozon.',
    nav_courses: 'Kurslar',
    nav_track: 'Trek',
    nav_blog: 'Blog',
    nav_contacts: 'Aloqa',
    cta_apply: 'Ariza qoldirish',
    hero_lead: 'Texnologiya. Tilllar. Karera.',
    hero_title: 'Natijali premium ta’lim',
    hero_subtitle: 'Intensiv kurslar, individual rivojlanish treki va 24/7 mentor ko‘magi.',
    btn_choose: 'Kurs tanlash',
    btn_how: 'Qanday o‘qitamiz',
    stat_langs: 'O‘qitish tili',
    stat_hw: 'Uy vazifasi tekshiruvi',
    stat_support: 'Qo‘llab-quvvatlash',
    stat_projects: 'Pet-loyihalar',
    stat_live: 'Ma’lumotlar serverdan olinadi',
    section_courses: 'Kurslar',
    section_courses_sub: 'Mentorlar bilan dolzarb yo‘nalishlar.',
    section_track: 'Rivojlanish treki',
    section_track_sub: 'Natijaga yetkazuvchi qadamlar.',
    section_reviews: 'Sharhlar',
    section_reviews_sub: 'Talabalar va hamkorlar natijalari.',
    section_blog: 'Blog',
    section_blog_sub: 'Foydali materiallar va yangiliklar.',
    section_contacts: 'Aloqa',
    section_contacts_sub: 'Doimo aloqadamiz.',
    contact_address: 'Manzil',
    contact_phone: 'Telefon',
    contact_email: 'Pochta',
    contact_socials: 'Ijtimoiy tarmoqlar',
    form_title: 'Ariza qoldiring',
    form_subtitle: '10 daqiqada bog‘lanamiz',
    form_name: 'Ism',
    form_phone: 'Telefon',
    form_tg: 'Telegram',
    form_course: 'Kurs',
    form_submit: 'Yuborish',
    ph_name: 'Ismingiz',
    ph_phone: '+998...',
    ph_tg: '@username',
    ph_course: 'Nomi yoki tanlang',
    empty_courses: 'Kurslar yo‘q',
    empty_track: 'Trek bosqichlari yo‘q',
    empty_reviews: 'Sharhlar yo‘q',
    empty_blog: 'Yozuvlar yo‘q',
    empty_contacts: 'Aloqa ma’lumoti yo‘q',
    course_active: 'Aktiv',
    course_hidden: 'Yashirin',
  },
  en: {
    hero_tagline: 'Learn. Grow. Win.',
    nav_courses: 'Courses',
    nav_track: 'Track',
    nav_blog: 'Blog',
    nav_contacts: 'Contacts',
    cta_apply: 'Apply now',
    hero_lead: 'Tech. Languages. Career.',
    hero_title: 'Premium learning with real outcomes',
    hero_subtitle: 'Intensive courses, personal growth track, and 24/7 mentor support.',
    btn_choose: 'Choose a course',
    btn_how: 'How we teach',
    stat_langs: 'Teaching languages',
    stat_hw: 'Homework check',
    stat_support: 'Support',
    stat_projects: 'Pet projects',
    stat_live: 'Live data from API',
    section_courses: 'Courses',
    section_courses_sub: 'Fresh programs with live mentors.',
    section_track: 'Growth track',
    section_track_sub: 'Step-by-step to results.',
    section_reviews: 'Reviews',
    section_reviews_sub: 'Results of students and partners.',
    section_blog: 'Blog',
    section_blog_sub: 'Useful materials and news.',
    section_contacts: 'Contacts',
    section_contacts_sub: 'We are always in touch.',
    contact_address: 'Address',
    contact_phone: 'Phone',
    contact_email: 'Email',
    contact_socials: 'Socials',
    form_title: 'Leave a request',
    form_subtitle: 'We will call in 10 minutes',
    form_name: 'Name',
    form_phone: 'Phone',
    form_tg: 'Telegram',
    form_course: 'Course',
    form_submit: 'Send',
    ph_name: 'Your name',
    ph_phone: '+998...',
    ph_tg: '@username',
    ph_course: 'Course name or choose below',
    empty_courses: 'No courses',
    empty_track: 'No track steps',
    empty_reviews: 'No reviews',
    empty_blog: 'No posts',
    empty_contacts: 'No contacts',
    course_active: 'Active',
    course_hidden: 'Hidden',
  },
  ja: {
    hero_tagline: '学ぶ。成長する。勝つ。',
    nav_courses: 'コース',
    nav_track: 'トラック',
    nav_blog: 'ブログ',
    nav_contacts: '連絡先',
    cta_apply: '申し込み',
    hero_lead: 'テクノロジー。言語。キャリア。',
    hero_title: '確かな成果のプレミアム学習',
    hero_subtitle: '集中コース、個別トラック、24/7メンターサポート。',
    btn_choose: 'コースを選ぶ',
    btn_how: '学び方',
    stat_langs: '学習言語',
    stat_hw: '課題チェック',
    stat_support: 'サポート',
    stat_projects: 'ペットプロジェクト',
    stat_live: 'APIからのライブデータ',
    section_courses: 'コース',
    section_courses_sub: '講師による最新プログラム。',
    section_track: '成長トラック',
    section_track_sub: '結果へ導くステップ。',
    section_reviews: 'レビュー',
    section_reviews_sub: '受講生とパートナーの成果。',
    section_blog: 'ブログ',
    section_blog_sub: '役立つ資料とニュース。',
    section_contacts: '連絡先',
    section_contacts_sub: 'いつでもご連絡ください。',
    contact_address: '住所',
    contact_phone: '電話',
    contact_email: 'メール',
    contact_socials: 'SNS',
    form_title: '申し込み',
    form_subtitle: '10分以内にご連絡します',
    form_name: '名前',
    form_phone: '電話',
    form_tg: 'Telegram',
    form_course: 'コース',
    form_submit: '送信',
    ph_name: 'お名前',
    ph_phone: '+81...',
    ph_tg: '@username',
    ph_course: 'コース名または選択',
    empty_courses: 'コースがありません',
    empty_track: 'トラックがありません',
    empty_reviews: 'レビューがありません',
    empty_blog: '投稿がありません',
    empty_contacts: '連絡先がありません',
    course_active: '公開',
    course_hidden: '非公開',
  },
}

const langButtons = document.querySelectorAll('[data-lang]')
let currentLang = 'ru'
let cache = {}

const loader = document.getElementById('loader')
const dashboardCards = document.getElementById('dashboard-cards')
const coursesList = document.getElementById('courses-list')
const trackList = document.getElementById('track-list')
const reviewsList = document.getElementById('reviews-list')
const blogList = document.getElementById('blog-list')
const contactsCard = document.getElementById('contacts-card')
const form = document.getElementById('application-form')
const formStatus = document.getElementById('application-status')
const courseSelect = document.getElementById('course-select')
const menuToggle = document.getElementById('menu-toggle')
const mobileMenu = document.getElementById('mobile-menu')
const mobileOverlay = document.getElementById('mobile-overlay')
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-show')
        revealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.15 }
)

function t(key) {
  const dict = i18n[currentLang] || i18n.ru
  return dict[key] || key
}

function applyTranslations(lang) {
  const dict = i18n[lang] || i18n.ru
  document.documentElement.lang = lang
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (dict[key]) el.textContent = dict[key]
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder
    if (dict[key]) el.setAttribute('placeholder', dict[key])
  })
}

function syncLangButtons() {
  langButtons.forEach((b) => {
    if (b.getAttribute('data-lang') === currentLang) b.classList.add('active')
    else b.classList.remove('active')
  })
}

function toggleMobileMenu(forceClose = false) {
  if (!mobileMenu) return
  const shouldShow = forceClose ? false : mobileMenu.classList.contains('hidden')
  mobileMenu.classList.toggle('hidden', !shouldShow)
  mobileMenu.classList.toggle('open', shouldShow)
  mobileOverlay?.classList.toggle('hidden', !shouldShow)
}

function applyReveal() {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.remove('reveal-show')
    revealObserver.observe(el)
  })
}

function showLoader(show) {
  if (!loader) return
  loader.classList.toggle('hidden', !show)
  loader.classList.toggle('flex', show)
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function renderSkeletons(container, count = 3) {
  if (!container) return
  container.innerHTML = new Array(count).fill('').map(() => `<div class="card-skeleton"></div>`).join('')
}

function renderCourses(list = []) {
  if (!coursesList) return
  if (!list.length) {
    coursesList.innerHTML = `<p class="text-slate-500">${t('empty_courses')}</p>`
    return
  }
  coursesList.innerHTML = list
    .map(
      (c) => `
      <article class="glass rounded-2xl p-5 shadow-md border border-slate-100 bg-white/90 reveal">
        <div>
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 class="text-xl font-semibold text-slate-900">${c.name}</h3>
              <p class="text-sm text-slate-500">${c.language} · ${c.level ?? ''}</p>
            </div>
            <span class="px-2 py-1 text-xs rounded ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${c.is_active ? t('course_active') : t('course_hidden')}</span>
          </div>
          <div class="flex gap-2 text-sm text-slate-700 mb-2">
            <span class="px-3 py-1 bg-primary-50 text-primary-700 rounded-full">${c.price ?? ''}</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full">${c.duration ?? ''}</span>
          </div>
          <p class="text-sm text-slate-600 mb-3">${c.description ?? ''}</p>
          <ul class="text-sm text-slate-700 space-y-1">
            ${(c.advantages || []).map((a) => `<li class="flex gap-2 items-start"><span class="text-primary-500">•</span>${a}</li>`).join('')}
          </ul>
      </div>
        <button class="btn-primary w-full mt-3" data-choose-course="${c.name}">${t('btn_choose')}</button>
      </article>
    `,
    )
    .join('')

  document.querySelectorAll('[data-choose-course]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-choose-course') || ''
      if (courseSelect) {
        courseSelect.value = name
      }
      const formEl = document.getElementById('application-form')
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
  applyReveal()
}

function renderTrack(list = []) {
  if (!trackList) return
  trackList.innerHTML = list.length
    ? list
        .map(
          (s) => `
      <div class="glass rounded-2xl p-5 border border-slate-100 bg-white/90 reveal">
        <div class="text-primary-600 font-semibold mb-1">#${s.order ?? 0}</div>
        <div class="text-lg font-semibold text-slate-900 mb-2">${s.title}</div>
        <p class="text-sm text-slate-600">${s.body ?? ''}</p>
      </div>
    `,
        )
        .join('')
    : `<p class="text-slate-500">${t('empty_track')}</p>`
  applyReveal()
}

function renderReviews(list = []) {
  if (!reviewsList) return
  reviewsList.innerHTML = list.length
    ? list
        .map(
          (r) => `
      <article class="glass rounded-2xl p-5 border border-slate-100 bg-white/90 reveal">
        <p class="text-slate-700 italic">“${r.quote}”</p>
        <div class="mt-3 font-semibold text-slate-900">${r.name}</div>
        <div class="text-sm text-slate-500">${r.role ?? ''}</div>
      </article>
    `,
        )
        .join('')
    : `<p class="text-slate-500">${t('empty_reviews')}</p>`
  applyReveal()
}

function renderBlog(list = []) {
  if (!blogList) return
  blogList.innerHTML = list.length
    ? list
        .map(
          (b) => `
      <article onclick="window.location.href='./blog.html?slug=${encodeURIComponent(b.slug)}&lang=${currentLang}'" class="glass rounded-2xl p-5 border border-slate-100 bg-white/90 reveal cursor-pointer">
        <div class="text-xs text-primary-600 mb-1">${b.locale}</div>
        <h3 class="text-lg font-semibold text-slate-900">
          <a href="blog.html?slug=${encodeURIComponent(b.slug)}&lang=${currentLang}" class="hover:text-primary-600">${b.title}</a>
        </h3>
        <p class="text-sm text-slate-600 mb-2">${b.excerpt ?? ''}</p>
        <div class="text-xs text-slate-500">${b.is_published ? 'Опубликован' : 'Черновик'}</div>
      </article>
    `,
        )
        .join('')
    : `<p class="text-slate-500">${t('empty_blog')}</p>`
  applyReveal()
}

function renderPartners(list = []) {
  const trackEl = document.getElementById('partners-track')
  const trackEl2 = document.getElementById('partners-track2')
  if (!trackEl || !trackEl2) return
  console.log(list);
  if (!list.length) {
    trackEl.innerHTML = '<div class="text-slate-500 px-4 py-2">Нет партнёров</div>'
    return
  }

  console.log("PARTNERS: ", list)
  const items = list
    .map(
      (p) => `<div class="partner-card">
        ${p.logo_base64 ? `<img src="data:image/png;base64,${p.logo_base64}" alt="${p.name || ''}" style="max-height: 80px; object-fit:contain; margin:0 auto;" />` : ''}
      </div>`
    )
    .join('')
  trackEl.innerHTML = items
  trackEl2.innerHTML = items
}

function renderContacts(contact) {
  if (!contactsCard) return
  if (!contact) {
    contactsCard.innerHTML = `<p class="text-slate-500">${t('empty_contacts')}</p>`
    return
  }
  contactsCard.innerHTML = `
    <div><strong>${t('contact_address')}:</strong> ${contact.address ?? '—'}</div>
    <div><strong>${t('contact_phone')}:</strong> ${contact.phone ?? '—'}</div>
    <div><strong>${t('contact_email')}:</strong> ${contact.email ?? '—'}</div>
    <div><strong>${t('contact_socials')}:</strong> ${
      contact && typeof contact.socials === 'object'
        ? Object.entries(contact.socials || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : contact?.socials ?? '—'
    }</div>
  `
}

function updateDashboard(data = {}) {
  if (!dashboardCards) return
  const cards = [
    { label: t('nav_courses'), value: data.courses?.length ?? 0 },
    { label: t('nav_track'), value: data.track?.length ?? 0 },
    { label: t('section_reviews'), value: data.reviews?.length ?? 0 },
    { label: t('nav_blog'), value: data.blog?.length ?? 0 },
  ]
  dashboardCards.innerHTML = cards
    .map(
      (c) => `
    <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="text-sm text-slate-500">${c.label}</div>
      <div class="text-2xl font-bold text-primary-600">${c.value}</div>
    </div>
  `,
    )
    .join('')
}

async function loadAll() {
  showLoader(true)
  renderSkeletons(coursesList, 4)
  renderSkeletons(trackList, 3)
  renderSkeletons(reviewsList, 3)
  renderSkeletons(blogList, 3)
  try {
    const localeParam = `?locale=${currentLang}`
    const [courses, track, reviews, partners, blog, contacts] = await Promise.all([
      fetchJson(`/api/public/courses${localeParam}`).catch(() => []),
      fetchJson(`/api/public/track${localeParam}`).catch(() => []),
      fetchJson(`/api/public/reviews${localeParam}`).catch(() => []),
      fetchJson(`/api/public/partners`).catch(() => []),
      fetchJson(`/api/public/blog${localeParam}`).catch(() => []),
      fetchJson(`/api/public/contacts`).catch(() => null),
    ])
    cache[currentLang] = { courses, track, reviews, partners, blog, contacts }
    renderCourses(courses)
    fillCourseSelect(courses)
    renderTrack(track)
    renderReviews(reviews)
    renderBlog(blog)
    renderPartners(partners)
    renderContacts(contacts)
    updateDashboard({ courses, track, reviews, blog })
  } catch (err) {
    console.warn('API error', err)
  } finally {
    showLoader(false)
  }
}

// Lang switch
langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentLang = btn.getAttribute('data-lang')
    syncLangButtons()
    applyTranslations(currentLang)
    const cached = cache[currentLang]
    if (cached) {
      renderCourses(cached.courses)
      fillCourseSelect(cached.courses)
      renderTrack(cached.track)
      renderReviews(cached.reviews)
      renderBlog(cached.blog)
      renderContacts(cached.contacts)
      updateDashboard(cached)
    } else {
      loadAll()
    }
    toggleMobileMenu(true)
  })
})

menuToggle?.addEventListener('click', () => toggleMobileMenu())
mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => toggleMobileMenu(true))
})
mobileOverlay?.addEventListener('click', () => toggleMobileMenu(true))

// Application form
form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(form)
  const payload = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    tg_username: formData.get('tg_username'),
    course: formData.get('course') || null,
  }
  formStatus.textContent = 'Отправляем...'
  try {
    const res = await fetch(`${API_BASE}/api/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Ошибка отправки')
    form.reset()
    formStatus.textContent = 'Готово! Мы свяжемся с вами.'
  } catch (err) {
    formStatus.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.'
  }
})

function fillCourseSelect(courses = []) {
  if (!courseSelect) return
  const options = [`<option value="">${t('ph_course')}</option>`].concat(
    courses
      .filter((c) => c.is_active)
      .map((c) => `<option value="${c.name}">${c.name}</option>`)
  )
  courseSelect.innerHTML = options.join('')
}

// Initial load
syncLangButtons()
applyTranslations(currentLang)
applyReveal()
loadAll()
