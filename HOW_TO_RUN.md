# 🚀 Smart Attendance System — Full-Stack Deployment & Run Guide

This project is partitioned into two specialized, standalone folders designed specifically for production cloud deployment:

| Portal / Layer | Folder | Cloud Platform | Purpose |
| :--- | :--- | :--- | :--- |
| **Student Portal (Frontend)** | [`frontend/`](file:///d:/smart%20attandance/frontend) | **Vercel** | Student login, registration with AI face capture, personal attendance dashboard, and multi-step QR scanner with geolocation & camera. |
| **Teacher Portal & API (Backend)** | [`backend/`](file:///d:/smart%20attandance/backend) | **Render** | Faculty administration, dynamic QR generator, live attendance monitor, student directory with working days benchmark, analytics & CSV exports, MongoDB Atlas database connection, and secure REST APIs. |

---

## 📁 1. Project Folder Structure

```
d:/smart attandance/
├── frontend/                     # 🌐 DEPLOY TO VERCEL (Student Facing)
│   ├── app/
│   │   ├── page.tsx              # Student Portal entrance & features
│   │   ├── layout.tsx            # Inter & Outfit Google typography
│   │   ├── globals.css           # Indigo/blue dark mode design tokens & glass cards
│   │   └── student/
│   │       ├── login/page.tsx    # Student login (mobile/password)
│   │       ├── register/page.tsx # Face capture wizard & registration
│   │       ├── dashboard/page.tsx# Student attendance stats, rates & history
│   │       └── scan/page.tsx     # QR code scan + GPS check + Face match
│   ├── public/
│   │   └── models/               # face-api.js AI model weights (7 files)
│   ├── next.config.js            # Proxies /api/* to Render backend & bundler setup
│   ├── package.json              # Student app dependencies
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.local                # Local backend link (http://localhost:5000)
│   └── .env.example              # Vercel production example
│
├── backend/                      # ⚙️ DEPLOY TO RENDER (Teacher & DB Service)
│   ├── app/
│   │   ├── page.tsx              # Teacher entrance & API health dashboard
│   │   ├── layout.tsx
│   │   ├── globals.css           # Emerald dark teacher theme & styling
│   │   ├── teacher/
│   │   │   ├── login/page.tsx    # Teacher & Admin login
│   │   │   ├── dashboard/page.tsx# Faculty stats & Recharts analytics
│   │   │   ├── qr-generator/page.tsx # Dynamic time-limited QR generator
│   │   │   ├── attendance/page.tsx   # Live polling attendance monitor
│   │   │   ├── students/page.tsx     # Student roster & benchmark days config
│   │   │   ├── students/[id]/page.tsx# Individual student records
│   │   │   └── reports/page.tsx      # Department comparisons & CSV export
│   │   └── api/                  # All backend REST API endpoints
│   │       ├── auth/             # student, teacher, logout
│   │       ├── student/          # profile, attendance, register
│   │       ├── teacher/          # dashboard, attendance, students, settings
│   │       ├── attendance/       # mark attendance, student history
│   │       ├── qr/               # create dynamic QR session, verify session
│   │       └── seed/             # initialize admin account
│   ├── models/                   # Student, Teacher, Attendance, QRSession
│   ├── lib/                      # mongodb.ts, auth.ts, location.ts, faceUtils.ts
│   ├── middleware.ts             # Route protection middleware
│   ├── components/TeacherNav.tsx # Emerald navigation sidebar
│   ├── scripts/seed.ts           # Database seeder script
│   ├── next.config.js            # CORS headers enabled for Vercel
│   ├── package.json              # Teacher & API dependencies
│   ├── .env.local                # MongoDB Atlas connection & secret keys
│   └── .env.example              # Render production example
│
├── package.json                  # Root runner scripts (runs both with 1 command)
└── HOW_TO_RUN.md                 # Complete manual (this file)
```

---

## 💻 2. How to Run Locally on Your Computer

### Prerequisites
- Node.js 18+ installed
- Active Internet connection (for MongoDB Atlas and Google Fonts)

### Quick Start (From Workspace Root)

Open PowerShell or Terminal in `d:\smart attandance`:

#### Terminal 1 — Start the Backend (Port 5000):
```bash
npm run dev:backend
```
> The Backend & Teacher Portal will start at: **http://localhost:5000**

#### Terminal 2 — Start the Frontend (Port 3000):
```bash
npm run dev:frontend
```
> The Student Portal will start at: **http://localhost:3000**

---

### Initialize the Database (First-Time Only)

Before logging in as a teacher, create the default teacher account in your MongoDB Atlas database:

Option A (Command line):
```bash
npm run seed:backend
```

Option B (Browser / Postman):
Make a POST request to:
```
http://localhost:5000/api/seed
```

#### Default Credentials:
- **Teacher Email:** `admin@teacher.com`
- **Teacher Password:** `admin2026`
- **Student Accounts:** Created instantly by students via the **Register** page with their face photo and mobile number.

---

## ☁️ 3. How to Upload the Project to GitHub

Before deploying to Vercel and Render, push your code to your GitHub account:

1. Open a terminal in `d:\smart attandance`
2. Initialize git and commit:
```bash
git init
git add .
git commit -m "feat: separate student frontend and teacher backend architecture"
```
3. Create a new repository on [GitHub](https://github.com/new) (e.g. `smart-attendance-system`)
4. Link and push to GitHub:
```bash
git remote add origin https://github.com/<your-username>/smart-attendance-system.git
git branch -M main
git push -u origin main
```

---

## 🖥️ 4. Deploying the BACKEND to Render

> **Which folder to upload:** `backend`  
> Render provides the persistent server environment needed for Node.js, MongoDB database connections, JWT authentication, and the Teacher Portal.

### Step-by-Step Instructions:

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Select your GitHub repository (`smart-attendance-system`).
4. Configure the Web Service settings:
   - **Name:** `smart-attendance-backend` (or your choice)
   - **Region:** Choose closest to your users (e.g. `Singapore` or `Frankfurt`)
   - **Branch:** `main`
   - **Root Directory:** 👉 **`backend`**  *(Very important! Type `backend` here)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Scroll down to **Environment Variables** and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://sakthivel_username:sakthivel%40123@cluster0.0zfbxgl.mongodb.net/attendance_tracker?retryWrites=true&w=majority&appName=Cluster0` | MongoDB Atlas cluster URL |
| `MONGODB_DB` | `attendance_tracker` | Database name |
| `JWT_SECRET` | `SmartAttendance_JWT_Secret_2026_XyZ9#mNpQ@kRv!` | Secret key for tokens |
| `PORT` | `5000` | Server listening port |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel domain (update after Vercel deploy) |

6. Click **Create Web Service**.
7. Render will build and deploy the backend. Once finished, copy your Render URL:
   `https://smart-attendance-backend.onrender.com`

---

## ⚡ 5. Deploying the FRONTEND to Vercel

> **Which folder to upload:** `frontend`  
> Vercel deploys the Next.js Student Portal with global Edge CDN caching, instant client-side AI face detection, and seamless camera permissions over HTTPS.

### Step-by-Step Instructions:

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`smart-attendance-system`).
4. In the **Configure Project** screen:
   - **Project Name:** `smart-attendance-student` (or your choice)
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and select 👉 **`frontend`** *(Very important! Select `frontend`)*
5. Expand the **Environment Variables** section and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `BACKEND_API_URL` | `https://smart-attendance-backend.onrender.com` | Your Render Backend service URL |
| `NEXT_PUBLIC_API_URL` | `https://smart-attendance-backend.onrender.com` | Client-accessible backend URL |
| `NEXT_PUBLIC_BACKEND_URL` | `https://smart-attendance-backend.onrender.com/teacher/login` | Direct link to Teacher portal |

6. Click **Deploy**.
7. Within 1-2 minutes, Vercel will complete the build and provide your live URL:
   `https://smart-attendance-student.vercel.app`

---

## 🔄 6. Final Sync Between Vercel and Render

Now that both are live:
1. Copy your Vercel URL: `https://smart-attendance-student.vercel.app`
2. Open your [Render Dashboard](https://dashboard.render.com/) -> Select `smart-attendance-backend` -> Go to **Environment**.
3. Update `FRONTEND_URL` with your actual Vercel URL:
   ```
   FRONTEND_URL=https://smart-attendance-student.vercel.app
   ```
4. Click **Save Changes** (Render will automatically redeploy with the updated CORS rule).

---

## 🧪 7. Complete End-to-End Verification Test

1. **Teacher Setup:**
   - Open your Render URL: `https://smart-attendance-backend.onrender.com/teacher/login`
   - Sign in with `admin@teacher.com` / `admin2026`.
   - Go to **Generate QR** -> Click "Use Current Location" -> Set Radius (e.g. 100 meters) -> Click **Generate Attendance QR Code**.
   - Keep the QR code open on the teacher screen.
2. **Student Check-In:**
   - Open your Vercel URL: `https://smart-attendance-student.vercel.app`
   - Click **Create Account** -> Allow camera -> Align face in oval guide until face is captured -> Enter Name, Email, Mobile -> Register.
   - Click **Scan QR Code to Mark Attendance** -> Allow camera & location.
   - Scan the active QR displayed on the teacher screen.
   - Verify Geofence GPS check (Passes if within 100 meters).
   - Perform live face scan (AI matches against registered face embedding).
   - Instant attendance confirmation displayed!
3. **Teacher Verification:**
   - On the Teacher Portal, open **Live Attendance** (`/teacher/attendance`).
   - The student check-in appears live with verified GPS and face status!
