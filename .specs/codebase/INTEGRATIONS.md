# External Integrations

## Database

**Service:** MySQL 8.0
**Purpose:** Persistent relational database for user, event, and order data
**Implementation:** MySQL2 (Node.js) and Spring Data JPA (Spring Boot)
**Configuration:** Docker Compose with init.sql initialization script
**Authentication:** Username/password authentication

**Configuration Details:**
- Host: `mysql` (Docker service name) or `localhost:3306` (local development)
- Database: `ticketflow`
- Username: `root`
- Password: `root`
- Port: 3306
- Initialization: `init.sql` script creates tables (users, events, orders)
- Persistence: Docker volume `mysql-data` for data persistence across container restarts

**Node.js Integration:**
- Library: MySQL2 3.6.5
- Configuration: `backend-node/src/config/database.js`
- Connection Pool: Configured via MySQL2 connection pool
- Models: User, Event, Order models in `backend-node/src/models/`

**Spring Boot Integration:**
- Library: Spring Data JPA with Hibernate
- Configuration: `backend/src/main/resources/application.properties`
- Connection Pool: HikariCP (default in Spring Boot)
- Entities: JPA entities in `backend/src/main/java/ortolan/empresa/crud/entities/`
- Repositories: Spring Data JPA repositories

## Message Queue

**Service:** RabbitMQ 3.12
**Purpose:** Asynchronous message broker for inter-service communication
**Implementation:** AMQP protocol via amqplib (Node.js) and Spring AMQP (Spring Boot)
**Configuration:** Docker Compose with management plugin
**Authentication:** Username/password authentication

**Configuration Details:**
- Host: `rabbitmq` (Docker service name) or `localhost:5672` (local development)
- Management UI: http://localhost:15672
- Username: `guest`
- Password: `guest`
- AMQP Port: 5672
- Management Port: 15672

**Queues:**
- `order.created` - Order creation events from Node.js to Spring Boot
- `user.registered` - User registration events for future email notifications

**Node.js Integration:**
- Library: amqplib 0.10.3
- Configuration: `backend-node/src/config/rabbitmq.js`
- Publisher: Node.js publishes order creation events
- Connection: AMQP connection with channel management

**Spring Boot Integration:**
- Library: Spring AMQP (to be implemented)
- Configuration: Spring Boot RabbitMQ configuration (to be implemented)
- Consumer: Spring Boot consumes order creation events
- Listener: @RabbitListener annotation for message consumption

## API Integrations

### Frontend to Node.js Gateway

**Purpose:** REST API communication between React frontend and Node.js Auth/Gateway service
**Location:** Frontend uses native fetch API; Node.js uses Express.js
**Authentication:** JWT tokens in Authorization header
**Key endpoints:**
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login and JWT generation
- GET `/api/auth/profile` - Get user profile (requires JWT)
- GET `/api/events` - List all events (public)
- POST `/api/events` - Create event (requires ADMIN role)
- POST `/api/orders` - Create order (requires JWT)
- GET `/api/orders/:id` - Get order status (requires JWT)

**Proxy Configuration:**
- Development: Vite proxy in `frontend/vite.config.js` routes `/api` to `http://localhost:3001`
- Production: Nginx reverse proxy in `frontend/nginx.conf` routes `/api/` to `http://backend-node:3001/`

### Node.js to Spring Boot (Async)

**Purpose:** Asynchronous communication via RabbitMQ message queue
**Location:** Node.js publishes messages; Spring Boot consumes messages
**Authentication:** None (internal service communication)
**Message Flow:**
- Node.js publishes order creation event to `order.created` queue
- Spring Boot consumes message and processes order asynchronously
- Spring Boot updates order status in MySQL
- Frontend polls order status via Node.js API

## Webhooks

None implemented currently. Future consideration for order completion notifications to frontend.

## Background Jobs

**Service:** RabbitMQ Message Consumers
**Purpose:** Asynchronous order processing and inventory management
**Implementation:** Spring Boot @RabbitListener methods (to be implemented)
**Configuration:** Spring AMQP configuration

**Job Types:**
- Order Processing: Consume `order.created` messages, validate inventory, update status
- User Notifications: Consume `user.registered` messages for email notifications (future)

## Container Orchestration

**Service:** Docker Compose
**Purpose:** Containerized deployment of all microservices and infrastructure
**Implementation:** `docker-compose.yml` in root directory
**Configuration:**
- MySQL service: MySQL 8.0 with volume persistence and healthcheck
- RabbitMQ service: RabbitMQ 3.12 with management plugin and healthcheck
- Backend service: Spring Boot application with MySQL and RabbitMQ dependencies
- Backend-node service: Node.js Express application with MySQL and RabbitMQ dependencies
- Frontend service: Nginx serving React build with backend-node proxy
- Network: Custom bridge network `app-network` for service communication
- Healthchecks: All services have healthcheck configurations
- Dependencies: Services depend on MySQL and RabbitMQ being healthy before starting

**Service Dependencies:**
- Backend depends on: mysql (healthy), rabbitmq (healthy)
- Backend-node depends on: mysql (healthy), rabbitmq (healthy)
- Frontend depends on: backend (healthy), backend-node (healthy)

## Development Tools

**Service:** RabbitMQ Management UI
**Purpose:** Web-based interface for monitoring and managing RabbitMQ
**Implementation:** RabbitMQ Management Plugin
**Authentication:** guest/guest (development only)
**Access:** http://localhost:15672

**Features:**
- Queue monitoring and management
- Message inspection and publishing
- Connection and channel monitoring
- Virtual host management

**Service:** MySQL Client
**Purpose:** Database management and query execution
**Implementation:** MySQL command-line client or GUI tools
**Authentication:** root/root (development only)
**Access:** mysql -h localhost -P 3306 -u root -p
