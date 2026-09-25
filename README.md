# WeConnect Admin

Admin dashboard for the WeConnect marketplace. Manage suppliers, buyer/supplier accounts, subscription plans, and platform reports.

## Structure

```
weconnect-admin/
├── backend/          Express + MySQL (Aiven) API
│   ├── server.js             App entry point
│   └── src/
│       ├── config/            DB pool
│       ├── middleware/        JWT auth + role guards
│       ├── routes/            /api/auth and /api/admin endpoints
│       └── services/          Email delivery
└── frontend/         Vue 3 + Vite admin SPA
    └── src/
        ├── assets/            Brand logo
        ├── config/            Axios instance (JWT + base URL)
        ├── router/            Auth-guarded routes
        ├── stores/            Vuex store
        └── views/             Login, Dashboard, Settings
```

## Getting started

```bash
# Backend (port 28794)
cd backend
npm install
npm run dev        # or npm start

# Frontend (port 5175)
cd frontend
npm install
npm run dev
```

Open http://localhost:5175 and log in.

## Ports

| Service | Port  |
| ------- | ----- |
| Admin SPA (this repo) | 5175 |
| Supplier marketplace SPA (separate repo) | 5173 |
| API backend | 28794 |