# API эндпоинты (Educational Center)

Базовый URL backend: `http://localhost:8000` (или значение `VITE_API_BASE_URL` для фронтенда).  
Все admin‑эндпоинты требуют Bearer‑токен из `/api/auth/login`.

## Здоровье
- `GET /health` – проверка статуса (`{"status":"ok"}`).

## Auth
- `POST /api/auth/login`
  - Body: `{"login": "...", "password": "..."}`
  - Response: `{"access_token": "...", "token_type": "bearer"}`

## Public (без авторизации)
- `POST /api/public/applications`
  - Body: `{"name": "...", "phone": "...", "tg_username": "...", "course": "string|optional", "course_id": number|optional}`
  - Response: `ApplicationRead` (id, name, phone, tg_username, status, course_id, course_title, created_at)
  - Замечание: если передан `course_id` или название курса, привяжется к заявке; уведомление уйдёт в Telegram (если настроен токен/чат).

- `GET /api/public/courses?locale=ru`
  - Только активные курсы (`is_active=True`), сортировка по дате создания (desc).
  - Response: массив `CourseRead` (id, name, language, level, price, discount, duration, advantages[], is_active, slug, description, locale, created_at, updated_at).

- `GET /api/public/courses/{slug}?locale=ru` – курс по слагу.

- `GET /api/public/teachers?locale=ru`
  - Response: массив `TeacherRead` (id, name, bio, photo_base64, socials (JSON), locale, created_at, updated_at).

- `GET /api/public/track?locale=ru`
  - Response: массив `TrackStepRead` (id, title, body, order, course_links (JSON/список), locale, created_at, updated_at).

- `GET /api/public/reviews?locale=ru`
  - Только видимые (`is_visible=True`), сортировка по created_at desc.
  - Response: массив `ReviewRead` (id, name, role, quote, is_visible, locale, created_at, updated_at).

- `GET /api/public/partners?locale=ru`
  - Сортировка по order asc, затем created_at desc.
  - Response: массив `PartnerRead` (id, name, url, logo_base64, locale, order, created_at, updated_at).

- `GET /api/public/blog?locale=ru`
  - Только опубликованные (`is_published=True`), сортировка по published_at desc.
  - Response: массив `BlogPostRead` (id, title, slug, body, excerpt, cover_base64, locale, is_published, published_at, seo_title, seo_description, created_at, updated_at).

- `GET /api/public/blog/{slug}?locale=ru` – опубликованный пост по слагу.

- `GET /api/public/static/{slug}?locale=ru`
  - Response: `StaticPageRead` (id, slug, locale, body (JSON), created_at, updated_at).

- `GET /api/public/contacts?locale=ru`
  - Возвращает запись указанной локали, иначе первую доступную.
  - Response: `ContactInfoRead` (id, locale, address, phone, email, socials (JSON), map_embed, created_at, updated_at).

## Admin (Bearer токен обязателен)
### Курсы
- `GET /api/admin/courses` – список всех курсов.
- `POST /api/admin/courses` – создать.
  - Body = `CourseCreate` (name, language, level?, price?, discount?, duration?, advantages?[], is_active, slug, description?, locale).
- `PUT /api/admin/courses/{id}` – обновить курс.
- `DELETE /api/admin/courses/{id}` – удалить.

### Заявки
- `GET /api/admin/applications?status=new|in_progress|done` – список (опциональный фильтр по статусу).
- `PATCH /api/admin/applications/{id}?status_value=...` – сменить статус.
- `DELETE /api/admin/applications/{id}` – удалить.

### Преподаватели
- `GET /api/admin/teachers`
- `POST /api/admin/teachers` – `TeacherCreate` (name, bio?, photo_base64?, socials (JSON/список)?, locale)
- `PUT /api/admin/teachers/{id}`
- `DELETE /api/admin/teachers/{id}`

### Трек
- `GET /api/admin/track`
- `POST /api/admin/track` – `TrackStepCreate` (title, body?, order, course_links (JSON/список)?, locale)
- `PUT /api/admin/track/{id}`
- `DELETE /api/admin/track/{id}`

### Отзывы
- `GET /api/admin/reviews`
- `POST /api/admin/reviews` – `ReviewCreate` (name, role?, quote, is_visible, locale)
- `PUT /api/admin/reviews/{id}`
- `DELETE /api/admin/reviews/{id}`

### Партнёры
- `GET /api/admin/partners`
- `POST /api/admin/partners` – `PartnerCreate` (name, url?, logo_base64?, locale, order)
- `PUT /api/admin/partners/{id}`
- `DELETE /api/admin/partners/{id}`

### Блог
- `GET /api/admin/blog`
- `POST /api/admin/blog` – `BlogPostCreate` (title, slug, body, excerpt?, cover_base64?, locale, is_published, published_at?, seo_title?, seo_description?)
  - Slug должен быть уникальным; проверка на совпадение.
- `PUT /api/admin/blog/{id}` – обновление с проверкой уникальности slug.
- `DELETE /api/admin/blog/{id}`

### Статические страницы
- `GET /api/admin/static`
- `POST /api/admin/static` – `StaticPageCreate` (slug, locale, body (JSON)?)
- `PUT /api/admin/static/{id}`
- `DELETE /api/admin/static/{id}`

### Контакты
- `GET /api/admin/contacts`
- `POST /api/admin/contacts` – `ContactInfoCreate` (locale, address?, phone?, email?, socials (JSON)?, map_embed?)
- `PUT /api/admin/contacts/{id}`
- `DELETE /api/admin/contacts/{id}`

## Схемы (кратко)
- `CourseCreate`: name, language, level?, price?, discount?, duration?, advantages?[], is_active, slug (unique), description?, locale.
- `ApplicationCreate`: name (min_length=2), phone, tg_username, course? (string), course_id? (int).
- `TeacherCreate`: name, bio?, photo_base64?, socials? (list или dict), locale.
- `TrackStepCreate`: title, body?, order (int), course_links? (list или dict), locale.
- `ReviewCreate`: name, role?, quote, is_visible, locale.
- `PartnerCreate`: name, url?, logo_base64?, locale, order (int).
- `BlogPostCreate`: title, slug (unique), body, excerpt?, cover_base64?, locale, is_published, published_at?, seo_title?, seo_description?.
- `StaticPageCreate`: slug, locale, body (dict/JSON)?.
- `ContactInfoCreate`: locale, address?, phone?, email?, socials (dict)?, map_embed?.
