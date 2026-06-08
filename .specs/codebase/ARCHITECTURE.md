# Architecture

**Pattern:** Monolithic REST API + SPA Frontend

## High-Level Structure

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   (React/Vite)  │◄────────┤  (Spring Boot)  │
│   Port: 3000    │  HTTP   │  Port: 8080     │
└─────────────────┘         └────────┬────────┘
                                     │
                              ┌──────┴──────┐
                              │  H2 Database │
                              │  (in-memory) │
                              └─────────────┘
```

## Identified Patterns

### Layered Architecture

**Location:** Backend (controller → service → repository)
**Purpose:** Separation of concerns and maintainability
**Implementation:** Standard Spring Boot layered architecture
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\controller\UserController.java" />

### Repository Pattern

**Location:** Backend repositories layer
**Purpose:** Data access abstraction using Spring Data JPA
**Implementation:** JpaRepository interfaces
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\repositories\UserRepository.java" />

### Exception Handling

**Location:** Global exception handler
**Purpose:** Centralized error handling and consistent error responses
**Implementation:** @RestControllerAdvice with @ExceptionHandler
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\exception\GlobalExceptionHandler.java" />

### CORS Configuration

**Location:** CORS configuration bean
**Purpose:** Enable cross-origin requests from frontend
**Implementation:** CorsFilter with allowed origins and methods
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\config\CorsConfig.java" />

## Data Flow

### User CRUD Operations

1. **Read Users:**
   - Frontend: React component → useEffect → fetch('/api/users')
   - Vite proxy: /api → http://localhost:8080
   - Backend: UserController.findAll() → UserService.findAll() → UserRepository.findAll()
   - Database: H2 SELECT query
   - Response: JSON array of users

2. **Create User:**
   - Frontend: Form submission → POST /api/users
   - Backend: UserController.salvarUsuario() → UserService.saveUser() → UserRepository.save()
   - Database: H2 INSERT query
   - Response: Created user object

3. **Update User:**
   - Frontend: Form submission → PUT /api/users/{id}
   - Backend: UserController.update() → UserService.updateUser() → UserRepository.findById() + save()
   - Database: H2 SELECT + UPDATE queries
   - Response: Updated user object

4. **Delete User:**
   - Frontend: Delete action → DELETE /api/users/{id}
   - Backend: UserController.delete() → UserService.delete() → UserRepository.deleteById()
   - Database: H2 DELETE query
   - Response: 200 OK

## Code Organization

**Approach:** Layer-based architecture with package organization

**Structure:**
```
backend/src/main/java/ortolan/empresa/crud/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── entities/        # JPA entities
├── exception/       # Custom exceptions and handlers
├── repositories/    # Data access layer
└── services/        # Business logic layer
```

**Module boundaries:**
- Controllers handle HTTP requests/responses
- Services contain business logic and transactions
- Repositories handle data access
- Entities represent database tables
- Exceptions handle error scenarios
- Config handles cross-cutting concerns (CORS)
