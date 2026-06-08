# Project Structure

**Root:** C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud

## Directory Tree

```
crud/
├── backend/                 # Spring Boot Core Business Service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ortolan/
│   │   │   │       └── empresa/
│   │   │   │           └── crud/
│   │   │   │               ├── config/
│   │   │   │               ├── controller/
│   │   │   │               ├── entities/
│   │   │   │               ├── exception/
│   │   │   │               ├── repositories/
│   │   │   │               └── services/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-dev.properties
│   │   └── test/
│   │       └── java/
│   │           └── ortolan/
│   │               └── empresa/
│   │                   └── crud/
│   │                       ├── entities/
│   │                       ├── exception/
│   │                       └── services/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── Dockerfile
├── backend-node/            # Node.js Auth & Gateway Service
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── rabbitmq.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   └── orderController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   └── Order.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   └── orderRoutes.js
│   │   └── server.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/                # React Frontend Service
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserForm.jsx
│   │   │   ├── DeleteConfirmation.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── .specs/                  # Project specifications
│   ├── codebase/
│   │   ├── ARCHITECTURE.md
│   │   ├── CONCERNS.md
│   │   ├── CONVENTIONS.md
│   │   ├── INTEGRATIONS.md
│   │   ├── STACK.md
│   │   ├── STRUCTURE.md
│   │   └── TESTING.md
│   ├── features/
│   │   └── enhanced-frontend/
│   ├── project/
│   │   ├── PROJECT.md
│   │   ├── ROADMAP.md
│   │   └── STATE.md
│   └── quick/
├── .devin/                  # Devin agent configuration
│   └── skills/
│       └── tlc-spec-driven/
├── node_modules/            # Root npm dependencies
├── docker-compose.yml       # Docker orchestration
├── init.sql                 # MySQL initialization script
├── package.json             # Root npm scripts
├── PRD.md                   # Product Requirements Document
└── README.md                # Project documentation
```

## Module Organization

### Backend (Spring Boot Core Service)

**Purpose:** Core business logic for event management and order processing
**Location:** `backend/`
**Responsibilities:**
- Event inventory management
- Async order processing via RabbitMQ
- Transactional data operations
- Business rule enforcement

**Key files:** 
- `pom.xml` - Maven dependencies and build configuration
- `src/main/java/ortolan/empresa/crud/CrudApplication.java` - Main application entry point
- `src/main/resources/application.properties` - Application configuration

### Backend Node.js (Auth & Gateway Service)

**Purpose:** User authentication, JWT token management, and API gateway
**Location:** `backend-node/`
**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Request routing and authentication middleware
- Message publishing to RabbitMQ

**Key files:**
- `package.json` - npm dependencies and scripts
- `src/server.js` - Express server entry point
- `src/middleware/auth.js` - JWT authentication middleware
- `.env.example` - Environment configuration template

### Frontend (React Service)

**Purpose:** User interface for events discovery and ticket purchase
**Location:** `frontend/`
**Responsibilities:**
- Event catalog display
- User authentication UI
- Order creation and status tracking
- JWT token management

**Key files:**
- `package.json` - npm dependencies and scripts
- `vite.config.js` - Vite build configuration and proxy setup
- `src/App.jsx` - Main React component

### Infrastructure

**Purpose:** Orchestration and configuration for microservices
**Location:** Root directory
**Key files:**
- `docker-compose.yml` - Docker orchestration for all services
- `init.sql` - MySQL database initialization script
- `package.json` - Root npm scripts for development workflow

## Where Things Live

**User Authentication (RF01):**
- UI/Interface: `frontend/src/components/UserForm.jsx` (to be updated for auth)
- Auth Logic: `backend-node/src/controllers/authController.js`
- JWT Middleware: `backend-node/src/middleware/auth.js`
- User Model: `backend-node/src/models/User.js`
- Database: MySQL users table

**Event Catalog (RF02):**
- UI/Interface: `frontend/src/components/` (to be created for events)
- Event Logic: `backend-node/src/controllers/eventController.js`
- Event Model: `backend-node/src/models/Event.js`
- Database: MySQL events table

**Async Order Processing (RF03):**
- Order Initiation: `backend-node/src/controllers/orderController.js`
- Message Publishing: `backend-node/src/config/rabbitmq.js`
- Order Processing: `backend/src/main/java/ortolan/empresa/crud/` (to be implemented)
- Message Consuming: Spring Boot RabbitMQ consumer (to be implemented)
- Order Model: `backend-node/src/models/Order.js`
- Database: MySQL orders table

**Error Handling:**
- Node.js: Express error middleware (to be implemented)
- Spring Boot: `backend/src/main/java/ortolan/empresa/crud/exception/GlobalExceptionHandler.java`

**Cross-Cutting Concerns:**
- CORS Configuration: `backend-node/src/server.js` (cors middleware)
- Database Config: `backend-node/src/config/database.js`
- RabbitMQ Config: `backend-node/src/config/rabbitmq.js`

**Testing:**
- Spring Boot Unit Tests: `backend/src/test/java/ortolan/empresa/crud/services/UserServiceTest.java`
- Node.js Tests: Not yet implemented
- Frontend Tests: Not yet implemented

## Special Directories

**backend/src/main/resources/static:**
**Purpose:** Static web assets (currently empty)
**Examples:** Would contain CSS, JS, images if serving static content

**backend/src/main/resources/templates:**
**Purpose:** Server-side templates (currently empty)
**Examples:** Would contain Thymeleaf templates if using server-side rendering

**target/:
**Purpose:** Maven build output directory
**Examples:** Compiled classes, JAR files, test reports

**node_modules/:
**Purpose:** Root npm dependencies for development scripts
**Examples:** concurrently for running multiple services

**.specs/:
**Purpose:** Project specifications and documentation
**Examples:** This file and other spec-driven development documents

**.devin/:
**Purpose:** Devin AI agent configuration and skills
**Examples:** tlc-spec-driven skill for project planning

## Service Communication

**HTTP/REST Endpoints:**
- Frontend → Node.js: `http://localhost:3001/api/*`
- Node.js → MySQL: TCP connection on port 3306
- Spring Boot → MySQL: TCP connection on port 3306

**AMQP/RabbitMQ:**
- Node.js → RabbitMQ: `amqp://rabbitmq:5672`
- Spring Boot ← RabbitMQ: Message consumption from queues
- Queues: `order.created`, `user.registered`

**Docker Network:**
- All services communicate via `app-network` bridge network
- Service names used for internal DNS resolution
