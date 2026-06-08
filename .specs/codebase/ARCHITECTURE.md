# Architecture

**Pattern:** Microservices with Event-Driven Communication

## High-Level Structure

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │  Node.js Auth   │         │  Spring Boot    │
│   (React/Vite)  │◄────────┤  & Gateway      │◄────────┤  Core Service   │
│   Port: 3000    │  HTTP   │  Port: 3001     │  AMQP   │  Port: 8080     │
└─────────────────┘         └────────┬────────┘         └────────┬────────┘
                                     │                          │
                                     │                          │
                              ┌──────┴──────┐           ┌──────┴──────┐
                              │  RabbitMQ    │           │   MySQL      │
                              │  Port: 5672  │           │  Port: 3306  │
                              └─────────────┘           └─────────────┘
```

## Service Boundaries

### Frontend Service (React)
- **Responsibility:** User interface for events discovery and ticket purchase
- **Communication:** HTTP REST API calls to Node.js Gateway
- **State Management:** Local React state + localStorage for JWT tokens
- **Deployment:** nginx reverse proxy (production), Vite dev server (development)

### Backend Node.js Service (Auth & Gateway)
- **Responsibility:** User authentication, JWT token management, initial request handling
- **Communication:** REST API with Frontend, AMQP with RabbitMQ, MySQL for user data
- **Key Features:** JWT generation/validation, BCrypt password hashing, Request routing
- **Patterns:** API Gateway pattern, Authentication Service pattern

### Backend Spring Boot Service (Core Business)
- **Responsibility:** Event management, order processing, inventory validation
- **Communication:** AMQP consumer from RabbitMQ, MySQL for events/orders data
- **Key Features:** Async order processing, inventory management, transaction handling
- **Patterns:** Event-driven architecture, Consumer pattern, Transactional processing

## Identified Patterns

### API Gateway Pattern

**Location:** Node.js backend service
**Purpose:** Single entry point for frontend requests, authentication enforcement, request routing
**Implementation:** Express.js middleware for JWT validation, route handlers for different resources
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend-node\src\middleware\auth.js" />

### Event-Driven Architecture

**Location:** Communication between Node.js and Spring Boot via RabbitMQ
**Purpose:** Decouple services, enable async processing, improve resilience
**Implementation:** RabbitMQ queues (order.created, user.registered), AMQP publishers/consumers
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend-node\src\config\rabbitmq.js" />

### Layered Architecture (Spring Boot)

**Location:** Spring Boot backend service
**Purpose:** Separation of concerns and maintainability
**Implementation:** Standard Spring Boot layered architecture (Controller → Service → Repository)
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\controller\UserController.java" />

### Repository Pattern

**Location:** Both backend services
**Purpose:** Data access abstraction
**Implementation:** JpaRepository interfaces (Spring Boot), MySQL2 connection pools (Node.js)
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\repositories\UserRepository.java" />

### JWT Authentication Pattern

**Location:** Node.js service (generation), both services (validation)
**Purpose:** Stateless authentication, token-based authorization
**Implementation:** jsonwebtoken library, middleware for token validation
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend-node\src\controllers\authController.js" />

## Data Flow

### User Authentication Flow (RF01)

1. **User Registration:**
   - Frontend: Registration form → POST /api/auth/register
   - Node.js: authController.register() → BCrypt hash password → MySQL INSERT
   - Response: User created confirmation

2. **User Login:**
   - Frontend: Login form → POST /api/auth/login
   - Node.js: authController.login() → BCrypt verify password → Generate JWT
   - Response: JWT token (stored in localStorage)

3. **Authenticated Request:**
   - Frontend: API call with Authorization: Bearer <TOKEN>
   - Node.js: auth middleware → Verify JWT → Extract user claims
   - Processing: Request proceeds if valid, 401 if invalid

### Event Catalog Flow (RF02)

1. **List Events (Public):**
   - Frontend: GET /api/events
   - Node.js: eventController.getAll() → MySQL SELECT
   - Response: JSON array of events

2. **Create Event (Admin Only):**
   - Frontend: POST /api/events (with JWT)
   - Node.js: auth middleware → Verify ADMIN role → eventController.create()
   - MySQL: INSERT event with admin_id
   - Response: Created event object

### Async Order Processing Flow (RF03)

1. **Order Initiation:**
   - Frontend: POST /api/orders (with JWT, eventId, quantity)
   - Node.js: auth middleware → Verify JWT → orderController.create()
   - MySQL: INSERT order with status "PENDING"
   - RabbitMQ: Publish message to order.created queue
   - Response: Order ID with status "PROCESSING"

2. **Order Processing (Async):**
   - Spring Boot: RabbitMQ consumer receives message
   - Validation: Check event inventory availability
   - Transaction: BEGIN → Decrement inventory → Update order status → COMMIT
   - MySQL: UPDATE events (inventory), UPDATE orders (status)
   - RabbitMQ: Publish order.completed message (optional)

3. **Order Status Check:**
   - Frontend: Poll GET /api/orders/:id
   - Node.js: MySQL SELECT order status
   - Response: Current status (PENDING → CONFIRMED/CANCELLED)

## Code Organization

**Approach:** Service-based architecture with clear boundaries

**Frontend Structure:**
```
frontend/src/
├── components/      # React components (UserList, UserForm, etc.)
├── App.jsx          # Main application component
└── main.jsx         # Entry point
```

**Node.js Backend Structure:**
```
backend-node/src/
├── config/          # Database and RabbitMQ configuration
├── controllers/     # Request handlers (auth, events, orders)
├── middleware/      # JWT authentication middleware
├── models/          # Data models (User, Event, Order)
├── routes/          # API route definitions
└── server.js        # Express server entry point
```

**Spring Boot Backend Structure:**
```
backend/src/main/java/ortolan/empresa/crud/
├── config/          # Configuration classes (CORS, RabbitMQ)
├── controller/      # REST controllers
├── entities/        # JPA entities
├── exception/       # Custom exceptions and handlers
├── repositories/    # Data access layer
└── services/        # Business logic layer
```

**Module boundaries:**
- Frontend: UI logic, state management, API consumption
- Node.js: Authentication, request routing, message publishing
- Spring Boot: Business logic, inventory management, message consumption
- MySQL: Persistent data storage for all services
- RabbitMQ: Message broker for async communication

## Communication Protocols

**Synchronous (HTTP/REST):**
- Frontend ↔ Node.js: All user-facing API calls
- Node.js ↔ MySQL: User data queries
- Spring Boot ↔ MySQL: Event and order data queries

**Asynchronous (AMQP/RabbitMQ):**
- Node.js → Spring Boot: Order creation events
- Future: User registration events for email notifications
- Future: Order completion events for frontend updates

## Data Consistency

**Strategy:** Eventual consistency with transactional processing
- Node.js: Immediate consistency for user operations
- Spring Boot: ACID transactions for inventory updates
- Cross-service: Eventual consistency via message queue
- Fallback: Order status polling for frontend updates
