# Team Task Manager - Backend Architecture

A robust backend built with Node.js, Express, TypeScript, and Prisma ORM for managing projects, teams, and tasks.

## 🏗 Project Architecture

This application strictly follows the **Controller-Service-Route** (modified to Controller-Route for this specific focus) architecture, keeping things modular, scalable, and easy to test.

We avoid overcomplicating with layers like the Repository Pattern or Microservices to maintain a streamlined, agile structure perfectly suited for a monolithic deployment. The architecture is primarily focused on:
- **Clean REST APIs**: Providing standard HTTP responses, utilizing robust HTTP status codes.
- **Middleware-based Authentication**: Decoupled request validation and authorization workflows.
- **Strong Typing**: End-to-end type safety from the Prisma database models up to the Zod payload validations and Express request bodies.

## 📂 Folder Structure

```text
server/
├── prisma/               # Database definitions and migration details
│   └── schema.prisma     # Prisma ORM schema
├── src/
│   ├── config/           # App-wide configurations (e.g., Prisma client setup)
│   ├── controllers/      # Core business logic processing HTTP requests
│   ├── generated/        # Prisma auto-generated client
│   ├── middleware/       # Reusable request filters (Auth, Role, Global Errors)
│   ├── routes/           # API Endpoint definitions
│   ├── schema/           # Zod validation schemas
│   ├── types/            # TypeScript interface definitions
│   ├── utils/            # Shared utilities (e.g., AsyncWrapper to avoid try-catch hell)
│   ├── app.ts            # Express application setup and global middleware bindings
│   └── server.ts         # Application entrypoint
├── package.json          # Dependency definitions and NPM scripts
└── tsconfig.json         # TypeScript compiler configurations
```

## 📊 Database Relationships (Prisma)

The database schema relies on **PostgreSQL** and uses the following relational logic:

- **User**: The central entity. A `User` can create many `Projects`, be a member of many `Projects`, and be assigned many `Tasks`.
- **Project**: Represents a collaborative workspace. Created by a single `User`, but can contain multiple `ProjectMembers` and `Tasks`.
- **ProjectMember**: A **join table** mapping `Users` to `Projects`.
  - *Why does this table exist?* To facilitate a Many-to-Many relationship between Users and Projects. A user can be part of multiple projects, and a project can have multiple users. A dedicated join model allows us to easily add metadata in the future (e.g., specific roles inside a project, join dates).
- **Task**: The atomic unit of work.
  - *Why do tasks belong to exactly one user?* To ensure clear accountability. In real-world team mechanics, if a task is assigned to a group, nobody takes ownership. A single assignee enforces responsibility. The task also belongs to a `Project`.
  - *Priority Levels*: Each task has an assigned priority (`low`, `medium`, `high`) using a Prisma Enum, which allows for sorting and filtering important items across the system.

## 🔐 Authentication & RBAC (Role-Based Access Control) Flow

### Authentication
We use **JWT (JSON Web Tokens)** coupled with **bcryptjs** for stateless, secure authentication.
1. The user logs in or signs up, and the server generates a JWT containing the user's `id` and `role`.
2. For protected routes, the client sends this JWT in the `Authorization: Bearer <token>` header.
3. The `authMiddleware` intercepts the request, verifies the JWT signature, and attaches the decoded user payload to the Express `req` object (`req.user`).

### RBAC Flow
We implemented a strict Admin/Member hierarchy.
- **Admin**: Can create projects, add users to projects, create tasks, and view global dashboard statistics.
- **Member**: Can only view projects they are a part of, update statuses of tasks assigned to them, and view their personalized dashboard statistics.
- The `roleMiddleware` (`authorize("admin")`) is chained after the `authMiddleware` to enforce these boundaries cleanly on the route level.

## 🌐 API Endpoints

### Auth
- `POST /api/auth/signup`: Create a new user (Validates duplicate emails).
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /api/auth/me`: Get the currently logged-in user's profile.

### Projects
- `POST /api/projects` **(Admin Only)**: Create a new project.
- `GET /api/projects`: Get all projects the logged-in user is a member of.
- `GET /api/projects/:id`: Get a specific project including its members and tasks. **Secured**: Only accessible if the user is an Admin OR a verified member of the requested project.
- `POST /api/projects/:id/members` **(Admin Only)**: Add a user to a project.
- `DELETE /api/projects/:projectId/members/:userId` **(Admin Only)**: Remove a user from a project (prevents removal of the project's creator).

### Tasks
- `POST /api/tasks` **(Admin Only)**: Create a new task and assign it to a user. **Secured**: Automatically validates that the assignee is already a member of the linked project, rejecting the request with a `400` status if they are not.
- `GET /api/tasks/my`: Get all tasks assigned to the logged-in user.
- `GET /api/tasks/:id`: Get task details.
- `PATCH /api/tasks/:id/status`: Update task status (`todo`, `in_progress`, `done`). Accessible by assigned member or any Admin.

### Dashboard
- `GET /api/dashboard`: Fetch platform statistics. Response adapts based on user role.

## 🛠 Middleware Usage

1. **`authMiddleware`**: Verifies the JWT token from the `Authorization` header. Denies access (`401`) if invalid.
2. **`authorize(role)`**: Ensures the `req.user.role` matches the required permission level. Denies access (`403`) if unauthorized.
3. **`errorHandler`**: A global catch-all at the end of the Express pipeline. It catches `ZodError` exceptions to return cleanly formatted `400 Bad Request` validation errors, and handles unexpected internal errors gracefully without crashing the server.

## 📈 Dashboard Stats & Overdue Task Logic

The dashboard provides contextual data:
- **Admins** see system-wide metrics: Total Projects, Total Users, Total Tasks, Completed Tasks, and System-wide Overdue Tasks. Additionally, it dynamically groups tasks to display a **Tasks Per User** matrix utilizing Prisma's `.groupBy()` aggregations.
- **Members** see personal metrics: My Tasks count, Completed, Pending, and Overdue Tasks assigned specifically to them.

### Overdue Logic
*Why is overdue calculated dynamically rather than stored in the database?*
Storing an `isOverdue` boolean in the DB requires a continuous background CRON job to constantly check dates and update rows, which is resource-intensive and prone to race conditions. Instead, we calculate it dynamically at request time using a helper function (`isTaskOverdue`). This is highly performant and always guarantees 100% real-time accuracy across all task and project responses. All Task API responses return an augmented JSON containing this dynamic `isOverdue` parameter.

## 🚀 How to Run Locally

### 1. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager"
JWT_SECRET="super_secret_key_change_me"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Prisma Commands
Generate the Prisma Client into the custom generated folder, and push the schema to your local PostgreSQL instance:
```bash
npx prisma generate
npx prisma db push
```

### 4. Build and Start Scripts
We use `concurrently` and `nodemon` for an optimal developer experience.
- **Development**: Runs TypeScript compiler in watch mode alongside nodemon.
  ```bash
  npm run dev
  ```
- **Production Build**: Compiles TypeScript to JavaScript in the `dist/` folder.
  ```bash
  npm run build
  ```
- **Start Production Server**: Runs the compiled JavaScript.
  ```bash
  npm start
  ```

---

## 📝 Example JSON Payloads

**Create Task (`POST /api/tasks`)**
```json
{
  "title": "Implement JWT Auth",
  "description": "Secure the endpoints using jsonwebtoken.",
  "assignedTo": 2,
  "projectId": 1,
  "dueDate": "2026-12-31T23:59:59Z",
  "priority": "high"
}
```

**Task API Response with Overdue Helper**
```json
{
  "id": 1,
  "title": "Implement JWT Auth",
  "status": "todo",
  "priority": "high",
  "isOverdue": false
}
```

**Validation Error Response (`400 Bad Request`)**
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email"
    }
  ]
}
```
