# Agile Board - Frontend Service

Modern web application for agile sprint planning and task management.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Drag & Drop:** @dnd-kit/core
- **Charts:** Recharts
- **HTTP Client:** Native fetch API

## Prerequisites

- Node.js 20+
- npm or yarn

## Features

### Authentication
- User registration
- User login
- JWT token management
- Protected routes

### Dashboard
- View all teams
- Create new teams
- Navigate to team details

### Team Management
- View team members
- View team projects
- Create new projects

### Project Board
- Kanban board view
- Drag and drop tasks
- Create tasks
- Create sprints
- View active sprint

### Task Management
- Create tasks with properties
- Update task status
- Assign tasks to users
- Add task comments
- View task history

## Components

### UI Components (shadcn/ui)
- `Button` - Customizable button component
- `Input` - Form input component
- `Card` - Card container component
- `Dialog` - Modal dialog component
- `Select` - Dropdown select component

### Kanban Components
- `KanbanBoard` - Main board with drag & drop
- `KanbanColumn` - Column for task status
- `TaskCard` - Individual task card

## API Integration

The frontend communicates with the backend via REST API:

```typescript
import { api } from '@/lib/api'

// Authentication
await api.auth.login({ email, password })
await api.auth.register({ email, name, password })

// Teams
await api.teams.create({ name, slug })
await api.teams.getAll()

// Projects
await api.projects.create({ teamId, name, key })
await api.projects.getByTeam(teamId)

// Tasks
await api.tasks.create(projectId, taskData)
await api.tasks.getBySprint(sprintId)
await api.tasks.move(taskId, { status, position })
```

## Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with a custom configuration:

## State Management

The application uses React's built-in state management:
- `useState` for local component state
- `useEffect` for side effects
- `localStorage` for token persistence

## Routing

Next.js 15 App Router is used for routing:

```
/                           → Home (redirects to dashboard or login)
/login                      → Login page
/register                   → Register page
/dashboard                  → Dashboard (requires auth)
/teams/[teamId]            → Team detail page
/projects/[projectId]      → Project board with Kanban
```

## Authentication Flow

1. User registers or logs in
2. JWT token stored in localStorage
3. Token included in API requests
4. Protected routes check for token
5. Redirect to login if unauthorized


## Performance Optimization

- Next.js automatic code splitting
- Image optimization with next/image
- Lazy loading of components
- API response caching
- Tailwind CSS purging

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management

## Best Practices

### Code Organization
- Components in `/components`
- Pages in `/app`
- Types in `/types`
- Utilities in `/lib`

### TypeScript
- Strict mode enabled
- Proper type definitions
- Interface over type when possible

### Styling
- Tailwind utility classes
- CSS variables for theming
- Responsive design patterns
