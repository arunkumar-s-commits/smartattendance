# 🎓 AI-Based Smart Attendance Management System

> **Architecture:** Decoupled Cloud Deployment (`frontend/` for **Vercel** + `backend/` for **Render**)  
> **Technologies:** Next.js 14, MongoDB Atlas, face-api.js, Dynamic QR Codes, Geofencing, Recharts

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              STUDENT FRONTEND                │
                      │               (on Vercel)                    │
                      │   - Student Login & Registration             │
                      │   - Live Camera & AI Face Capture            │
                      │   - QR Scanner + GPS Geolocation Check       │
                      │   - Personal Attendance Dashboard            │
                      └──────────────────────┬───────────────────────┘
                                             │
                          REST API Requests  │  Proxied via Next.js
                          & CORS Enabled     │  Rewrites (/api/*)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │              TEACHER BACKEND                 │
                      │               (on Render)                    │
                      │   - Teacher Authentication & JWT Sessions    │
                      │   - Dynamic QR Generation & Expiry Timer     │
                      │   - Live Attendance Feed & Polling           │
                      │   - Benchmark Semester Working Days Config   │
                      │   - Attendance Analytics & CSV Export        │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │            MongoDB Atlas Cluster             │
                      │  Collections: Students, Teachers,            │
                      │               Attendance, QRSessions         │
                      └──────────────────────────────────────────────┘
```

---

## 📂 Folders & Cloud Deployments

| Folder | Platform | Port (Local) | Highlights |
| :--- | :--- | :--- | :--- |
| [`frontend/`](file:///d:/smart%20attandance/frontend) | **Vercel** | `3000` | High-speed edge CDN, client-side face recognition models, camera oval scanner, dark indigo theme. |
| [`backend/`](file:///d:/smart%20attandance/backend) | **Render** | `5000` | Node.js web service, MongoDB connection, JWT auth, dynamic QR generation, dark emerald faculty portal. |

For detailed step-by-step deployment instructions, see [**HOW_TO_RUN.md**](file:///d:/smart%20attandance/HOW_TO_RUN.md).

---

## ⚡ Quick Start (Local Run)

```bash
# Terminal 1: Launch Backend (Port 5000)
npm run dev:backend

# Terminal 2: Launch Frontend (Port 3000)
npm run dev:frontend
```

- **Student Frontend:** `http://localhost:3000`
- **Teacher Backend:** `http://localhost:5000`

### Initialize Teacher Account
```bash
npm run seed:backend
```
- **Email:** `admin@teacher.com`
- **Password:** `admin2026`
