# Team Task Manager (Frontend)

A modern, responsive, and robust frontend application for the Team Task Manager project. Built with React, TypeScript, and TailwindCSS, this application provides a professional, SaaS-like experience for managing projects, tracking tasks, and collaborating with team members.

---

## 🎯 Project Overview

Team Task Manager is designed to help teams organize their work efficiently. The frontend architecture focuses on delivering a seamless, highly interactive user experience with real-time feedback, modular UI components, and strict role-based access control.

## ✨ Highlights

- **Modular Reusable UI Architecture:** Built with independent, generic UI components (Buttons, Cards, Badges, Inputs) for consistency and scalability.
- **Responsive Mobile Sidebar & Dashboard:** Fully optimized for all screen sizes with intuitive mobile navigation and adaptive dashboard layouts.
- **Advanced Task Management:** Features overdue task logic, robust filtering UI, project boards, and seamless task status management.
- **Modern Aesthetic:** Professional SaaS design with a polished interface, subtle micro-interactions, and a cohesive design system.

---

## 🚀 Features

### Authentication & Access
- **Authentication Flow:** Secure JWT-based login/logout handling with persistent sessions via context and local storage.
- **Role-Based Access (Admin/Member):** Dynamic UI rendering based on user roles. Admins have access to project creation and team management, while members focus on task execution.

### Dashboard & Navigation
- **Dashboard Features:** High-level overview of workspace metrics, pending tasks, recent activity, and quick access to active projects.
- **Responsive UI:** A collapsible sidebar and an adaptive main content area that scales flawlessly from desktop to mobile.

### Project & Task Management
- **Project Boards:** Visual Kanban-style or list-style boards for tracking tasks across different statuses (To Do, In Progress, Review, Done).
- **Task Status Management:** Intuitive interfaces to move tasks through their lifecycle quickly.
- **Overdue Logic & Filtering:** Automatic highlighting of overdue tasks, complemented by a powerful filtering UI to sort by priority, status, and due dates.

---

## 🛠 Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Lucide Icons

---

## 📁 Folder Structure

```text
src/
├── api/            # Axios instance and API service calls
├── assets/         # Static images, SVGs, and global assets
├── components/     # Reusable UI elements (Buttons, Cards, Badges, etc.)
├── context/        # React Context providers (AuthContext)
├── layouts/        # Page layouts (e.g., DashboardLayout)
├── lib/            # Utility functions (e.g., classNames/Tailwind merges)
├── pages/          # Main route components (Dashboard, Projects, etc.)
├── App.tsx         # Root component and route definitions
├── index.css       # Global styles and Tailwind directives
└── main.tsx        # Application entry point
```

---

## 🎨 Design System

The application utilizes a custom design system heavily reliant on **TailwindCSS**. 
- **Tokens:** Centralized color palettes, typography, and spacing.
- **Components:** Modular UI elements residing in `src/components/ui`, ensuring strict visual consistency and reducing code duplication.

---

## 🗺 Main Frontend Pages

1. **Landing Page (`/`)** - Modern splash page introducing the product.
2. **Login (`/login`)** - Secure entry point for authenticated users.
3. **Dashboard (`/dashboard`)** - Workspace overview and key metrics.
4. **Projects (`/projects`)** - List of all accessible projects.
5. **Project Details (`/projects/:id`)** - In-depth view of a project, complete with task boards and status management.
6. **My Tasks (`/tasks`)** - Personalized view of assigned tasks with advanced filtering.

---

## ⚙️ Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Setup Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd Client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `Client` directory based on the variables listed below.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file in the root of the `Client` directory:

```env
# The base URL of your backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔌 API Connection Details

The frontend communicates with the backend via **Axios**.
- All requests are routed through a central Axios instance located in `src/api/index.ts`.
- The instance automatically attaches the JWT Bearer token from local storage to the `Authorization` header of every outgoing request.
- Centralized error handling intercepts 401 Unauthorized responses to automatically log the user out if their session expires.

---

## 🧪 Demo Credentials

To explore the application locally (assuming the backend is seeded):

**Admin User**
- **Email:** rhythmdoshi04@gmail.com
- **Password:** test@123

**Member User**
- **Email:** avinash04@gmail.com
- **Password:** test@123

---

*Built with precision by **Rhythm Doshi***
