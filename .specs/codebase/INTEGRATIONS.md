# External Integrations

## Database

**Service:** H2 Database
**Purpose:** In-memory database for development and testing
**Implementation:** Spring Data JPA with Hibernate ORM
**Configuration:** `backend/src/main/resources/application.properties`
**Authentication:** None (in-memory database with default credentials)

**Configuration Details:**
- URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)
- Console: Enabled at `/h2-console`
- DDL Auto: `create-drop` (recreates schema on startup)

## Development Tools

**Service:** H2 Console
**Purpose:** Web-based database management interface for development
**Implementation:** Spring Boot H2 Console
**Configuration:** Enabled in `application.properties`
**Authentication:** None (development only)
**Access:** http://localhost:8080/h2-console

## API Integrations

### Frontend to Backend

**Purpose:** REST API communication between React frontend and Spring Boot backend
**Location:** Frontend uses native fetch API; Backend uses Spring MVC
**Authentication:** None (no authentication implemented)
**Key endpoints:**
- GET `/users` - List all users
- POST `/users` - Create new user
- PUT `/users/{id}` - Update user
- DELETE `/users/{id}` - Delete user

**Proxy Configuration:**
- Development: Vite proxy in `frontend/vite.config.js` routes `/api` to `http://localhost:8080`
- Production: Nginx reverse proxy in `frontend/nginx.conf` routes `/api/` to `http://backend:8080/`

## Webhooks

None implemented.

## Background Jobs

None implemented. No queue system or background job infrastructure detected.

## Container Orchestration

**Service:** Docker Compose
**Purpose:** Containerized deployment of both frontend and backend services
**Implementation:** `docker-compose.yml` in root directory
**Configuration:**
- Backend service: Spring Boot application with healthcheck
- Frontend service: Nginx serving React build with backend proxy
- Network: Custom bridge network for service communication
- Healthcheck: Backend health endpoint ensures frontend starts after backend is ready
