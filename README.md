# 🚌 Where Is My Bus — West Bengal Bus Tracking Platform

A production-ready, full-stack bus timetable and simulated live tracking platform for West Bengal, inspired by "Where Is My Train". Built with Next.js 15, Express, PostgreSQL, and Leaflet maps.

---

## ✨ Features

- **🔍 Smart Bus Search** — Search from any stop to any stop. Silda → Bankura only returns buses where Silda appears before Bankura.
- **🗺️ Simulated Live Tracking** — No GPS required. Bus position is calculated mathematically from the timetable.
- **📍 Leaflet Maps** — Interactive maps with OpenStreetMap tiles, route polylines, and animated bus markers.
- **📅 Next Bus Feature** — Shows next bus, following bus, and all upcoming trips for any route.
- **🛠️ Admin Dashboard** — Full CRUD for buses, routes, stops, and timetables.
- **📥 Excel Import** — Drag-and-drop Excel upload with column detection, preview, error highlighting, and import.
- **🌏 Bengali / English** — Full bilingual support for stop names and UI.
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile.
- **🔐 JWT Authentication** — Secure admin panel.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| Maps | Leaflet + OpenStreetMap (react-leaflet) |
| Excel | SheetJS (xlsx) |
| Auth | JWT (jsonwebtoken) |
| Containerization | Docker Compose |

---

## 📁 Project Structure

```
Where is my Bus/
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── shared/
│   └── types.ts                # Shared TypeScript types
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── index.ts            # Express server entry point
│   │   ├── lib/prisma.ts       # Prisma client singleton
│   │   ├── middleware/         # Auth, error handling
│   │   ├── routes/             # API route handlers
│   │   └── services/           # Business logic
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/                # Next.js 15 App Router pages
    │   ├── components/         # React components
    │   └── lib/                # API client, utilities
    ├── package.json
    └── tailwind.config.ts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL) OR local PostgreSQL 16
- npm or yarn

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

This starts:
- PostgreSQL at `localhost:5432`
- pgAdmin at `http://localhost:5050` (admin@whereismybus.in / Admin@123)

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

Backend runs at **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🔐 Default Admin Credentials

| Field | Value |
|---|---|
| URL | http://localhost:3000/admin/login |
| Email | admin@whereismybus.in |
| Password | Admin@123 |

⚠️ Change these in production!

---

## 📊 Database Schema

```
User          → Admin accounts
Bus           → Bus name + contact
Route         → Belongs to Bus
Trip          → Belongs to Route (one departure)
TripStop      → Stop in a trip (sequence + scheduled time)
Stop          → Stop name (EN + BN) + coordinates
StopAlias     → Bengali/alternate stop names
Delay         → Admin-set delay minutes per trip
RoutePolyline → GeoJSON for map rendering
```

---

## 🗺️ API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/stops?q=Silda` | Search stops |
| GET | `/api/stops/:id` | Stop details |
| GET | `/api/routes` | All routes |
| GET | `/api/routes/:id` | Route with schedule |
| GET | `/api/search?from=X&to=Y&time=HH:mm` | Smart bus search |
| GET | `/api/trips/:id` | Trip details |
| GET | `/api/trips/:id/location` | Simulated bus location |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | Get JWT token |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET/POST | `/api/admin/buses` | List/Create buses |
| PUT/DELETE | `/api/admin/buses/:id` | Update/Delete bus |
| GET/POST | `/api/admin/routes` | List/Create routes |
| GET/POST | `/api/admin/stops` | List/Create stops |
| PUT/DELETE | `/api/admin/stops/:id` | Update/Delete stop |
| GET/POST/DELETE | `/api/admin/delays` | Manage delays |
| POST | `/api/admin/import/preview` | Excel preview |
| POST | `/api/admin/import/confirm` | Confirm import |

---

## 📥 Excel Import Format

Your Excel file must have these columns (order doesn't matter, auto-detected):

| SL No | Bus Name | Route Name | Stop Seq | Stoppage | Time | Bus Contact No |
|---|---|---|---|---|---|---|
| 1 | MAA SARADA | Raipur–Howrah | 1 | Raipur | 03:40 | 7047037177 |
|   |  |  | 2 | Motgoda | 03:50 |  |
|   |  |  | 3 | Phulkusma | 04:00 |  |

**Rules:**
- Bus Name and Route Name can be blank for subsequent rows (auto-filled from previous row)
- Time must be in HH:mm format (24-hour)
- Stop Seq must be sequential integers
- Duplicate stop names in the same route will be flagged

---

## 🔄 Simulated Tracking Algorithm

The bus position is calculated purely from the timetable:

```
For segment [StopA → StopB]:
  elapsed  = currentTime - StopA.scheduledTime (minutes)
  total    = StopB.scheduledTime - StopA.scheduledTime (minutes)
  progress = clamp(elapsed / total, 0, 1)
  
  lat = StopA.lat + (StopB.lat - StopA.lat) × progress
  lng = StopA.lng + (StopB.lng - StopA.lng) × progress
```

Always displayed as **🟡 Estimated Location** — never claims to be Live GPS.

The architecture supports adding real GPS tracking in the future by switching `LocationSource` from `SIMULATED` to `GPS`.

---

## 🌏 Bengali Support

Stop names support both English and Bengali:

| English | Bengali |
|---|---|
| Silda | শিলদা |
| Bankura | বাঁকুড়া |
| Howrah | হাওড়া |
| Kolkata | কলকাতা |

Users can search by either name. UI language can be toggled between English and Bengali.

---

## 📱 Responsive Design

Tested viewport widths:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px+
- Large: 1920px

---

## 🏭 Production Deployment

### Environment Variables

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/whereismybus"
JWT_SECRET="strong-random-secret-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="https://yourdomain.com"
NODE_ENV="production"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Where Is My Bus
```

### Build Commands

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

### Recommended Hosting
- **Backend**: Railway, Render, or VPS
- **Frontend**: Vercel (zero config for Next.js)
- **Database**: Neon, Supabase, or Railway PostgreSQL

---

## 🛣️ Future Roadmap

- [ ] Driver App (React Native) with real GPS tracking
- [ ] Push notifications for bus arrival
- [ ] Multiple trip times per day per route
- [ ] Crowd-sourced bus position reports
- [ ] Offline PWA support
- [ ] SMS alerts for delays

---

## 📄 License

MIT License — Free to use and modify.

---

*Built with ❤️ for West Bengal commuters*
