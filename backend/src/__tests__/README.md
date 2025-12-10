# Backend Tests

This directory contains all tests for the backend application, organized following corporate production standards.

## Directory Structure

```
tests/
├── unit/              # Unit tests - isolated function and service tests
├── integration/       # Integration tests - API endpoints and module interactions
├── e2e/              # End-to-End tests - full application scenarios
└── setup/            # Test environment setup, fixtures, and mocks
```

## Test Categories

### Unit Tests (`tests/unit/`)
Tests for individual functions, utilities, and services in isolation.

**Examples:**
- `password.test.ts` - Password hashing and comparison utilities
- `jwt.test.ts` - JWT token generation and verification

**Characteristics:**
- Fast execution
- No external dependencies
- Heavy use of mocks
- High code coverage

### Integration Tests (`tests/integration/`)
Tests for API endpoints and interactions between modules.

**Examples:**
- `auth.test.ts` - Authentication endpoints (register, login, getMe)
- `sprint.test.ts` - Sprint management endpoints
- `task.test.ts` - Task CRUD operations and workflow

**Characteristics:**
- Tests HTTP request/response cycle
- Uses Supertest for API testing
- Mocked database (Prisma)
- Tests business logic and validation

### E2E Tests (`tests/e2e/`)
Full application scenario tests (to be implemented).

**Planned:**
- Complete user workflows
- Real database interactions
- Multi-endpoint scenarios

### Setup (`tests/setup/`)
Shared test configuration, mocks, and fixtures.

**Files:**
- `setup.ts` - Jest configuration, Prisma mocks, environment setup

## Running Tests

```bash
# Run all tests
npm test

# Run specific test category
npm test -- tests/unit
npm test -- tests/integration

# Run specific test file
npm test -- tests/unit/password.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Writing Tests

### Unit Test Template

```typescript
import { myFunction } from '@/path/to/module';

describe('MyFunction', () => {
  it('should perform expected behavior', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Integration Test Template

```typescript
import request from 'supertest';
import express from 'express';
import routes from '@/routes/my.routes';
import { errorHandler } from '@/middleware/errorHandler';

describe('My API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/my', routes);
    app.use(errorHandler);
  });

  it('should handle request successfully', async () => {
    const response = await request(app)
      .post('/api/my/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Naming**: Use descriptive test names that explain the scenario
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies (database, APIs)
5. **Cleanup**: Use `afterEach` to clear mocks and state
6. **Coverage**: Aim for 80%+ coverage for critical code

## CI/CD Integration

Tests should run in CI pipeline before deployment:

```bash
npm test
```

All tests must pass for deployment to proceed.
