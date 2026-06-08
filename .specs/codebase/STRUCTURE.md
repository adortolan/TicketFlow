# Project Structure

**Root:** C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud

## Directory Tree

```
crud/
├── backend/
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
│   │   │       ├── static/
│   │   │       ├── templates/
│   │   │       ├── application.properties
│   │   │       └── data.sql
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
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── .specs/
├── .devin/
├── .idea/
├── target/
├── docker-compose.yml
├── package.json
└── README.md
```

## Module Organization

### Backend

**Purpose:** Spring Boot REST API for user CRUD operations
**Location:** `backend/`
**Key files:** 
- `pom.xml` - Maven dependencies and build configuration
- `src/main/java/ortolan/empresa/crud/CrudApplication.java` - Main application entry point
- `src/main/resources/application.properties` - Application configuration

### Frontend

**Purpose:** React SPA for user management UI
**Location:** `frontend/`
**Key files:**
- `package.json` - npm dependencies and scripts
- `vite.config.js` - Vite build configuration and proxy setup
- `src/App.jsx` - Main React component

### Monorepo Root

**Purpose:** Coordination scripts for both services
**Location:** Root directory
**Key files:**
- `package.json` - Root npm scripts for running both services
- `docker-compose.yml` - Docker orchestration for containerized deployment

## Where Things Live

**User CRUD Operations:**
- UI/Interface: `frontend/src/App.jsx`
- Business Logic: `backend/src/main/java/ortolan/empresa/crud/services/UserService.java`
- Data Access: `backend/src/main/java/ortolan/empresa/crud/repositories/UserRepository.java`
- Configuration: `backend/src/main/resources/application.properties`

**Error Handling:**
- Custom Exceptions: `backend/src/main/java/ortolan/empresa/crud/exception/ResourceNotFoundException.java`
- Global Handler: `backend/src/main/java/ortolan/empresa/crud/exception/GlobalExceptionHandler.java`

**Cross-Cutting Concerns:**
- CORS Configuration: `backend/src/main/java/ortolan/empresa/crud/config/CorsConfig.java`

**Testing:**
- Unit Tests: `backend/src/test/java/ortolan/empresa/crud/services/UserServiceTest.java`
- Entity Tests: `backend/src/test/java/ortolan/empresa/crud/entities/UserTest.java`
- Exception Tests: `backend/src/test/java/ortolan/empresa/crud/exception/GlobalExceptionHandlerTest.java`

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

**.specs/:
**Purpose:** Project specifications and documentation
**Examples:** This file and other spec-driven development documents
