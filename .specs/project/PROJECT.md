# CRUD Monorepo

**Vision:** A full-stack CRUD application demonstrating Spring Boot REST API with React frontend for user management.
**For:** Developers learning full-stack development with Java and React
**Solves:** Provides a complete example of building a CRUD application with modern technologies and best practices

## Goals

- Demonstrate clean architecture patterns in Spring Boot (layered architecture, separation of concerns)
- Provide a working example of React frontend consuming REST API with proper error handling
- Establish a foundation for learning full-stack development with containerized deployment
- Enable rapid development with hot-reload for both frontend and backend

## Tech Stack

**Core:**

- Framework: Spring Boot 4.0.6
- Language: Java 17
- Database: H2 (in-memory for development)
- Frontend: React 18.3.1 with Vite 5.3.1

**Key dependencies:**

- Spring Data JPA (database access)
- Spring MVC (REST API)
- React hooks (state management)
- Docker Compose (containerization)
- JUnit 5 + Mockito (testing)

## Scope

**v1 includes:**

- User CRUD operations (Create, Read, Update, Delete)
- REST API with proper HTTP methods and status codes
- React frontend with user list display
- CORS configuration for cross-origin requests
- Global exception handling for consistent error responses
- Unit tests for service layer
- Docker containerization for easy deployment
- Development scripts for running both services simultaneously

**Explicitly out of scope:**

- Authentication and authorization
- Input validation
- Production database configuration
- API versioning
- Pagination
- Frontend forms for create/update/delete operations (currently only read)
- E2E testing
- API documentation (Swagger/OpenAPI)

## Constraints

- Timeline: Learning project, no strict deadlines
- Technical: Uses in-memory H2 database (not production-ready)
- Resources: Single developer project, educational focus
