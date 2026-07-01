# Vanilla Escape Madagascar

Starter scaffold for a tourism booking platform.

## Stack
- **Frontend**: React 18 + Vite + TailwindCSS + React Router + i18next (FR/EN) + Supabase JS
- **Backend**: Laravel 11 REST API + Sanctum auth + Supabase Postgres
- **Database**: Supabase (Postgres + Auth + Storage)

## Structure
```
frontend/   React SPA
backend/    Laravel 11 API
supabase/   SQL migrations for Supabase
```

## Quick start

### 1. Supabase
Create a project on https://supabase.com, then run `supabase/schema.sql` in the SQL editor.

### 2. Frontend
```bash
cd frontend
cp .env.example .env   # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev
```

### 3. Backend (Laravel)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
# set DB_* to your Supabase Postgres connection (Session Pooler)
php artisan migrate
php artisan serve
```

## Features included (scaffold)
- Multilingual FR/EN (i18next)
- Auth via Supabase (login/register/logout)
- Tours listing + detail + filtering by region
- Booking request form
- Quote request form
- Contact form
- Admin dashboard placeholder
- Laravel API: tours, bookings, quotes, contact, auth (Sanctum), admin stats

See per-folder READMEs for more.
