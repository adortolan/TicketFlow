# State

**Last Updated:** 2026-07-10T00:00:00Z
**Current Work:** Milestone 3 — Core Business Service (Spring Boot): Tasks 1, 2 e 3 concluídas (migração H2 → MySQL + configuração Spring AMQP/RabbitMQ)

---

## Recent Decisions (Last 60 days)

### AD-010: Migração TypeScript do backend-node concluída (2026-07-09)

**Decision:** Migração completa de JavaScript para TypeScript do serviço backend-node com 100% dos requisitos atendidos
**Reason:** Type-safety em compile-time, melhor suporte de IDE, contratos explícitos entre módulos, base para evolução segura do serviço
**Trade-off:** Adiciona toolchain de build; requer `@types/*` para dependências externas; `dist/` precisa ser excluído do git
**Impact:** Dev: `npm run dev` via tsx; Prod: `npm start` via `node dist/server.js`; Docker: multi-stage build; Testes: 69 testes em 9 suites
**Resultados:**
- ✅ 25 arquivos TypeScript (incluindo testes)
- ✅ 15 arquivos JavaScript compilados no dist/
- ✅ 69 testes passando (100%)
- ✅ Dockerfile multi-stage build otimizado
- ✅ Script de seed migrado para TypeScript
- ✅ Tipos centralizados (JWTPayload, UserRole, extensão Express)
- ✅ 0 arquivos .js em src/ ou scripts/

### AD-009: Migrar backend-node para TypeScript (2026-06-16)

**Decision:** Converter todo o código-fonte de `backend-node` de JavaScript para TypeScript com `tsx + nodemon` em dev e `tsc` para build de produção
**Reason:** Type safety em compile-time, melhor suporte de IDE, contratos explícitos entre módulos, base para evolução segura do serviço
**Trade-off:** Adiciona toolchain de build; requer `@types/*` para dependências externas; `dist/` precisa ser excluído do git
**Impact:** Dev: `npm run dev` via tsx; Prod: `npm start` via `node dist/server.js`; Docker: multi-stage build
**Decisions captured:**
- Module system: CommonJS (mantém compatibilidade com amqplib e express)
- Express Request: estendido com `user?: JWTPayload` via `src/types/express/index.d.ts`
- Seed script: migrado para `scripts/seed.ts` (executado com `tsx`)
- `strict: false` inicial para migração incremental

### AD-005: Adopt microservices architecture for TicketFlow (2026-06-08)

**Decision:** Evolve from monolithic CRUD to microservices architecture with Node.js, Spring Boot, RabbitMQ, MySQL, and React
**Reason:** Better aligns with PRD requirements and demonstrates distributed systems patterns, async messaging, and JWT authentication
**Trade-off:** Increased complexity with multiple services to coordinate, requires Docker Compose for local development
**Impact:** Project now demonstrates event-driven architecture, service communication via RabbitMQ, and decentralized JWT validation

### AD-006: Use MySQL instead of H2 for production-ready database (2026-06-08)

**Decision:** Configure MySQL 8.0 as primary database instead of H2 in-memory
**Reason:** PRD specifies MySQL for ACID compliance and production readiness; required for multi-service data persistence
**Trade-off:** Requires external database setup (Docker), more complex configuration than H2
**Impact:** Data persists across restarts, enables true microservices data sharing, production-ready configuration

### AD-007: Implement Node.js as Auth/Gateway Service (2026-06-08)

**Decision:** Use Node.js + Express for authentication and API Gateway instead of Spring Security
**Reason:** Faster development for auth endpoints, JWT generation, and initial request handling; demonstrates polyglot architecture
**Trade-off:** Additional service to maintain, JWT validation logic duplicated across services
**Impact:** Separates auth concerns from business logic, enables independent scaling of auth vs core processing

### AD-008: Use RabbitMQ for async order processing (2026-06-08)

**Decision:** Implement RabbitMQ for asynchronous communication between Node.js and Spring Boot services
**Reason:** Decouples services, enables message queuing for order processing, improves resilience
**Trade-off:** Additional infrastructure component, requires message queue management
**Impact:** Orders can be queued even if Spring Boot is temporarily unavailable, enables future scaling

### AD-001: Use H2 in-memory database for development (2026-06-08) - DEPRECATED

**Decision:** Use H2 in-memory database instead of production database
**Reason:** Simplifies development and setup for learning project
**Trade-off:** Data persistence lost on restart, not production-ready
**Impact:** Requires future migration to PostgreSQL/MySQL for production use
**Status:** Replaced by AD-006 - now using MySQL 8.0

### AD-002: Implement layered architecture with Spring Boot (2026-06-08)

**Decision:** Follow standard Spring Boot layered architecture (Controller → Service → Repository)
**Reason:** Separation of concerns, maintainability, and industry best practices
**Trade-off:** Additional boilerplate code compared to simpler approaches
**Impact:** Clear code organization, easier testing and maintenance

### AD-003: Use Vite instead of Create React App (2026-06-08)

**Decision:** Use Vite as build tool for React frontend
**Reason:** Faster development server, modern build tooling, better DX
**Trade-off:** Less familiar to some developers compared to CRA
**Impact:** Faster hot-reload and build times during development

### AD-004: Implement component-based architecture for frontend (2026-06-08)

**Decision:** Break monolithic App.jsx into 5 reusable components (UserList, UserForm, DeleteConfirmation, ErrorMessage, LoadingSpinner)
**Reason:** Improved maintainability, reusability, and testability; follows React best practices
**Trade-off:** More files to manage, prop drilling for state management
**Impact:** Clear separation of concerns, easier to extend and modify individual features

---

## Active Blockers

None currently.

---

## Lessons Learned

### L-004: Documentation must evolve with architecture changes (2026-06-08)

**Context:** Project evolved from monolithic CRUD to microservices TicketFlow but documentation wasn't updated
**Problem:** Documentation in .specs/ described old architecture, causing confusion about actual project structure
**Solution:** Update all .specs/ documentation to reflect current microservices architecture per PRD
**Prevents:** Future confusion about project scope, architecture, and implementation status

### L-001: Backup files should be in .gitignore (2026-06-08)

**Context:** Found multiple backup files (~) in the codebase during brownfield mapping
**Problem:** Backup files clutter the repository and can cause confusion
**Solution:** Add `*~` pattern to .gitignore and remove existing backup files
**Prevents:** Future backup file commits and repository clutter

### L-002: CORS configuration needs environment-specific settings (2026-06-08)

**Context:** CorsConfig.java allows multiple localhost origins for development
**Problem:** Development CORS settings may be insecure if used in production
**Solution:** Implement profile-based CORS configuration for different environments
**Prevents:** Security vulnerabilities from overly permissive CORS in production

### L-003: Manual form validation sufficient for simple forms (2026-06-08)

**Context:** Enhanced frontend required form validation for user creation/editing
**Problem:** Deciding between form validation library vs manual validation
**Solution:** Used manual validation with React state for this simple use case
**Prevents:** Unnecessary dependencies for basic validation requirements
**Future:** Consider react-hook-form + yup for complex forms with advanced validation

---

## Quick Tasks Completed

||| # | Description | Date | Commit | Status |
||---|-----------|------|--------|--------|
|| 001 | Project initialization with spec-driven documentation | 2026-06-08 | N/A | ✅ Done |
|| 002 | Enhanced frontend implementation with full CRUD functionality | 2026-06-08 | N/A | ✅ Done |
|| 003 | Infrastructure setup for microservices (Docker Compose, MySQL, RabbitMQ) | 2026-06-08 | N/A | ✅ Done |
|| 004 | Project documentation update to reflect TicketFlow architecture | 2026-06-08 | N/A | ✅ Done |
| 005 | TypeScript migration of backend-node service (100% complete) | 2026-07-09 | N/A | ✅ Done |
| 006 | M3 Spring Boot infra: H2 → MySQL + RabbitMQ config (Tasks 1–3) | 2026-07-10 | N/A | ✅ Done |

---

## Deferred Ideas

- [ ] Add TypeScript to frontend React for better type safety — Captured during: Project initialization (backend-node já migrado ✅)
- [ ] Implement API versioning for future compatibility — Captured during: Project initialization
- [ ] Add pagination to event list endpoint — Captured during: Microservices architecture planning
- [ ] Implement caching layer for frequently accessed data — Captured during: Microservices architecture planning
- [ ] Add circuit breaker pattern for RabbitMQ communication — Captured during: Microservices architecture planning
- [ ] Enable `strict: true` in TypeScript config for enhanced type safety — Captured during: TypeScript migration completion

---

## Todos

- [x] Migrate backend-node to TypeScript (100% complete - 15/15 requisitos)
- [ ] Implement RF01 - User authentication with JWT in Node.js service
- [ ] Implement RF02 - Event catalog with role-based access control
- [ ] Implement RF03 - Async order processing via RabbitMQ
- [x] Migrate Spring Boot backend from H2 to MySQL (pom.xml, application.properties, RabbitMQ config — Tasks 1–3)
- [ ] Implement Spring Boot Event/Order entities and RabbitMQ consumer (Tasks 4–17)
- [ ] Update frontend React to consume TicketFlow APIs instead of CRUD APIs
- [ ] Add integration tests for RabbitMQ communication
- [ ] Add E2E tests for complete purchase flow
