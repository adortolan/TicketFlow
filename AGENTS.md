# Project Guidelines for AI Agents

This document contains project-specific information and guidelines for AI agents working on this codebase.

## Project Overview

**Project Name:** TicketFlow - Microservices Event Ticketing System
**Architecture:** Microservices with Node.js (Auth/Gateway), Spring Boot (Order Processing), RabbitMQ (Message Queue), MySQL (Database), React (Frontend)

## Tech Stack

### Backend-Node (Auth/Gateway Service)
- **Language:** TypeScript (recently migrated from JavaScript)
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Database:** MySQL (mysql2)
- **Message Queue:** RabbitMQ (amqplib)
- **Development:** tsx + nodemon for hot-reload
- **Build:** tsc for TypeScript compilation
- **Testing:** Jest + ts-jest + Supertest
- **Container:** Multi-stage Docker build

### Backend-Spring (Order Processing Service)
- **Language:** Java
- **Framework:** Spring Boot
- **Database:** MySQL
- **Message Queue:** RabbitMQ
- **Architecture:** Layered (Controller → Service → Repository)

### Frontend
- **Language:** JavaScript (React)
- **Build Tool:** Vite
- **State Management:** React hooks
- **Architecture:** Component-based

## Development Commands

### Backend-Node
```bash
# Development
npm run dev              # Start with tsx + nodemon (hot-reload)
npm run build           # Compile TypeScript to dist/
npm start               # Run compiled JavaScript from dist/

# Testing
npm test                # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Database
npm run seed            # Seed admin user with TypeScript script
```

### Docker
```bash
# Build backend-node with TypeScript
docker build -t backend-node .

# Run with Docker Compose
docker-compose up backend-node
docker-compose up        # All services
docker-compose down
```

## Project Structure

```
crud/
├── backend-node/              # TypeScript Auth/Gateway Service
│   ├── src/
│   │   ├── config/          # Database, RabbitMQ configs
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Data models with interfaces
│   │   ├── routes/          # Express routes
│   │   ├── types/           # TypeScript types (JWTPayload, Express extensions)
│   │   ├── utils/           # Utilities (errors, helpers)
│   │   ├── __tests__/       # Jest test suites
│   │   └── server.ts        # Application entry point
│   ├── scripts/
│   │   └── seed.ts          # Admin user seed script
│   ├── dist/                # Compiled JavaScript (generated)
│   ├── coverage/            # Test coverage reports
│   ├── jest.config.ts       # Jest configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── Dockerfile           # Multi-stage build
├── backend-spring/           # Java Order Processing Service
├── frontend/                # React Frontend
├── .specs/                   # Project specifications
│   ├── project/             # Project-level specs (STATE.md)
│   └── features/            # Feature specifications
└── docker-compose.yml       # Multi-service orchestration
```

## TypeScript Configuration

- **Target:** ES2020
- **Module:** CommonJS
- **Strict Mode:** false (initially for migration, consider enabling later)
- **Type Roots:** src/types/
- **Output:** dist/ (compiled JavaScript)

## Key TypeScript Types

### JWTPayload
```typescript
interface JWTPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'CLIENTE';
}
```

### Express Extension
```typescript
// src/types/express/index.d.ts
declare namespace Express {
  interface Request {
    user?: JWTPayload;
  }
}
```

## Database Schema

### Users Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR) - bcrypt hashed
- cpf (VARCHAR, UNIQUE)
- role (ENUM: 'ADMIN', 'CLIENTE')
- created_at (TIMESTAMP)

### Events Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR)
- date (DATE)
- location (VARCHAR)
- price (DECIMAL)
- available_tickets (INT)
- created_by (INT, FOREIGN KEY → users.id)
- created_at (TIMESTAMP)

### Orders Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY → users.id)
- event_id (INT, FOREIGN KEY → events.id)
- quantity (INT)
- total_price (DECIMAL)
- status (ENUM: 'PENDING', 'CONFIRMED', 'CANCELLED')
- created_at (TIMESTAMP)

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login (returns JWT)
- GET /api/auth/profile - Get user profile (requires JWT)

### Events
- GET /api/events - List all events
- GET /api/events/:id - Get specific event
- POST /api/events - Create event (ADMIN only)

### Orders
- POST /api/orders - Create order
- GET /api/orders/:id - Get order details
- GET /api/orders/user/orders - Get user's orders

### Health
- GET /health - Service health check (MySQL, RabbitMQ status)

## Environment Variables

### Backend-Node (.env)
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketflow
DB_USER=root
DB_PASSWORD=password
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE_ORDER_CREATED=order.created
RABBITMQ_QUEUE_USER_REGISTERED=user.registered
```

## Testing Guidelines

### Test Structure
- Unit tests in `src/__tests__/` alongside source files
- Integration tests for HTTP endpoints using Supertest
- Test coverage reports generated in `coverage/`

### Running Tests
```bash
npm test                # All tests
npm run test:coverage   # With coverage
npm run test:watch      # Watch mode
```

### Current Test Status
- 69 tests passing in 9 suites
- Coverage reports generated successfully
- Tests for utils, models, middleware, controllers, and health endpoint

## Common Patterns

### Error Handling
Use the centralized `AppError` class from `src/utils/errors.ts`:
```typescript
import { AppError, ErrorCodes } from '../utils/errors';

throw new AppError('User not found', 404, 'USER_NOT_FOUND');
```

### Authentication Middleware
Protected routes use the `authenticateToken` middleware:
```typescript
import { authenticateToken } from '../middleware/auth';

router.get('/profile', authenticateToken, getProfile);
```

### Database Queries
Use typed interfaces for query results:
```typescript
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
const users = rows as IUser[];
```

## Recent Changes

### TypeScript Migration (2026-07-09)
- ✅ Complete migration from JavaScript to TypeScript
- ✅ 25 TypeScript files (including tests)
- ✅ Multi-stage Docker build for production
- ✅ Jest + ts-jest test infrastructure
- ✅ 69 tests passing in 9 suites
- ✅ Centralized type definitions
- ✅ Express Request extension with req.user typing

## Important Notes

1. **TypeScript First:** All new code in backend-node should be written in TypeScript
2. **Type Safety:** Use interfaces and types explicitly, avoid `any`
3. **Testing:** Write tests for new features using Jest + ts-jest
4. **Database:** Always use parameterized queries to prevent SQL injection
5. **Authentication:** Use JWT tokens for protected routes
6. **Error Handling:** Use AppError class for consistent error responses
7. **Async Operations:** Use async/await for database and RabbitMQ operations

## Verification Commands

When making changes to backend-node, verify with:
```bash
npm run build           # TypeScript compilation
npm test                # All tests pass
npm run test:coverage   # Coverage maintained
npm run dev             # Development server starts
```

## File Naming Conventions

- **TypeScript files:** `.ts` extension
- **Test files:** `.test.ts` extension in `__tests__/` directories
- **Type definitions:** `.d.ts` extension for type declarations
- **Components:** PascalCase (React)
- **Utilities/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE

## Git Workflow

- Feature branches for new features
- Commit messages should be descriptive
- Include type definitions with TypeScript changes
- Update tests when modifying functionality
- Update documentation when changing APIs or structure