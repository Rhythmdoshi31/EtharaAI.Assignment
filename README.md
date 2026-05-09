# Team Task Manager

A collaborative, full-stack task management platform designed to help teams organize their work efficiently. Team Task Manager empowers admins to create projects, invite members, assign tasks, track progress, and monitor overdue work through role-based, analytics-driven dashboards.

---

## 📸 Screenshots

*(Replace with actual screenshots of the application)*

<p align="center">
  <img src="https://via.placeholder.com/800x450?text=Dashboard+Overview" alt="Dashboard" width="400"/>
  <img src="https://via.placeholder.com/800x450?text=Project+Kanban+Board" alt="Kanban Board" width="400"/>
</p>

---

## ✨ Features

- **Authentication System:** Secure login flow with JSON Web Tokens (JWT).
- **Role-Based Access Control (RBAC):** Distinct roles (Admin, Member) dictating UI components and API access.
- **Project & Task Management:** Create projects, organize tasks into boards, and track their lifecycles.
- **Task Status & Priority Updates:** Intuitive Kanban-style or list-style tracking for "To Do", "In Progress", "Review", and "Done".
- **Dynamic Overdue Task Logic:** Automatic detection and visual highlighting of tasks past their due date.
- **Dashboard Analytics:** High-level metrics for quick insights into workspace progress and user workload.
- **Responsive Frontend UI:** Fluid, adaptive design supporting both desktop and mobile layouts.
- **Filtering, Searching & Sorting:** Advanced capabilities to quickly find the exact task or project needed.

---

## 🛠 Tech Stack

### Frontend (Client)
- **React** (UI Library)
- **TypeScript** (Static Typing)
- **TailwindCSS** (Utility-first Styling)
- **React Router DOM** (Navigation)
- **Axios** (HTTP Client)
- **Lucide React** (Iconography)

### Backend (Server)
- **Node.js** & **Express** (Runtime & Framework)
- **TypeScript** (Static Typing)
- **Prisma ORM** (Database Access)
- **PostgreSQL** (Relational Database)
- **JWT** (Authentication)
- **Zod** (Schema Validation)

---

## 🏗 Architecture Overview

Team Task Manager is built as a decoupled monolith consisting of a modern React single-page application (SPA) frontend and a robust Node.js/Express REST API backend. 
- The **Frontend** utilizes modular, reusable UI components and a responsive sidebar layout.
- The **Backend** provides secure routes validated via Zod, interacting seamlessly with PostgreSQL through Prisma ORM. 
- Deployment is split across Vercel (Frontend) and Railway (Backend), connected via environment-configured API endpoints.

---

## 📁 Folder Structure

```text
Team-Task-Manager/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios configurations and API calls
│   │   ├── components/     # Reusable UI elements (Cards, Buttons, etc.)
│   │   ├── context/        # React Context (Auth)
│   │   ├── layouts/        # Dashboard and standard layouts
│   │   └── pages/          # Application views (Dashboard, Projects)
│   └── package.json
│
└── server/                 # Backend Node.js API
    ├── prisma/             # Prisma schema and migrations
    ├── src/
    │   ├── controllers/    # Route logic and request handling
    │   ├── middlewares/    # Auth, RBAC, and error handlers
    │   ├── routes/         # Express route definitions
    │   └── validations/    # Zod validation schemas
    └── package.json
```

---

## 🗄 Database Relationships

The PostgreSQL database (managed via Prisma) centers around several core entities:
- **User:** Can be assigned a Role (`ADMIN` or `MEMBER`). Users can own projects and be assigned to tasks.
- **Project:** Contains multiple Tasks. Owned by an Admin.
- **Task:** Belongs to a single Project. Assigned to a User. Has specific statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) and priorities (`LOW`, `MEDIUM`, `HIGH`).

---

## 🔐 Authentication & RBAC Flow

1. **Login:** Users submit credentials; the backend validates and returns a JWT.
2. **Session Persistence:** The frontend stores the JWT and attaches it to the `Authorization: Bearer <token>` header of all subsequent Axios requests.
3. **Role-Based Access (RBAC):**
   - **Frontend:** Dynamically renders UI components. Admins see project creation/management tools; Members see execution-focused views.
   - **Backend:** Auth middleware verifies the JWT. RBAC middleware restricts sensitive routes (e.g., `POST /projects`) strictly to Admins.

---

## 💻 Frontend Features

- **Modular UI Components:** Independent, reusable design tokens (Badges, Inputs, Modals).
- **Responsive Sidebar Navigation:** Collapses smoothly on mobile devices for optimal viewing.
- **Project Task Boards:** Interactive UI for tracking task statuses dynamically.
- **Admin/Member Dashboards:** Context-aware homepages displaying tailored metrics.

---

## ⚙️ Backend Features

- **Strict Validation:** Incoming requests are parsed and validated strictly using Zod before hitting controllers.
- **Robust Error Handling:** Centralized middleware for catching and formatting API errors securely.
- **Prisma Relations:** Efficient relational querying to fetch nested project, task, and user data simultaneously.

---

## 🛣 API Routes Overview

| Route | Method | Access | Description |
|-------|--------|--------|-------------|
| `/api/auth/login` | POST | Public | Authenticates user & returns JWT |
| `/api/auth/me` | GET | Authenticated | Returns current user profile |
| `/api/projects` | GET | Authenticated | Lists all projects |
| `/api/projects` | POST | Admin | Creates a new project |
| `/api/tasks` | GET | Authenticated | Lists tasks (supports query filtering) |
| `/api/tasks/:id` | PATCH | Authenticated | Updates task status/details |

---

## ⏱ Overdue Task Logic Explanation

Overdue calculation is handled dynamically. The backend stores the `dueDate` as a UTC timestamp. 
When fetching tasks, the frontend or backend compares the current timestamp against the `dueDate`. If `current_date > due_date` and the task status is not `DONE`, the task is immediately flagged as **Overdue**. The frontend UI reflects this using striking visual cues (e.g., red badges and alerts) to ensure urgent items are addressed.

---

## 🔐 Environment Variables

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- npm or yarn

### 1. Backend Setup

```bash
cd server
npm install

# Set up environment variables
cp .env.example .env # Ensure DATABASE_URL is correct

# Generate Prisma Client and apply migrations
npx prisma generate
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install

# Set up environment variables
cp .env.example .env # Ensure VITE_API_URL points to backend

# Start the frontend server
npm run dev
```

---

## 🛢 Prisma Commands Reference

- `npx prisma studio`: Opens a visual database editor.
- `npx prisma generate`: Re-generates the Prisma Client after schema changes.
- `npx prisma migrate dev`: Creates and applies database migrations.

---

## 📜 Development Scripts

**Backend (`server/package.json`)**
- `npm run dev`: Starts Express server with nodemon/ts-node.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled production code.

**Frontend (`client/package.json`)**
- `npm run dev`: Starts Vite development server.
- `npm run build`: Creates an optimized production build.
- `npm run preview`: Previews the production build locally.

---

## 📦 Production Build Steps

1. Navigate to `server` and run `npm run build`. This generates the `dist/` directory.
2. Navigate to `client` and run `npm run build`. This generates the `dist/` directory containing static assets.

---

## ☁️ Deployment

### Vercel Frontend Deployment

1. Connect your GitHub repository to Vercel.
2. Set the **Root Directory** to `client/`.
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL` = `https://your-railway-app-url.up.railway.app/api`
5. Click **Deploy**.

### Railway Backend Deployment Steps

1. Create a new Railway project and provision a PostgreSQL database.
2. Connect your GitHub repository and set the **Root Directory** to `server/`.
3. Add a build command: `npm install && npx prisma generate && npm run build`.
4. Add a start command: `npm run start`.
5. Run migrations: `npx prisma migrate deploy` (can be added as a custom deploy script).

### Environment Variables for Railway
Configure the following in the Railway project settings under "Variables":
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_production_secret_key
PORT=8080
```

---

## 🔑 Demo Credentials

To explore the application quickly:

**Admin User**
- **Email:** rhythmdoshi04@gmail.com
- **Password:** test@123

**Member User**
- **Email:** avinash04@gmail.com
- **Password:** test@123

---

## 🔮 Future Improvements

- Add WebSocket support for real-time task updates.
- Implement file attachments for tasks.
- Add advanced data visualization charts to the dashboard.
- Introduce email notifications for due dates and task assignments.

---

*Built with precision by **Rhythm Doshi***
