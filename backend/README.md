## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "nick@example.com",
  "name": "Nick Lu",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Teams

#### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering Team",
  "slug": "engineering-team",
  "description": "Core engineering team"
}
```

#### Get All Teams
```http
GET /api/teams
Authorization: Bearer <token>
```

#### Get Team by ID
```http
GET /api/teams/:id
Authorization: Bearer <token>
```

#### Update Team
```http
PATCH /api/teams/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name",
  "description": "Updated description"
}
```

#### Add Team Member
```http
POST /api/teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

### Projects

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "teamId": "team-uuid",
  "name": "Project Alpha",
  "key": "PROJ",
  "description": "Main project"
}
```

#### Get Projects by Team
```http
GET /api/projects/team/:teamId
Authorization: Bearer <token>
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### Sprints

#### Create Sprint
```http
POST /api/sprints/project/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sprint 1",
  "goal": "Complete user authentication",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-14T23:59:59Z"
}
```

#### Get Sprints by Project
```http
GET /api/sprints/project/:projectId
Authorization: Bearer <token>
```

#### Start Sprint
```http
POST /api/sprints/:id/start
Authorization: Bearer <token>
```

#### Complete Sprint
```http
POST /api/sprints/:id/complete
Authorization: Bearer <token>
```

#### Get Sprint Burndown
```http
GET /api/sprints/:id/burndown
Authorization: Bearer <token>
```

### Tasks

#### Create Task
```http
POST /api/tasks/project/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement user login",
  "description": "Add JWT authentication",
  "type": "TASK",
  "status": "TODO",
  "priority": "HIGH",
  "storyPoints": 5,
  "assigneeId": "user-uuid",
  "labels": ["backend", "auth"],
  "sprintId": "sprint-uuid"
}
```

#### Get Tasks by Project
```http
GET /api/tasks/project/:projectId?status=TODO&sprintId=sprint-uuid
Authorization: Bearer <token>
```

#### Get Tasks by Sprint
```http
GET /api/tasks/sprint/:sprintId
Authorization: Bearer <token>
```

#### Update Task
```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "assigneeId": "user-uuid"
}
```

#### Move Task
```http
PATCH /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "position": 0,
  "sprintId": "sprint-uuid"
}
```

#### Create Comment
```http
POST /api/tasks/:taskId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This looks good!"
}
```

## Database Schema

The application uses Prisma ORM with the following models:

- **User** - User accounts
- **Team** - Teams/organizations
- **TeamMember** - Team membership with roles
- **Project** - Projects within teams
- **Sprint** - Agile sprints
- **Task** - Tasks/stories/bugs
- **Comment** - Task comments
- **ActivityLog** - Task activity history

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## Authentication

The API uses JWT Bearer tokens:

1. Register or login to get a token
2. Include token in Authorization header: `Bearer <token>`
3. Token expires after 24 hours (configurable)


## Testing

```bash
npm test
```

## Performance

- Database queries are optimized with indexes
- JWT tokens are stateless for horizontal scaling
- Connection pooling via Prisma

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT authentication
- CORS enabled
- SQL injection prevention via Prisma
- Input validation on all endpoints

## Monitoring

- Request logging with Morgan
- Error logging to console
- Health check endpoint: `/health`
