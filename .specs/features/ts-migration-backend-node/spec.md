# Migração TypeScript — backend-node

## Problem Statement

O serviço `backend-node` (Auth/Gateway) está escrito em JavaScript puro com
`require`/`module.exports`. Sem tipos, erros de runtime são descobertos tarde,
o suporte de IDE é limitado e refatorações são arriscadas. A migração para
TypeScript adiciona verificação estática em compile-time, contratos explícitos
entre módulos e melhor experiência de desenvolvimento.

## Goals

- [ ] Todos os arquivos `.js` de `src/` e `scripts/` convertidos para `.ts`
- [ ] `npm run dev` inicia o servidor via `tsx + nodemon` sem erros de compilação
- [ ] `npm run build` gera `dist/` com JS compilado sem erros TypeScript
- [ ] Todos os endpoints existentes continuam funcionando com comportamento idêntico
- [ ] `AuthRequest` estende `express.Request` com `user: JWTPayload` tipado
- [ ] `npm test` executa suites Jest sem falhas (unit + integração)
- [ ] `npm run test:coverage` gera relatório de cobertura em `coverage/`

## Out of Scope

| Feature | Reason |
|---|---|
| Migrar frontend React para TypeScript | Feature separada (já registrada em Deferred Ideas) |
| Ativar `strict: true` completo | Pode ser habilitado progressivamente em feature futura |
| Mudar runtime de produção (Bun/Deno) | Fora do objetivo desta migração |
| Refatorar lógica de negócio existente | Migração pura: mesma lógica, só tipos adicionados |

---

## User Stories

### P1: Configuração do toolchain TypeScript ⭐ MVP

**User Story:** Como desenvolvedor, quero TypeScript configurado no projeto com scripts de dev e build funcionando, para que eu possa escrever e executar código `.ts` imediatamente.

**Why P1:** É o pré-requisito de todas as demais histórias.

**Acceptance Criteria:**

1. WHEN `package.json` é atualizado THEN SHALL conter `typescript`, `tsx`, e `@types/{node,express,bcrypt,jsonwebtoken,cors,amqplib}` em `devDependencies`
2. WHEN `tsconfig.json` é criado THEN SHALL ter `target: ES2020`, `module: commonjs`, `rootDir: ./src`, `outDir: ./dist`, `esModuleInterop: true`, `strict: false`
3. WHEN `npm run build` é executado THEN SHALL gerar `dist/` sem erros TypeScript
4. WHEN `npm run dev` é executado THEN SHALL iniciar servidor com `nodemon --exec tsx src/server.ts`
5. WHEN `npm start` é executado THEN SHALL iniciar com `node dist/server.js` (output compilado)

**Independent Test:** `npm run build` retorna exit code 0 e o diretório `dist/` é criado.

---

### P1: Tipos compartilhados e extensão do Express ⭐ MVP

**User Story:** Como desenvolvedor, quero tipos centralizados (interfaces e enums) e `req.user` tipado via extensão do `Request`, para que controllers e middleware compilem sem `any`.

**Why P1:** Sem os tipos base, os demais arquivos `.ts` não compilam corretamente.

**Acceptance Criteria:**

1. WHEN `src/types/index.ts` é criado THEN SHALL exportar `JWTPayload` com `{ id: number; email: string; role: string }`
2. WHEN `src/types/express/index.d.ts` é criado THEN SHALL declarar `namespace Express` estendendo `Request` com `user?: JWTPayload`
3. WHEN `tsconfig.json` inclui `typeRoots` ou `paths` apontando para `src/types` THEN o compilador SHALL reconhecer `req.user` como `JWTPayload` sem cast explícito nos controllers
4. WHEN `UserRole` é definido como union type `'ADMIN' | 'CLIENTE'` THEN SHALL ser usado nos models e controllers

**Independent Test:** Um controller que acessa `req.user.id` compila sem erro com `tsc --noEmit`.

---

### P1: Migrar utils, configs e models ⭐ MVP

**User Story:** Como desenvolvedor, quero os módulos de infraestrutura (erros, banco, RabbitMQ, models) em TypeScript, para que o servidor tenha uma base tipada.

**Why P1:** São dependências dos controllers e middleware — devem ser migrados primeiro.

**Acceptance Criteria:**

1. WHEN `src/utils/errors.ts` é criado THEN SHALL manter `AppError`, `ErrorCodes` e `sendErrorResponse` com tipos explícitos; `AppError.statusCode` SHALL ser `number`, `AppError.code` SHALL ser `string`
2. WHEN `src/config/database.ts` é criado THEN SHALL exportar `pool` tipado como `mysql2.Pool`
3. WHEN `src/config/rabbitmq.ts` é criado THEN SHALL exportar `connectRabbitMQ(): Promise<amqp.Channel>`, `getChannel(): amqp.Channel` e `closeConnection(): Promise<void>`
4. WHEN `src/models/User.ts`, `Event.ts`, `Order.ts` são criados THEN SHALL definir interfaces `IUser`, `IEvent`, `IOrder` e os métodos estáticos SHALL ter assinatura tipada com retornos corretos (ex: `findByEmail(email: string): Promise<IUser | undefined>`)
5. WHEN arquivos JS originais são removidos THEN `tsc` SHALL compilar sem erros

**Independent Test:** `tsc --noEmit` passa sem erros após migrar esses módulos.

---

### P1: Migrar middleware, controllers e routes ⭐ MVP

**User Story:** Como desenvolvedor, quero middleware, controllers e rotas em TypeScript com `Request`/`Response`/`NextFunction` tipados, para que a camada de HTTP seja completamente type-safe.

**Why P1:** Completa a migração do caminho de request end-to-end.

**Acceptance Criteria:**

1. WHEN `src/middleware/auth.ts` é criado THEN `authenticateToken` SHALL usar `Request, Response, NextFunction` do Express; `req.user` SHALL ser atribuído como `JWTPayload`
2. WHEN `src/controllers/authController.ts`, `eventController.ts`, `orderController.ts` são criados THEN cada função SHALL ter assinatura `(req: Request, res: Response, next: NextFunction) => Promise<void>`
3. WHEN `src/routes/authRoutes.ts`, `eventRoutes.ts`, `orderRoutes.ts` são criados THEN SHALL usar `express.Router()` tipado e importar controllers/middleware como módulos TS
4. WHEN `src/server.ts` é criado THEN SHALL manter toda a lógica do `server.js` original com tipos corretos no error handler `(err: Error, req: Request, res: Response, next: NextFunction) => void`
5. WHEN todos os arquivos `.js` de `src/` são removidos THEN `npm run build` SHALL compilar sem erros

**Independent Test:** `curl http://localhost:3001/health` retorna `{"status":"ok"|"degraded","mysql":...,"rabbitmq":...}` após `npm run dev`.

---

### P2: Atualizar Dockerfile para build TypeScript

**User Story:** Como desenvolvedor, quero que o Dockerfile compile o TypeScript e execute o `dist/` em produção, para que o container Docker funcione corretamente após a migração.

**Why P2:** Necessário para deploy em Docker, mas não bloqueia desenvolvimento local.

**Acceptance Criteria:**

1. WHEN o Dockerfile é atualizado THEN SHALL ter estágio de build com `npm run build` gerando `dist/`
2. WHEN a imagem Docker é iniciada THEN `CMD` SHALL executar `node dist/server.js`
3. WHEN `docker-compose up backend-node` é executado THEN o container SHALL iniciar sem erros

**Independent Test:** `docker build -t backend-node-ts .` conclui sem erros.

---

### P2: Migrar scripts/seed.ts

**User Story:** Como desenvolvedor, quero o script de seed em TypeScript, para que toda a base de código seja homogeneamente TypeScript.

**Why P2:** Consistência, mas não bloqueia o servidor principal.

**Acceptance Criteria:**

1. WHEN `scripts/seed.ts` é criado THEN SHALL manter lógica idêntica ao `seed.js` com tipos explícitos (`adminUser` tipado como objeto, `result` tipado como `mysql2.ResultSetHeader`)
2. WHEN `npm run seed` é executado THEN SHALL rodar `tsx scripts/seed.ts` com sucesso
3. WHEN arquivo `scripts/seed.js` é removido THEN `npm run seed` SHALL continuar funcionando

**Independent Test:** `npm run seed` cria/atualiza o usuário admin sem erros.

---

### P3: Infraestrutura de testes e suites Jest

**User Story:** Como desenvolvedor, quero Jest + ts-jest configurado e suites de teste cobrindo utils, models, middleware, controllers e o endpoint `/health`, para que regressões sejam detectadas automaticamente em CI.

**Why P3:** Depende da migração TypeScript completa (Fases 1–7). Não bloqueia o servidor, mas garante qualidade após a migração.

**Acceptance Criteria:**

1. WHEN `jest.config.ts` é criado THEN SHALL usar `preset: 'ts-jest'`, `testEnvironment: 'node'`, `roots: ['<rootDir>/src']`, `testMatch: ['**/__tests__/**/*.test.ts']`
2. WHEN `npm test` é executado THEN SHALL rodar todas as suites sem falhas (exit 0)
3. WHEN `npm run test:coverage` é executado THEN SHALL gerar `coverage/` com relatório HTML/LCOV
4. WHEN `AppError` é construído com `('msg', 400, 'INVALID')` THEN `instanceOf AppError === true`, `statusCode === 400`, `isOperational === true`
5. WHEN `authenticateToken` recebe request sem header `Authorization` THEN SHALL lançar `AppError` com código `TOKEN_REQUIRED`
6. WHEN `authenticateToken` recebe token JWT válido THEN SHALL chamar `next()` e popular `req.user` com `JWTPayload`
7. WHEN `requireRole('ADMIN')` é chamado e `req.user.role === 'CLIENTE'` THEN SHALL lançar `AppError` com código `INSUFFICIENT_PERMISSIONS`
8. WHEN `GET /health` é chamado via Supertest THEN resposta SHALL ter `status` HTTP 200 ou 503, body com campos `status`, `mysql`, `rabbitmq`

**Independent Test:** `npm test -- --passWithNoTests` retorna exit 0 com cobertura gerada.

---

## Edge Cases

- WHEN `dist/` já existe de build anterior THEN `tsc` SHALL sobrescrever sem conflito
- WHEN `getChannel()` retorna `null` (RabbitMQ não conectado) THEN o tipo `amqp.Channel` não deve permitir acesso sem checagem — SHALL lançar `Error` antes de uso
- WHEN `req.user` é acessado em rota não protegida THEN TypeScript SHALL apontar que `user` é opcional (`user?: JWTPayload`), evitando NPE silencioso
- WHEN `mysql2` retorna `RowDataPacket[]` THEN os models SHALL fazer cast para a interface correta (ex: `rows[0] as IUser`)
- WHEN `process.env.JWT_SECRET` é `undefined` THEN TypeScript SHALL não impedir (é `string | undefined`), mas o código SHALL manter o fallback existente

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| TSMIG-01 | P1: Toolchain TypeScript | Design | Pending |
| TSMIG-02 | P1: Tipos compartilhados | Design | Pending |
| TSMIG-03 | P1: utils/errors.ts | Tasks | Pending |
| TSMIG-04 | P1: config/database.ts | Tasks | Pending |
| TSMIG-05 | P1: config/rabbitmq.ts | Tasks | Pending |
| TSMIG-06 | P1: models/*.ts | Tasks | Pending |
| TSMIG-07 | P1: middleware/auth.ts | Tasks | Pending |
| TSMIG-08 | P1: controllers/*.ts | Tasks | Pending |
| TSMIG-09 | P1: routes/*.ts | Tasks | Pending |
| TSMIG-10 | P1: server.ts | Tasks | Pending |
| TSMIG-11 | P2: Dockerfile | Tasks | Pending |
| TSMIG-12 | P2: scripts/seed.ts | Tasks | Pending |
| TSMIG-13 | P3: Jest + ts-jest infrastructure | Tasks | Pending |
| TSMIG-14 | P3: Unit test suites (utils/models/middleware/controllers) | Tasks | Pending |
| TSMIG-15 | P3: Integration test — GET /health (Supertest) | Tasks | Pending |

**Coverage:** 15 total, 15 mapeados para tasks (ver `tasks.md`), 0 unmapped ✅

---

## Success Criteria

- [ ] `npm run build` retorna exit 0 sem erros TypeScript
- [ ] `npm run dev` inicia o servidor corretamente com `tsx + nodemon`
- [ ] `GET /health`, `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/events` retornam as mesmas respostas de antes da migração
- [ ] Nenhum arquivo `.js` permanece em `src/` (apenas `dist/` gerado)
- [ ] `scripts/seed.ts` executa via `npm run seed` sem erros
- [ ] Dockerfile compila e gera container funcional
- [ ] `npm test` retorna exit 0 (todas as suites passando)
- [ ] `npm run test:coverage` gera `coverage/` sem erro
