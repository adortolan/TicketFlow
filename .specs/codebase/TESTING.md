# Testing Infrastructure

## Test Frameworks

**Unit/Integration:** JUnit 5 + Mockito + Spring Boot Test
**E2E:** None
**Coverage:** JaCoCo 0.8.11

## Test Organization

**Location:** `backend/src/test/java/ortolan/empresa/crud/`
**Naming:** Test classes follow source class name + "Test" suffix (e.g., `UserServiceTest.java`)
**Structure:** Mirrors source package structure (entities, exception, services)

## Testing Patterns

### Unit Tests

**Approach:** Mockito-based unit testing with @ExtendWith(MockitoExtension.class)
**Location:** `backend/src/test/java/ortolan/empresa/crud/services/`
**Description:** Service layer tests mock repository dependencies using @Mock and @InjectMocks. Tests cover CRUD operations, edge cases, and exception scenarios.
**Example:** <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\test\java\ortolan\empresa\crud\services\UserServiceTest.java" />

### Entity Tests

**Approach:** Direct entity instantiation and field validation
**Location:** `backend/src/test/java/ortolan/empresa/crud/entities/`
**Description:** Tests entity constructors, getters, and setters to ensure proper field mapping.

### Exception Tests

**Approach:** Global exception handler testing with MockMvc
**Location:** `backend/src/test/java/ortolan/empresa/crud/exception/`
**Description:** Tests custom exception handling and error response formatting.

### E2E Tests

**Approach:** None implemented
**Location:** N/A
**Description:** No end-to-end tests exist. Frontend has no test framework configured.

## Test Execution

**Commands:**
- Backend tests: `npm run backend:test` or `cd backend && ./mvnw test`
- Frontend tests: `npm run frontend:test` (runs ESLint only)
- All tests: `npm run backend:test` (no frontend unit tests)

**Configuration:**
- Backend: Maven Surefire plugin for test execution
- Coverage: JaCoCo Maven plugin generates coverage reports after test phase
- Frontend: ESLint for code quality (no unit tests)

## Coverage Targets

**Current:** Not measured/enforced (JaCoCo configured but no targets set)
**Goals:** None documented
**Enforcement:** No automated enforcement

## Test Coverage Matrix

Analyzed the codebase to determine which code layers require which test types.

| Code Layer | Required Test Type | Location Pattern | Run Command |
| ---------- | ------------------ | ---------------- | ----------- |
| Entities | unit | `backend/src/test/java/**/entities/*Test.java` | `./mvnw test` |
| Services | unit | `backend/src/test/java/**/services/*Test.java` | `./mvnw test` |
| Controllers | none | N/A | N/A |
| Repositories | none | N/A | N/A |
| Exception Handlers | integration | `backend/src/test/java/**/exception/*Test.java` | `./mvnw test` |
| Frontend Components | none | N/A | N/A |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --------- | -------------- | --------------- | --------- |
| Unit (Services) | Yes | Mocked dependencies | `@Mock` annotations in UserServiceTest.java |
| Unit (Entities) | Yes | No external dependencies | Direct instantiation in UserTest.java |
| Integration (Exception) | Unknown | Not analyzed | GlobalExceptionHandlerTest.java not reviewed |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | -------- |
| Quick | After tasks with unit tests only | `cd backend && ./mvnw test` |
| Full | After tasks with integration tests | `cd backend && ./mvnw test` |
| Build | After phase completion | `cd backend && ./mvnw test && cd frontend && npm run lint` |
