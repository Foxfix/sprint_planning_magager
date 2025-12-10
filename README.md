# Agile Sprint Board - Microservices Architecture

Enterprise-grade sprint planning and task management system built with microservices architecture.

## Architecture

This project consists of three independent services:

- **Frontend Service** (Next.js) - Port 3000
- **Backend Service** (Express API) - Port 3001
- **Database** (PostgreSQL) - Port 5432

Each service can be built, tested, and deployed independently.

## Tech Stack

### Backend Service
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 16
- **Authentication:** JWT + bcrypt

### Frontend Service
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Drag & Drop:** @dnd-kit/core
- **HTTP Client:** Native fetch

## Services

### Frontend Service
- **Technology:** Next.js 15, React 19, TypeScript
- **Port:** 3000
- **Documentation:** See [frontend/README.md](frontend/README.md)

### Backend Service
- **Technology:** Node.js, Express, Prisma
- **Port:** 3001
- **Documentation:** See [backend/README.md](backend/README.md)

## Development

### Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 20 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Docker** (only for PostgreSQL database)
   - Download: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version`


### Step 1: Start PostgreSQL in Docker

Use Docker to run **the database** for local testing:

```bash
# Start PostgreSQL container
docker run --name postgres-agile \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=agile_board \
  -p 5432:5432 \
  -d postgres:16-alpine

# Verify it's running
docker ps
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# The .env file should contain:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agile_board
# (default values should work if you followed the setup above)

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Backend will run on **http://localhost:3001**

**Verify backend is working:**
```bash
curl http://localhost:3001/health
```

You should see: `{"status":"ok"}`

### Step 3: Frontend Setup

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file from example
cp .env.example .env.local

# The .env.local should contain:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# (default value should work)

# Start development server
npm run dev
```

Frontend will run on **http://localhost:3000**

**First-time build takes 3-5 minutes.** Subsequent starts are much faster.

### Step 4: Access the Application

Once all services are running (look for "Server running" messages), open your browser:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

### Step 5: Create Your Account

1. Click "Sign up" or go to http://localhost:3000/register
2. Enter your details:
   - Full Name: Nick Lu
   - Email: nick@example.com
   - Password: password123
3. Click "Create account"
4. You'll be automatically logged in and redirected to the dashboard



## Project Structure

```
sprint_planning/
├── frontend/              # Frontend microservice
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   ├
│   ├── package.json
│   └── README.md
│
├── backend/              # Backend microservice
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   |
│   ├── package.json
│   └── README.md
│
├
└── README.md            # This file
```

## Core Features

### 1. Team & Project Management
- User authentication (register/login)
- Create teams
- Create projects within teams
- Invite team members
- Role-based access (Admin, Member)

### 2. Sprint Planning
- Create sprints (2-week iterations)
- Assign tasks to sprints
- Sprint capacity tracking
- Sprint goals

### 3. Kanban Board
- Visual board: To Do → In Progress → In Review → Done
- Drag & drop tasks between columns
- Quick actions (assign, edit, comment)

### 4. Task Details
- Detailed task modal
- Edit all properties inline
- Activity log (change history)
- Comments section

## API Documentation

The backend exposes a REST API with the following endpoints:

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Teams
```
POST   /api/teams
GET    /api/teams
GET    /api/teams/:id
PATCH  /api/teams/:id
DELETE /api/teams/:id
POST   /api/teams/:id/members
DELETE /api/teams/:id/members/:userId
```

### Projects
```
POST   /api/projects
GET    /api/projects/team/:teamId
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

### Sprints
```
POST   /api/sprints/project/:projectId
GET    /api/sprints/project/:projectId
GET    /api/sprints/:id
PATCH  /api/sprints/:id
POST   /api/sprints/:id/start
POST   /api/sprints/:id/complete
DELETE /api/sprints/:id
GET    /api/sprints/:id/burndown
```

### Tasks
```
POST   /api/tasks/project/:projectId
GET    /api/tasks/project/:projectId
GET    /api/tasks/sprint/:sprintId
GET    /api/tasks/:id
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/move
DELETE /api/tasks/:id
POST   /api/tasks/:taskId/comments
GET    /api/tasks/:taskId/comments
```
## License

MIT