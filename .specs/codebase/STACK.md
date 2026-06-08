# Tech Stack

**Analyzed:** 2026-06-08

## Core Architecture

**Pattern:** Microservices with Event-Driven Communication
**Services:** 3 independent services (Node.js Auth/Gateway, Spring Boot Core, React Frontend)
**Communication:** REST API + RabbitMQ (async messaging)

## Frontend Service

- UI Framework: React 18.3.1
- Build Tool: Vite 5.3.1
- Styling: CSS (no framework detected)
- State Management: React hooks (useState, useEffect)
- Form Handling: Native fetch API
- Deployment: nginx (production), Vite dev server (development)
- Port: 3000 (dev), 80 (production nginx)

## Backend Node.js Service (Auth & Gateway)

- Framework: Express 4.18.2
- Language: JavaScript (Node.js)
- Runtime: Node.js
- Package manager: npm
- API Style: REST
- Authentication: JWT (jsonwebtoken 9.0.2)
- Password Hashing: BCrypt 5.1.1
- Database Client: MySQL2 3.6.5
- Message Queue: AMQP (amqplib 0.10.3)
- Validation: express-validator 7.0.1
- CORS: cors 2.8.5
- Environment: dotenv 16.3.1
- Port: 3001

## Backend Spring Boot Service (Core Business)

- Framework: Spring Boot 4.0.6
- Language: Java 17
- Runtime: Spring Boot (embedded Tomcat)
- Package manager: Maven
- API Style: REST + Spring MVC
- Database: MySQL 8.0 + Spring Data JPA
- ORM: Hibernate (via Spring Data JPA)
- Message Queue: Spring AMQP (RabbitMQ)
- Port: 8080

## Database

- Primary: MySQL 8.0
- Connection Pooling: HikariCP (via Spring Boot)
- Schema: ticketflow (Users, Events, Orders tables)
- Migration: SQL init script (init.sql)
- Console: MySQL client (not H2 Console)

## Message Queue

- Broker: RabbitMQ 3.12
- Management UI: RabbitMQ Management Plugin (port 15672)
- Protocol: AMQP 0-9-1
- Queues: order.created, user.registered
- Exchange: Default direct exchange

## Testing

**Backend Spring Boot:**
- Unit: JUnit 5 + Mockito
- Integration: Spring Boot Test
- Coverage: JaCoCo 0.8.11
- E2E: None

**Backend Node.js:**
- Unit: None (not implemented)
- Integration: None (not implemented)
- E2E: None

**Frontend:**
- Unit: None (not implemented)
- Component: None (not implemented)
- E2E: None

## External Services

- Database: MySQL 8.0 (Docker container)
- Message Queue: RabbitMQ 3.12 (Docker container)
- Management: RabbitMQ Management UI (http://localhost:15672)

## Development Tools

- Build: Maven Wrapper (Spring Boot), npm (Node.js), Vite (Frontend)
- Process Management: concurrently (for running multiple services)
- Containerization: Docker, Docker Compose
- Linting: ESLint (frontend)
- Environment Management: .env files (Node.js), application.properties (Spring Boot)
- API Testing: curl, Postman (manual)

## Deployment

- Orchestration: Docker Compose
- Services: 5 containers (mysql, rabbitmq, backend, backend-node, frontend)
- Network: Docker bridge network (app-network)
- Volumes: mysql-data (persistent storage)
- Health Checks: Configured for all services
- Reverse Proxy: nginx (frontend container)
