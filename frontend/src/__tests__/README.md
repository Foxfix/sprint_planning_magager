# Frontend Tests

This directory contains all tests for the frontend application, organized following corporate production standards.

## Directory Structure

```
tests/
├── unit/              # Unit tests - React components and utility functions
├── integration/       # Integration tests - API client and multi-component interactions
├── e2e/              # End-to-End tests - full user flows (Playwright/Cypress)
└── setup/            # Test environment setup and mocks
```

## Test Categories

### Unit Tests (`tests/unit/`)
Tests for individual React components and utility functions.

**Examples:**
- `AssignUserModal.test.tsx` - User assignment modal component

**Characteristics:**
- React Testing Library
- User interaction testing
- Component rendering and state
- Props and callbacks

### Integration Tests (`tests/integration/`)
Tests for API client and complex component interactions.

**Examples:**
- `api.test.ts` - API client methods, error handling, token management

**Characteristics:**
- Mocked fetch API
- Full request/response cycle
- Error scenarios
- LocalStorage interactions

### E2E Tests (`tests/e2e/`)
Full user workflow tests (to be implemented).

**Planned:**
- User registration and login flow
- Task creation and management
- Sprint lifecycle
- Drag and drop workflows

### Setup (`tests/setup/`)
Shared test configuration.

**Files:**
- `setup.js` - Next.js router mocks, window.matchMedia, localStorage mocks

## Running Tests

```bash
# Run all tests
npm test

# Run specific test category
npm test -- tests/unit
npm test -- tests/integration

# Run specific test file
npm test -- tests/unit/AssignUserModal.test.tsx

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Writing Tests

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render and handle user interaction', () => {
    const mockCallback = jest.fn();

    render(<MyComponent onAction={mockCallback} />);

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### API Test Template

```typescript
import { api } from '@/lib/api';

global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make successful API call', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const result = await api.myEndpoint();

    expect(result).toEqual({ data: 'test' });
  });
});
```

## Best Practices

1. **User-Centric Testing**: Test what users see and do, not implementation details
2. **Accessibility**: Use accessible queries (getByRole, getByLabelText)
3. **Async Operations**: Properly handle async state updates
4. **Mocking**: Mock external dependencies (API, localStorage, router)
5. **Cleanup**: React Testing Library auto-cleans, but clear mocks manually
6. **Realistic Data**: Use data that resembles production

## Common Testing Patterns

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Testing API Calls

```typescript
it('should handle API error', async () => {
  (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

  await expect(api.getData()).rejects.toThrow('Network error');
});
```

## CI/CD Integration

Tests run in CI pipeline:

```bash
npm test
```

All tests must pass for deployment.
