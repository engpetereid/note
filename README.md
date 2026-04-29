# Spiritual Habit Tracker

A mobile-first web application for tracking daily spiritual disciplines. Built for Coptic Orthodox Christians, the app provides a personalized daily checklist of spiritual activities (Agpeya prayers, Bible readings, church attendance, and more), paired with a smart daily Bible reading plan and progress analytics.

---

## 📋 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Design](#-database-design)
- [Architecture & Design Notes](#-architecture--design-notes)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Description

Spiritual growth requires consistent, measurable practice. This application solves the problem of tracking personal spiritual disciplines by giving each user:

- A **customizable daily checklist** of spiritual activities organized by category (Agpeya prayers, Bible study, general spiritual exercises, church activities).
- A **smart Bible reading plan** that delivers the correct Old & New Testament passage for any given day, supporting both a fixed calendar cycle and a user-relative cycle.
- A **7-day history** window so users can retroactively mark activities they completed earlier in the week.
- A **progress analytics screen** displaying per-activity completion trends across 1 month, 3 months, 6 months, and 1 year.

---

## ✨ Features

- **Phone-based Authentication** — Registration and login via phone number (no email required). Password reset supported.
- **Spiritual Routine Builder (Onboarding)** — Users select activities from a categorized catalogue to build their personal routine.
- **Daily Dashboard** — Displays today's Bible reading, the activity checklist grouped by category, and a real-time progress bar.
- **Activity Toggle** — Tap any activity to mark it complete or incomplete. Changes are persisted via API with optimistic UI updates and automatic rollback on failure.
- **7-Day Archive Window** — Navigate back up to 7 days to retroactively log progress. Future dates and dates older than 7 days are blocked.
- **Two-Mode Bible Reading Plan**:
  - **Fixed Mode**: Day 1 = January 1st, consistent across all users and years.
  - **Relative Mode**: Day 1 = the user's signup date (or a custom start date they define).
- **Dual Old Testament Year Cycle**: The OT reading plan spans 2 years; users toggle between Year 1 and Year 2.
- **Progress Analytics (Charts)**: Per-activity completion rates for 1M (daily), 3M (weekly), 6M (monthly), and 1Y (monthly) ranges with an overall average.
- **Confession Date Tracking**: Users log their last confession date, shown on the charts screen.
- **Push Notification Token Storage**: FCM token persistence for future push notification integration.
- **Settings Slide-Over Drawer**: In-app panel for updating reading preferences without leaving the dashboard.

---

## 🛠 Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | Laravel 13 (PHP 8.3) |
| Authentication | Laravel Sanctum (SPA cookie-based) |
| Database | SQLite (default) / MySQL compatible |
| Cache | Database cache driver |
| Queue | Database queue driver |
| Frontend Bridge | Inertia.js v2 |
| URL Helpers | Tighten Ziggy |

### Frontend

| Layer | Technology |
|---|---|
| UI Framework | React 18 (via Inertia.js) |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v3 |
| UI Components | Headless UI |
| Icons | Lucide React |
| HTTP Client | Axios |

### Dev Tools

| Tool | Purpose |
|---|---|
| Laravel Breeze | Auth scaffolding |
| Laravel Pint | PHP code style (PSR-12) |
| Laravel Pail | Real-time log viewer |
| PHPUnit 12 | Testing |
| Faker | Test data generation |

---

## ⚙️ Installation

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+ & npm
- SQLite (bundled with PHP) **or** MySQL/PostgreSQL

### Quick Setup (One Command)

```bash
composer run setup
```

This composite script will:
1. Install PHP dependencies (`composer install`)
2. Copy `.env.example` → `.env` if absent
3. Generate the application key
4. Run all database migrations
5. Install Node dependencies
6. Build frontend assets

### Manual Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd note

# 2. Install PHP dependencies
composer install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. (Optional) Update DB settings in .env for MySQL
#    Default is SQLite — no changes needed for local dev.

# 5. Run migrations and seed
php artisan migrate
php artisan db:seed

# 6. Build frontend
npm install
npm run build
```

### Key Environment Variables

```dotenv
APP_NAME="Spiritual Tracker"
APP_URL=http://localhost

DB_CONNECTION=sqlite          # or mysql / pgsql

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

---

## 🚀 Usage

### Development Server

```bash
composer run dev
```

This starts four concurrent processes:
- **Laravel** development server on `http://localhost:8000`
- **Queue worker** for background jobs
- **Pail** real-time log viewer
- **Vite** dev server with hot module replacement

### Running Tests

```bash
composer run test
# or
php artisan test
```

### Seeding the Database

```bash
# Seed spiritual activities (25 pre-defined entries)
php artisan db:seed --class=ActivitySeeder

# Seed all 366 daily Bible reading passages
php artisan db:seed --class=DailyReadingsSeeder
```

### Application Flow

1. **Register** — User provides name, phone number, and password.
2. **Onboarding** — User selects spiritual activities to form their personal routine.
3. **Dashboard** — User views today's Bible reading and checks off completed activities.
4. **Charts** — User reviews habit adherence over configurable time ranges.
5. **Settings** — User adjusts reading preferences from the slide-over drawer.

---

## 📁 Project Structure

```
note/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── ChartController.php       # Progress charts + confession update
│   │   │   │   ├── DashboardController.php   # Daily dashboard data aggregation
│   │   │   │   ├── ProfileController.php     # FCM token + reading settings
│   │   │   │   ├── RoutineController.php     # Activity catalogue + routine sync
│   │   │   │   └── TrackingController.php    # Atomic activity toggle
│   │   │   └── Auth/                         # Breeze auth controllers
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   ├── Activity.php         # Spiritual activity (name, category, icon)
│   │   ├── DailyReading.php     # Daily Bible passage (OT Year1/2 + NT)
│   │   ├── TrackingLog.php      # Per-user, per-day completion record
│   │   └── User.php             # Core user model + getReadingForDate() logic
│   └── Providers/
│
├── database/
│   ├── migrations/              # Schema definitions (chronological)
│   ├── seeders/
│   │   ├── ActivitySeeder.php         # 25 spiritual activities in 4 categories
│   │   └── DailyReadingsSeeder.php    # 366 daily Bible passages
│   └── database.sqlite
│
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Dashboard.jsx    # Main daily checklist + reading screen
│       │   ├── Onboarding.jsx   # Routine builder / activity selector
│       │   ├── Charts.jsx       # Habit analytics with time-range filter
│       │   ├── Auth/            # Login, Register, Password Reset
│       │   └── Profile/         # Profile management
│       ├── Components/          # Reusable UI primitives (Button, Input, Modal…)
│       ├── Layouts/             # Page layout wrappers
│       ├── services/
│       │   └── api.js           # Centralized Axios client (Sanctum-aware)
│       └── app.jsx              # Inertia.js entry point
│
├── routes/
│   ├── api.php                  # /api/* JSON endpoints (Sanctum protected)
│   ├── auth.php                 # Web auth routes (Breeze)
│   ├── web.php                  # Inertia page routes
│   └── console.php
│
├── composer.json                # PHP deps + scripts (setup, dev, test)
├── package.json                 # Node deps
├── vite.config.js
└── tailwind.config.js
```

---

## 📡 API Documentation

All API routes are prefixed with `/api` and protected by `auth:sanctum` middleware (session cookie).  
The frontend Axios client sets `withCredentials: true` globally.

### Authentication

Laravel Breeze handles authentication via standard web session routes (cookie-based SPA). No Bearer tokens are issued or required.

---

### Dashboard

#### `GET /api/dashboard`

Returns all data needed to render the daily dashboard.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | `Y-m-d` | No | Target date. Defaults to today. Must be within 7 days. |

**Business Rules**
- Future date → `403 Forbidden`
- Date > 7 days ago → `403 Forbidden`

**Response `200 OK`**

```json
{
    "current_date": "2026-04-29",
    "user": { "name": "John" },
    "reading": {
        "day_number": 119,
        "year_cycle": 1,
        "ot_passage": "Numbers 1-4",
        "nt_passage": "Luke 5:1-26",
        "explanation": "..."
    },
    "routines": [
        { "id": 1, "name_ar": "صلاة باكر", "category": "agpeya", "type": "daily", "icon": "Flame" }
    ],
    "completed_task_ids": [1, 3],
    "stats": {
        "progress": 67,
        "total": 3,
        "completed": 2
    },
    "settings": {
        "reading_preference": "fixed",
        "ot_year": 1,
        "custom_start_date": ""
    }
}
```

---

### Tracking

#### `POST /api/tracking/toggle`

Atomically toggles an activity's completion status for a given date.  
Rate-limited to **60 requests/minute** per user.

**Request Body**

```json
{
    "activity_id": 1,
    "date": "2026-04-29"
}
```

**Business Rules**
- `activity_id` must belong to the user's routine → `403` otherwise.
- `date` must be within the 7-day editable window → `403` otherwise.
- Uses `DB::transaction()` + `lockForUpdate()` to prevent race conditions.

**Response `200 OK`**

```json
{
    "message": "Activity updated successfully.",
    "is_completed": true
}
```

---

### Routines

#### `GET /api/activities`

Returns all available activities grouped by category (Onboarding screen).

```json
{
    "message": "Activities fetched successfully.",
    "categories": {
        "agpeya":  [{ "id": 1, "name_ar": "صلاة باكر", "icon": "Flame" }],
        "bible":   [{ "id": 8, "name_ar": "قراءة العهد القديم", "icon": "BookOpen" }],
        "general": [...],
        "church":  [...]
    }
}
```

#### `GET /api/routines`

Returns the IDs of activities in the user's current routine.

```json
{ "selected_activities": [1, 3, 8, 21] }
```

#### `POST /api/routines`

Atomically replaces the user's routine using `sync()`.

**Request Body:** `{ "activity_ids": [1, 3, 8, 21] }`

---

### Charts

#### `GET /api/charts`

Returns per-activity time-series completion data and the user's last confession date.

**Query Parameters**

| `range` | Grouping | Data Points |
|---|---|---|
| `1M` (default) | Daily | 30 |
| `3M` | Weekly | 12 |
| `6M` | Monthly | 6 |
| `1Y` | Monthly | 12 |

**Response `200 OK`**

```json
{
    "last_confession_date": "2026-04-15",
    "charts": [
        {
            "id": 1,
            "name_ar": "صلاة باكر",
            "icon": "Flame",
            "average": 73,
            "dataPoints": [
                { "label": "01/04", "value": 100 },
                { "label": "02/04", "value": 0 }
            ]
        }
    ]
}
```

#### `POST /api/profile/confession`

Updates the user's last confession date. Date must not be in the future.

```json
{ "date": "2026-04-15" }
```

---

### Profile

#### `POST /api/profile/fcm-token`

```json
{ "fcm_token": "AAAAxxxxxxxx..." }
```

#### `POST /api/profile/settings`

Updates reading preferences.

```json
{
    "reading_preference": "fixed",
    "ot_year": 1,
    "custom_start_date": null
}
```

| Field | Values | Description |
|---|---|---|
| `reading_preference` | `fixed` \| `relative` | Calendar vs. reference-date cycle |
| `ot_year` | `1` \| `2` | OT reading year cycle |
| `custom_start_date` | `Y-m-d` \| `null` | Override start date for relative mode |

---

## 🗄 Database Design

### Entity Relationships

```
users ──< user_routines >── activities   (many-to-many: selected routine)
users ──< tracking_logs >── activities   (many-to-many: completion history)
daily_readings                            (standalone lookup, 366 rows)
```

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `name` | string | |
| `phone_number` | string UNIQUE | Login identifier (no email field) |
| `password` | string | Bcrypt hashed |
| `reading_preference` | enum(`fixed`,`relative`) | Default: `fixed` |
| `ot_year` | integer | `1` or `2` |
| `signup_date` | date | Auto-set on registration |
| `custom_start_date` | date nullable | Override for relative reading cycle |
| `last_confession_date` | date nullable | |
| `fcm_token` | string nullable | Firebase push token |

### `activities`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `name_ar` | string | Activity name (Arabic) |
| `category` | enum(`agpeya`,`bible`,`general`,`church`) | |
| `type` | enum(`daily`,`weekly`,`custom`) | Default: `daily` |
| `icon` | string | Lucide React icon name |

### `user_routines` *(pivot)*

| Column | Type | Notes |
|---|---|---|
| `user_id` | FK → users | Part of composite PK |
| `activity_id` | FK → activities | Part of composite PK |

### `tracking_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `user_id` | FK → users | Cascade delete |
| `activity_id` | FK → activities | Cascade delete |
| `date` | date | |
| `status` | boolean | `true` = completed |

> **Indexes**: Composite index on `(user_id, date)` for fast daily dashboard queries.  
> **Unique constraint** on `(user_id, activity_id, date)` to prevent duplicate logs.

### `daily_readings`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `day_number` | integer | 1–366 (leap-year aligned) |
| `ot_passage_year_1` | string nullable | OT passage, Year 1 |
| `ot_passage_year_2` | string nullable | OT passage, Year 2 |
| `nt_passage` | string nullable | NT passage |
| `explanation` | text nullable | Devotional commentary |

---

## 🏗 Architecture & Design Notes

### SPA via Inertia.js
Inertia.js bridges Laravel and React, delivering a full-SPA experience (client-side navigation, no page reloads) without a dedicated API layer for page delivery. The JSON REST API is used exclusively for authenticated data operations.

### Sanctum SPA Cookie Authentication
The app uses **session cookies** for API authentication, not Bearer tokens. The Axios client sets `withCredentials: true` globally, giving automatic CSRF protection and avoiding insecure `localStorage` token storage.

### Optimistic UI Updates
`Dashboard.jsx` applies activity toggles **instantly to local state** before the API call resolves, then **automatically rolls back** the UI on network or business rule failure. This creates a native-app feel even on slow connections.

### Atomic Toggle with Pessimistic Locking
`TrackingController::toggle()` uses `DB::transaction()` combined with `lockForUpdate()`. This prevents duplicate `tracking_log` records when rapid double-taps generate simultaneous race-condition requests to the server.

### Smart Bible Reading with 24-Hour Cache
`User::getReadingForDate()` computes the correct `day_number` for the user's reading mode and caches the full `DailyReading` model array for **24 hours** using `Cache::remember()`. Since `daily_readings` is a seed-only lookup table, cache invalidation is not a concern.

### Leap Year Day-Number Normalization
For **fixed** reading mode, the day-of-year is computed by temporarily projecting the target date to a known leap year (2024). This guarantees that April 28th is always Day 119, regardless of whether the current year has 365 or 366 days.

### 7-Day Editable Window
Both `DashboardController` and `TrackingController` enforce the rule that only dates within `[today - 7 days, today]` are accessible. This prevents retroactive habit manipulation while allowing genuine corrections for missed days.

### Rate Limiting on Toggle
`/api/tracking/toggle` is wrapped in `throttle:60,1` (60 requests/minute/user), guarding against scripted bulk-completion of historical activities.

### Centralized API Client
All frontend API calls are routed through `resources/js/services/api.js`, a single Axios instance pre-configured with `baseURL`, `withCredentials`, and JSON content-type headers. This keeps API interaction logic out of React components.

---

## 🔮 Future Improvements

- **Push Notifications** — The FCM token infrastructure is in place. A scheduled Artisan command to send daily reminder notifications is the logical next step.
- **Streaks & Gamification** — Track and display current and longest activity streaks to improve engagement and retention.
- **Accountability Partnerships** — Allow a spiritual father or accountability partner read-only access to a member's dashboard.
- **Offline Support** — Add a Service Worker + IndexedDB layer to allow activity toggling without a network connection, syncing when connectivity returns.
- **Native Mobile App** — Build a React Native or Flutter client that consumes the existing REST API.
- **Admin Panel** — A management interface for adding/editing activities and daily reading passages without running seeders.
- **WhatsApp / SMS Password Reset** — Deliver password reset tokens via phone number instead of the current placeholder flow.
- **Redis Cache** — Replace the database cache driver with Redis in production for significantly faster daily-reading lookups.
- **Progress Export** — Allow users to export their completion history as a PDF or CSV report.

---

## 🤝 Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/my-feature`
2. Follow PSR-12 coding standards, enforced via Laravel Pint: `./vendor/bin/pint`
3. Write tests for new API endpoints.
4. Open a pull request with a clear description of the change and its motivation.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
