# Tech Stack

**Analyzed:** 2026-06-08

## Core

- Framework: Spring Boot 4.0.6
- Language: Java 17
- Runtime: Spring Boot (embedded Tomcat)
- Package manager: Maven

## Frontend

- UI Framework: React 18.3.1
- Build Tool: Vite 5.3.1
- Styling: CSS (no framework detected)
- State Management: React hooks (useState, useEffect)
- Form Handling: Native fetch API

## Backend

- API Style: REST + Spring MVC
- Database: H2 (in-memory) + Spring Data JPA
- Authentication: None (no auth implementation)
- ORM: Hibernate (via Spring Data JPA)

## Testing

- Unit: JUnit 5 + Mockito
- Integration: Spring Boot Test
- Coverage: JaCoCo 0.8.11
- E2E: None

## External Services

- Database: H2 (in-memory)
- Console: H2 Console (for development)

## Development Tools

- Build: Maven Wrapper
- Process Management: concurrently (for running both services)
- Docker: Docker Compose for containerized deployment
- Linting: ESLint (frontend)
