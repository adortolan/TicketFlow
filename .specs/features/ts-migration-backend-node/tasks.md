# Migração TypeScript — backend-node: Tasks

**Spec**: `.specs/features/ts-migration-backend-node/spec.md`
**Status**: Draft

---

## Contexto de Testes

O `backend-node` adota **Jest + ts-jest** (instalado em T20) com testes co-localizados em `src/**/__tests__/` e integração HTTP via **Supertest** no endpoint `/health`.

| Gate Level | Comando | Quando Usar |
|---|---|---|
| build | `cd backend-node && npx tsc --noEmit` | Após cada task (type check sem emitir) |
| full-build | `cd backend-node && npm run build` | Ao final de cada fase |
| test | `cd backend-node && npm test` | Após tasks com arquivos `*.test.ts` co-localizados |
| coverage | `cd backend-node && npm run test:coverage` | Ao final da Fase 8 (P3) |

Pré-requisito: T20 deve ser concluída antes de qualquer task que escreva arquivos de teste.

---

## Mapa de Imports (referência para dependências)

| Arquivo | Importa de |
|---|---|
| `errors.ts` | — (standalone) |
| `database.ts` | — (standalone) |
| `rabbitmq.ts` | — (standalone) |
| `models/User.ts` | `config/database` |
| `models/Event.ts` | `config/database` |
| `models/Order.ts` | `config/database` |
| `middleware/auth.ts` | `utils/errors`, `src/types` |
| `controllers/authController.ts` | `models/User`, `config/rabbitmq`, `utils/errors` |
| `controllers/eventController.ts` | `models/Event`, `middleware/auth`, `utils/errors` |
| `controllers/orderController.ts` | `models/Order`, `models/Event`, `config/rabbitmq`, `utils/errors` |
| `routes/authRoutes.ts` | `controllers/authController`, `middleware/auth` |
| `routes/eventRoutes.ts` | `controllers/eventController`, `middleware/auth` |
| `routes/orderRoutes.ts` | `controllers/orderController`, `middleware/auth` |
| `server.ts` | todas as rotas, `config/database`, `config/rabbitmq`, `utils/errors` |
| `scripts/seed.ts` | `config/database` |

---

## Plano de Execução

### Fase 1 — Foundation (Sequencial + Paralelo, 4 tarefas)

```
T01 → T02 → T03
              └→ T20 [P]   (paralelo com T03)
```

> T20 (Jest infra) pode rodar em paralelo com T03 após T02 estar completa.

### Fase 2 — Infra Layer (Paralelo, 3 tarefas)

```
T03 ─┬→ T04 [P]
     ├→ T05 [P]
     └→ T06 [P]
```

### Fase 3 — Models + Middleware (Paralelo, 4 tarefas)

```
T05 ─┬→ T07 [P]
     ├→ T08 [P]
     └→ T09 [P]
T04, T03 → T10 [P]
```
> T07–T09 dependem de T05. T10 depende de T03+T04. Todos podem rodar em paralelo após Fase 2.

### Fase 4 — Controllers (Paralelo, 3 tarefas)

```
T07, T06, T04 → T11 [P]
T08, T10, T04 → T12 [P]  } simultâneos
T09, T08, T06, T04 → T13 [P]
```

### Fase 5 — Routes (Paralelo, 3 tarefas)

```
T11, T10 → T14 [P]
T12, T10 → T15 [P]  } simultâneos
T13, T10 → T16 [P]
```

### Fase 6 — Entry Point (Sequencial, 1 tarefa)

```
T14 + T15 + T16 + T05 + T06 → T17
```

### Fase 7 — P2 Finalization (Paralelo, 2 tarefas)

```
T17 → T19 [P]
T05 → T18 [P]   } simultâneos
```

### Fase 8 — P3 Test Coverage (verificação final)

```
T18 + T19 completas → npm run test:coverage
```

> Os testes já foram escritos co-localizados nas tasks T04, T07–T13, T17. A Fase 8 é apenas o gate de cobertura final.

---

## Task Breakdown

### T01: Instalar dependências TypeScript e atualizar package.json

**What**: Instalar `typescript`, `tsx` e todos os `@types/*` necessários; atualizar scripts `dev`, `build`, `start`, `seed` no `package.json`
**Where**: `backend-node/package.json`
**Depends on**: None
**Reuses**: `package.json` atual como base
**Requirement**: TSMIG-01

**Done when**:

- [ ] `devDependencies` contém: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/cors`, `@types/amqplib`
- [ ] Scripts atualizados:
  - `"start": "node dist/server.js"`
  - `"dev": "nodemon --exec tsx src/server.ts"`
  - `"build": "tsc"`
  - `"seed": "tsx scripts/seed.ts"`
- [ ] `node_modules` atualizado: `ls backend-node/node_modules/typescript` existe
- [ ] `npx tsc --version` retorna versão TypeScript sem erro

**Tests**: none
**Gate**: build (verificar instalação)

**Verify**:
```bash
cd backend-node && npx tsc --version
# Expected: Version 5.x.x
```

**Commit**: `chore(backend-node): install TypeScript deps and update package.json scripts`

---

### T02: Criar tsconfig.json

**What**: Criar `tsconfig.json` com configuração para CommonJS, ES2020, outDir `./dist`, rootDir `./src`
**Where**: `backend-node/tsconfig.json` (novo arquivo)
**Depends on**: T01
**Reuses**: nenhum arquivo existente
**Requirement**: TSMIG-01

**Done when**:

- [ ] `tsconfig.json` criado com:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": false,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```
- [ ] `backend-node/.gitignore` atualizado com `dist/`
- [ ] `cd backend-node && npx tsc --noEmit` retorna exit 0 (sem arquivos .ts ainda, deve passar ou mostrar "no files found" sem erro fatal)

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && cat tsconfig.json
cd backend-node && cat .gitignore | grep dist
```

**Commit**: `chore(backend-node): add tsconfig.json and add dist/ to .gitignore`

---

### T03: Criar tipos compartilhados e extensão do Express Request

**What**: Criar `src/types/index.ts` com `JWTPayload` e `UserRole`; criar `src/types/express/index.d.ts` estendendo `Express.Request` com `user?: JWTPayload`
**Where**:
- `backend-node/src/types/index.ts` (novo)
- `backend-node/src/types/express/index.d.ts` (novo)
**Depends on**: T02
**Reuses**: nenhum arquivo existente
**Requirement**: TSMIG-02

**Done when**:

- [ ] `src/types/index.ts` exporta:
  ```typescript
  export type UserRole = 'ADMIN' | 'CLIENTE';

  export interface JWTPayload {
    id: number;
    email: string;
    role: UserRole;
  }
  ```
- [ ] `src/types/express/index.d.ts` contém:
  ```typescript
  import { JWTPayload } from '../index';

  declare global {
    namespace Express {
      interface Request {
        user?: JWTPayload;
      }
    }
  }

  export {};
  ```
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros com os dois arquivos compilando corretamente

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
# Expected: exit 0, sem erros
```

**Commit**: `chore(backend-node): add shared TypeScript types and extend Express Request`

---

### T20: Configurar infraestrutura de testes Jest + ts-jest + Supertest [P]

> Pode ser executado em paralelo com T03 após T02

**What**: Instalar `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`; criar `jest.config.ts`; atualizar scripts `test`, `test:watch`, `test:coverage` no `package.json`; adicionar `coverage/` ao `.gitignore`
**Where**: `backend-node/jest.config.ts` (novo), `backend-node/package.json`, `backend-node/.gitignore`
**Depends on**: T01 (TypeScript instalado), T02 (tsconfig.json existente)
**Reuses**: `package.json` e `tsconfig.json` criados em T01/T02
**Requirement**: TSMIG-13

**Done when**:

- [ ] `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest` adicionados a `devDependencies`
- [ ] `jest.config.ts` criado com:
  ```typescript
  export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/types/**',
      '!src/**/__tests__/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
  };
  ```
- [ ] `package.json` com scripts atualizados:
  - `"test": "jest"`
  - `"test:watch": "jest --watch"`
  - `"test:coverage": "jest --coverage"`
- [ ] `coverage/` adicionado ao `.gitignore`
- [ ] `cd backend-node && npx jest --version` retorna versão sem erro

**Tests**: none (esta task cria a infraestrutura de testes)
**Gate**: build

**Verify**:
```bash
cd backend-node && npx jest --version
# Expected: 29.x.x
cd backend-node && npm test -- --passWithNoTests
# Expected: exit 0 (sem suites ainda, mas jest funciona)
```

**Commit**: `chore(backend-node): setup Jest + ts-jest + Supertest test infrastructure`

---

### T04: Migrar src/utils/errors.js → errors.ts [P]

**What**: Converter `errors.js` para TypeScript com tipos explícitos em `AppError`, `ErrorCodes` e `sendErrorResponse`; remover `errors.js`; criar suite de testes unitários co-localizada
**Where**:
- `backend-node/src/utils/errors.ts` (novo) — remover `errors.js`
- `backend-node/src/utils/__tests__/errors.test.ts` (novo)
**Depends on**: T02 (tsconfig), T01 (TypeScript instalado), T20 (jest infra)
**Reuses**: `src/utils/errors.js` como referência de lógica
**Requirement**: TSMIG-03, TSMIG-14

**Done when**:

- [ ] `errors.ts` criado com:
  - `ErrorCodes` tipado como `const` object com `as const`
  - `AppError extends Error` com `statusCode: number`, `code: string`, `isOperational: boolean`
  - `sendErrorResponse(res: Response, error: unknown): void` importando `Response` de `express`
- [ ] `errors.js` removido
- [ ] `src/utils/__tests__/errors.test.ts` criado com:
  - `AppError` instanciada com `('Not found', 404, 'NOT_FOUND')` → `instanceOf AppError`, `statusCode===404`, `code==='NOT_FOUND'`, `isOperational===true`
  - `AppError` herda de `Error` → `instanceOf Error === true`, `message === 'Not found'`
  - `ErrorCodes.TOKEN_REQUIRED === 'TOKEN_REQUIRED'` e `ErrorCodes.INVALID_CREDENTIALS === 'INVALID_CREDENTIALS'`
  - `sendErrorResponse` com mock de `res` → `AppError` chama `res.status(statusCode).json(...)` com `error` e `code`
  - `sendErrorResponse` com `Error` genérico → chama `res.status(500).json(...)` com `INTERNAL_SERVER_ERROR`
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test` passa (suite errors)

**Tests**: `src/utils/__tests__/errors.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
# Expected: exit 0
cd backend-node && npm test -- --testPathPattern=errors
# Expected: PASS src/utils/__tests__/errors.test.ts
ls backend-node/src/utils/
# Expected: errors.ts __tests__/ (sem errors.js)
```

**Commit**: `chore(backend-node): migrate utils/errors.js to TypeScript with unit tests`

---

### T05: Migrar src/config/database.js → database.ts [P]

**What**: Converter `database.js` para TypeScript exportando `pool` tipado como `mysql2.Pool`; remover `database.js`
**Where**: `backend-node/src/config/database.ts` (novo) — remover `database.js`
**Depends on**: T02, T01
**Reuses**: `src/config/database.js` como referência
**Requirement**: TSMIG-04

**Done when**:

- [ ] `database.ts` criado: importa de `mysql2/promise`, pool tipado como `Pool`, exporta como default
- [ ] `database.js` removido
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
ls backend-node/src/config/
# Expected: database.ts rabbitmq.js (rabbitmq ainda não migrado)
```

**Commit**: `chore(backend-node): migrate config/database.js to TypeScript`

---

### T06: Migrar src/config/rabbitmq.js → rabbitmq.ts [P]

**What**: Converter `rabbitmq.js` para TypeScript com assinaturas explícitas para `connectRabbitMQ`, `getChannel` e `closeConnection`; remover `rabbitmq.js`
**Where**: `backend-node/src/config/rabbitmq.ts` (novo) — remover `rabbitmq.js`
**Depends on**: T02, T01
**Reuses**: `src/config/rabbitmq.js` como referência
**Requirement**: TSMIG-05

**Done when**:

- [ ] `rabbitmq.ts` criado com:
  - `connection: amqp.Connection | null` e `channel: amqp.Channel | null` como variáveis de módulo
  - `connectRabbitMQ(): Promise<amqp.Channel>` com retorno tipado
  - `getChannel(): amqp.Channel` — lança `Error` se `channel` for null (mesmo comportamento original)
  - `closeConnection(): Promise<void>`
- [ ] `rabbitmq.js` removido
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
```

**Commit**: `chore(backend-node): migrate config/rabbitmq.js to TypeScript`

---

### T07: Migrar src/models/User.js → User.ts [P]

**What**: Converter `User.js` para TypeScript com interface `IUser`, `IUserCreate` e métodos estáticos tipados; remover `User.js`; criar suite de testes com DB mockado
**Where**:
- `backend-node/src/models/User.ts` (novo) — remover `User.js`
- `backend-node/src/models/__tests__/User.test.ts` (novo)
**Depends on**: T05 (database.ts), T20 (jest infra)
**Reuses**: `src/models/User.js` como referência
**Requirement**: TSMIG-06, TSMIG-14

**Done when**:

- [ ] `User.ts` criado com:
  ```typescript
  export interface IUser {
    id: number;
    name: string;
    email: string;
    cpf: string;
    role: UserRole;
    password: string;
    created_at: Date;
  }

  export interface IUserCreate {
    name: string;
    email: string;
    password: string;
    cpf: string;
    role?: UserRole;
  }
  ```
  - `create(data: IUserCreate): Promise<number>`
  - `findByEmail(email: string): Promise<IUser | undefined>`
  - `findByCpf(cpf: string): Promise<IUser | undefined>`
  - `findById(id: number): Promise<Omit<IUser, 'password'> | undefined>`
  - `findAll(): Promise<Omit<IUser, 'password'>[]>`
- [ ] `UserRole` importado de `src/types`
- [ ] `User.js` removido
- [ ] `src/models/__tests__/User.test.ts` criado com `jest.mock('../../config/database')` e cenários:
  - `User.findByEmail('test@test.com')` → retorna `IUser` quando DB retorna linha
  - `User.findByEmail('unknown@test.com')` → retorna `undefined` quando DB retorna `[]`
  - `User.findByCpf('12345678901')` → retorna `IUser | undefined` equivalente
  - `User.findById(1)` → retorna objeto sem campo `password`
  - `User.findAll()` → retorna array de usuários sem `password`
  - `User.create(data)` → retorna `insertId` numérico do `ResultSetHeader` mockado
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=User` passa

**Tests**: `src/models/__tests__/User.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=models/User
# Expected: PASS src/models/__tests__/User.test.ts
```

**Commit**: `chore(backend-node): migrate models/User.js to TypeScript with unit tests`

---

### T08: Migrar src/models/Event.js → Event.ts [P]

**What**: Converter `Event.js` para TypeScript com interface `IEvent`, `IEventCreate` e métodos estáticos tipados; remover `Event.js`; criar suite de testes com DB mockado
**Where**:
- `backend-node/src/models/Event.ts` (novo) — remover `Event.js`
- `backend-node/src/models/__tests__/Event.test.ts` (novo)
**Depends on**: T05 (database.ts), T20 (jest infra)
**Reuses**: `src/models/Event.js` como referência
**Requirement**: TSMIG-06, TSMIG-14

**Done when**:

- [ ] `Event.ts` criado com:
  ```typescript
  export interface IEvent {
    id: number;
    name: string;
    date: Date;
    location: string;
    price: number;
    available_tickets: number;
    created_by: number;
  }

  export interface IEventCreate {
    name: string;
    date: string;
    location: string;
    price: number;
    available_tickets: number;
    created_by: number;
  }
  ```
  - `create(data: IEventCreate): Promise<number>`
  - `findAll(): Promise<IEvent[]>`
  - `findById(id: number): Promise<IEvent | undefined>`
  - `updateAvailableTickets(id: number, quantity: number): Promise<boolean>`
- [ ] `Event.js` removido
- [ ] `src/models/__tests__/Event.test.ts` criado com `jest.mock('../../config/database')` e cenários:
  - `Event.findAll()` → retorna array de `IEvent`
  - `Event.findById(1)` → retorna `IEvent` quando encontrado
  - `Event.findById(999)` → retorna `undefined` quando não encontrado
  - `Event.create(data)` → retorna `insertId` numérico
  - `Event.updateAvailableTickets(1, -2)` → retorna `true` quando `affectedRows > 0`
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=models/Event` passa

**Tests**: `src/models/__tests__/Event.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=models/Event
# Expected: PASS src/models/__tests__/Event.test.ts
```

**Commit**: `chore(backend-node): migrate models/Event.js to TypeScript with unit tests`

---

### T09: Migrar src/models/Order.js → Order.ts [P]

**What**: Converter `Order.js` para TypeScript com interface `IOrder`, `IOrderCreate` e métodos estáticos tipados; remover `Order.js`; criar suite de testes com DB mockado
**Where**:
- `backend-node/src/models/Order.ts` (novo) — remover `Order.js`
- `backend-node/src/models/__tests__/Order.test.ts` (novo)
**Depends on**: T05 (database.ts), T20 (jest infra)
**Reuses**: `src/models/Order.js` como referência
**Requirement**: TSMIG-06, TSMIG-14

**Done when**:

- [ ] `Order.ts` criado com:
  ```typescript
  export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

  export interface IOrder {
    id: number;
    user_id: number;
    event_id: number;
    quantity: number;
    total_price: number;
    status: OrderStatus;
    created_at: Date;
  }

  export interface IOrderCreate {
    user_id: number;
    event_id: number;
    quantity: number;
    total_price: number;
    status?: OrderStatus;
  }
  ```
  - `create(data: IOrderCreate): Promise<number>`
  - `findById(id: number): Promise<IOrder | undefined>`
  - `findByUserId(user_id: number): Promise<IOrder[]>`
  - `updateStatus(id: number, status: OrderStatus): Promise<boolean>`
- [ ] `Order.js` removido
- [ ] `src/models/__tests__/Order.test.ts` criado com `jest.mock('../../config/database')` e cenários:
  - `Order.create(data)` → retorna `insertId` numérico
  - `Order.findById(1)` → retorna `IOrder` quando encontrado
  - `Order.findById(999)` → retorna `undefined`
  - `Order.findByUserId(1)` → retorna array de `IOrder`
  - `Order.updateStatus(1, 'COMPLETED')` → retorna `true` quando `affectedRows > 0`
  - `Order.updateStatus(999, 'COMPLETED')` → retorna `false` quando `affectedRows === 0`
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=models/Order` passa

**Tests**: `src/models/__tests__/Order.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=models/Order
# Expected: PASS src/models/__tests__/Order.test.ts
```

**Commit**: `chore(backend-node): migrate models/Order.js to TypeScript with unit tests`

---

### T10: Migrar src/middleware/auth.js → auth.ts [P]

**What**: Converter `auth.js` para TypeScript com `Request`, `Response`, `NextFunction` tipados; `req.user` atribuído como `JWTPayload`; remover `auth.js`; criar suite de testes do middleware
**Where**:
- `backend-node/src/middleware/auth.ts` (novo) — remover `auth.js`
- `backend-node/src/middleware/__tests__/auth.test.ts` (novo)
**Depends on**: T03 (JWTPayload type), T04 (AppError, ErrorCodes), T20 (jest infra)
**Reuses**: `src/middleware/auth.js` como referência
**Requirement**: TSMIG-07, TSMIG-14

**Done when**:

- [ ] `auth.ts` criado com:
  - `authenticateToken(req: Request, res: Response, next: NextFunction): void` — `req.user` atribuído como `JWTPayload`
  - `requireRole(role: UserRole): (req: Request, res: Response, next: NextFunction) => void`
  - `UserRole` importado de `src/types`
- [ ] `auth.js` removido
- [ ] `src/middleware/__tests__/auth.test.ts` criado com `jest.mock('jsonwebtoken')` e cenários:
  - `authenticateToken` sem header `Authorization` → lança `AppError` com `code === TOKEN_REQUIRED`
  - `authenticateToken` com `Bearer <token>` válido (jwt.verify mocka sucesso com payload) → chama `next()` e popula `req.user`
  - `authenticateToken` com token inválido (jwt.verify mocka erro) → lança `AppError` com `code === INVALID_TOKEN`
  - `requireRole('ADMIN')` com `req.user.role === 'ADMIN'` → chama `next()`
  - `requireRole('ADMIN')` com `req.user.role === 'CLIENTE'` → lança `AppError` com `code === INSUFFICIENT_PERMISSIONS`
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros (T03 + T04 + T10 compilam juntos)
- [ ] `cd backend-node && npm test -- --testPathPattern=middleware/auth` passa

**Tests**: `src/middleware/__tests__/auth.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=middleware/auth
# Expected: PASS src/middleware/__tests__/auth.test.ts
```

**Commit**: `chore(backend-node): migrate middleware/auth.js to TypeScript with unit tests`

---

### T11: Migrar src/controllers/authController.js → authController.ts [P]

**What**: Converter `authController.js` para TypeScript com funções `register`, `login`, `getProfile` tipadas com `Request`, `Response`, `NextFunction`; remover `authController.js`; criar suite de testes unitários
**Where**:
- `backend-node/src/controllers/authController.ts` (novo) — remover `authController.js`
- `backend-node/src/controllers/__tests__/authController.test.ts` (novo)
**Depends on**: T07 (User.ts), T06 (rabbitmq.ts), T04 (errors.ts), T20 (jest infra)
**Reuses**: `src/controllers/authController.js` como referência
**Requirement**: TSMIG-08, TSMIG-14

**Done when**:

- [ ] `authController.ts` criado com:
  - `register(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `login(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `getProfile(req: Request, res: Response, next: NextFunction): Promise<void>`
  - Toda a lógica original preservada (validação campos, `findByEmail`, `findByCpf`, bcrypt hash, JWT sign, RabbitMQ publish)
- [ ] `authController.js` removido
- [ ] `src/controllers/__tests__/authController.test.ts` criado com `jest.mock('../models/User')`, `jest.mock('bcrypt')`, `jest.mock('jsonwebtoken')`, `jest.mock('../config/rabbitmq')` e cenários:
  - `register` → 201 com `{ userId }` quando campos válidos e email/CPF não cadastrados
  - `register` → chama `next(AppError)` com `EMAIL_ALREADY_REGISTERED` quando email já existe
  - `login` → 200 com `{ token, user }` quando credenciais válidas
  - `login` → chama `next(AppError)` com `INVALID_CREDENTIALS` quando senha incorreta
  - `login` → chama `next(AppError)` com `INVALID_CREDENTIALS` quando usuário não encontrado
  - `getProfile` → 200 com dados do usuário (mock `User.findById`)
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=authController` passa

**Tests**: `src/controllers/__tests__/authController.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=authController
# Expected: PASS src/controllers/__tests__/authController.test.ts
```

**Commit**: `chore(backend-node): migrate controllers/authController.js to TypeScript with unit tests`

---

### T12: Migrar src/controllers/eventController.js → eventController.ts [P]

**What**: Converter `eventController.js` para TypeScript com funções `getAllEvents`, `getEventById`, `createEvent` tipadas; remover `eventController.js`; criar suite de testes unitários
**Where**:
- `backend-node/src/controllers/eventController.ts` (novo) — remover `eventController.js`
- `backend-node/src/controllers/__tests__/eventController.test.ts` (novo)
**Depends on**: T08 (Event.ts), T10 (auth.ts), T04 (errors.ts), T20 (jest infra)
**Reuses**: `src/controllers/eventController.js` como referência
**Requirement**: TSMIG-08, TSMIG-14

**Done when**:

- [ ] `eventController.ts` criado com:
  - `getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `getEventById(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `createEvent(req: Request, res: Response, next: NextFunction): Promise<void>`
  - Import de `authenticateToken, requireRole` de `../middleware/auth` preservado (consistente com original)
- [ ] `eventController.js` removido
- [ ] `src/controllers/__tests__/eventController.test.ts` criado com `jest.mock('../models/Event')` e cenários:
  - `getAllEvents` → 200 com array de `IEvent` (mock `Event.findAll`)
  - `getEventById` → 200 com `IEvent` quando evento existe (mock `Event.findById`)
  - `getEventById` → chama `next(AppError)` com `EVENT_NOT_FOUND` quando não existe
  - `createEvent` → 201 com `{ eventId }` quando dados válidos (mock `Event.create`)
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=eventController` passa

**Tests**: `src/controllers/__tests__/eventController.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=eventController
# Expected: PASS src/controllers/__tests__/eventController.test.ts
```

**Commit**: `chore(backend-node): migrate controllers/eventController.js to TypeScript with unit tests`

---

### T13: Migrar src/controllers/orderController.js → orderController.ts [P]

**What**: Converter `orderController.js` para TypeScript com funções `createOrder`, `getOrderById`, `getUserOrders` tipadas; remover `orderController.js`; criar suite de testes unitários
**Where**:
- `backend-node/src/controllers/orderController.ts` (novo) — remover `orderController.js`
- `backend-node/src/controllers/__tests__/orderController.test.ts` (novo)
**Depends on**: T09 (Order.ts), T08 (Event.ts), T06 (rabbitmq.ts), T04 (errors.ts), T20 (jest infra)
**Reuses**: `src/controllers/orderController.js` como referência
**Requirement**: TSMIG-08, TSMIG-14

**Done when**:

- [ ] `orderController.ts` criado com:
  - `createOrder(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `getOrderById(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void>`
  - Toda a lógica original preservada (verificação evento, tickets disponíveis, cálculo total, RabbitMQ)
- [ ] `orderController.js` removido
- [ ] `src/controllers/__tests__/orderController.test.ts` criado com `jest.mock('../models/Order')`, `jest.mock('../models/Event')`, `jest.mock('../config/rabbitmq')` e cenários:
  - `createOrder` → 201 com `{ orderId }` quando evento existe e tickets disponíveis
  - `createOrder` → chama `next(AppError)` com `EVENT_NOT_FOUND` quando evento não existe
  - `createOrder` → chama `next(AppError)` quando `available_tickets < quantity`
  - `getOrderById` → 200 com `IOrder` quando pedido existe
  - `getOrderById` → chama `next(AppError)` com `ORDER_NOT_FOUND` quando não existe
  - `getUserOrders` → 200 com array de `IOrder` (mock `Order.findByUserId`)
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros
- [ ] `cd backend-node && npm test -- --testPathPattern=orderController` passa

**Tests**: `src/controllers/__tests__/orderController.test.ts`
**Gate**: build + test

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
cd backend-node && npm test -- --testPathPattern=orderController
# Expected: PASS src/controllers/__tests__/orderController.test.ts
```

**Commit**: `chore(backend-node): migrate controllers/orderController.js to TypeScript with unit tests`

---

### T14: Migrar src/routes/authRoutes.js → authRoutes.ts [P]

**What**: Converter `authRoutes.js` para TypeScript com `express.Router()` tipado e imports de controllers/middleware como módulos TS; remover `authRoutes.js`
**Where**: `backend-node/src/routes/authRoutes.ts` (novo) — remover `authRoutes.js`
**Depends on**: T11 (authController.ts), T10 (auth.ts)
**Reuses**: `src/routes/authRoutes.js` como referência
**Requirement**: TSMIG-09

**Done when**:

- [ ] `authRoutes.ts` criado com `Router` tipado, validações `body()` do `express-validator`, rotas `POST /register`, `POST /login`, `GET /profile`
- [ ] `authRoutes.js` removido
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
```

**Commit**: `chore(backend-node): migrate routes/authRoutes.js to TypeScript`

---

### T15: Migrar src/routes/eventRoutes.js → eventRoutes.ts [P]

**What**: Converter `eventRoutes.js` para TypeScript com `express.Router()` tipado; remover `eventRoutes.js`
**Where**: `backend-node/src/routes/eventRoutes.ts` (novo) — remover `eventRoutes.js`
**Depends on**: T12 (eventController.ts), T10 (auth.ts)
**Reuses**: `src/routes/eventRoutes.js` como referência
**Requirement**: TSMIG-09

**Done when**:

- [ ] `eventRoutes.ts` criado com: `GET /`, `GET /:id`, `POST /` (com `authenticateToken`, `requireRole('ADMIN')`, validações `body()`)
- [ ] `eventRoutes.js` removido
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
```

**Commit**: `chore(backend-node): migrate routes/eventRoutes.js to TypeScript`

---

### T16: Migrar src/routes/orderRoutes.js → orderRoutes.ts [P]

**What**: Converter `orderRoutes.js` para TypeScript com `express.Router()` tipado; remover `orderRoutes.js`
**Where**: `backend-node/src/routes/orderRoutes.ts` (novo) — remover `orderRoutes.js`
**Depends on**: T13 (orderController.ts), T10 (auth.ts)
**Reuses**: `src/routes/orderRoutes.js` como referência
**Requirement**: TSMIG-09

**Done when**:

- [ ] `orderRoutes.ts` criado com: `POST /` (com `authenticateToken`, validações), `GET /:id` (com `authenticateToken`), `GET /user/orders` (com `authenticateToken`)
- [ ] `orderRoutes.js` removido
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros

**Tests**: none
**Gate**: build

**Verify**:
```bash
cd backend-node && npx tsc --noEmit
```

**Commit**: `chore(backend-node): migrate routes/orderRoutes.js to TypeScript`

---

### T17: Migrar src/server.js → server.ts

**What**: Converter `server.js` para TypeScript com error handler tipado `(err: Error, req: Request, res: Response, next: NextFunction) => void`; remover `server.js`; verificar build completo; criar teste de integração Supertest para `/health`
**Where**:
- `backend-node/src/server.ts` (novo) — remover `server.js`
- `backend-node/src/__tests__/health.test.ts` (novo)
**Depends on**: T14, T15, T16, T05 (database.ts), T06 (rabbitmq.ts), T04 (errors.ts), T20 (jest infra)
**Reuses**: `src/server.js` como referência
**Requirement**: TSMIG-10, TSMIG-15

**Done when**:

- [ ] `server.ts` criado com:
  - `import` style (mas usando `require` com `esModuleInterop` — ou imports TS nativos)
  - Error handler com 4 parâmetros tipados corretamente
  - `startServer()` async com tipagem correta
  - Health check route preservada com lógica idêntica
  - `export default app` para compatibilidade com Supertest
- [ ] `server.js` removido
- [ ] Nenhum arquivo `.js` permanece em `src/` (verificar com `ls`)
- [ ] `cd backend-node && npx tsc --noEmit` passa sem erros (TODOS os arquivos .ts)
- [ ] `cd backend-node && npm run build` gera `dist/` sem erros
- [ ] `src/__tests__/health.test.ts` criado com `jest.mock('../config/database')`, `jest.mock('../config/rabbitmq')` e cenários:
  - `GET /health` via Supertest → `status` HTTP 200 ou 503
  - Response body contém campos `status`, `mysql`, `rabbitmq`
  - `status === 'ok'` quando DB e RabbitMQ mockados como saudáveis
  - `status === 'degraded'` quando DB ou RabbitMQ mockados como com falha
- [ ] `cd backend-node && npm test -- --testPathPattern=health` passa

**Tests**: `src/__tests__/health.test.ts`
**Gate**: full-build + test

**Verify**:
```bash
cd backend-node && npm run build
# Expected: exit 0, diretório dist/ criado
cd backend-node && npm test -- --testPathPattern=health
# Expected: PASS src/__tests__/health.test.ts
ls backend-node/dist/
# Expected: server.js e subdiretórios config/, controllers/, middleware/, models/, routes/, utils/, types/
```

**Commit**: `feat(backend-node): complete TypeScript migration with Supertest health integration test`

---

### T18: Migrar scripts/seed.js → seed.ts [P]

> **P2** — pode ser executado em paralelo com T19 após T17

**What**: Converter `scripts/seed.js` para TypeScript com `adminUser` tipado e `ResultSetHeader` do mysql2; remover `seed.js`
**Where**: `backend-node/scripts/seed.ts` (novo) — remover `scripts/seed.js`
**Depends on**: T05 (database.ts)
**Reuses**: `scripts/seed.js` como referência
**Requirement**: TSMIG-12

**Done when**:

- [ ] `seed.ts` criado com:
  - `adminUser` tipado como objeto inline com campos explícitos
  - `result` desestruturado como `ResultSetHeader` do `mysql2`
  - `existingUsers` tipado como array de `RowDataPacket`
  - Lógica idêntica ao `seed.js` original
- [ ] `seed.js` removido
- [ ] `npm run seed` executa sem erros (requer conexão MySQL ativa)

**Tests**: none
**Gate**: build (verificar que `tsx scripts/seed.ts --dry-run` não lança erro de tipos)

**Verify**:
```bash
# Verificar compilação do seed sem executar
cd backend-node && npx tsx --eval "import('./scripts/seed.ts')" 2>&1 | head -5
# Expected: sem erros de TypeScript (pode falhar na conexão MySQL, isso é esperado sem DB)
```

**Commit**: `chore(backend-node): migrate scripts/seed.js to TypeScript`

---

### T19: Atualizar Dockerfile para build TypeScript [P]

> **P2** — pode ser executado em paralelo com T18 após T17

**What**: Atualizar `Dockerfile` para multi-stage build: instalar deps + compilar TypeScript no estágio de build, executar `node dist/server.js` no estágio final
**Where**: `backend-node/Dockerfile`
**Depends on**: T17 (server.ts migrado, `npm run build` funcional)
**Reuses**: `backend-node/Dockerfile` atual como base
**Requirement**: TSMIG-11

**Done when**:

- [ ] `Dockerfile` atualizado com dois estágios:
  ```dockerfile
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  FROM node:18-alpine
  WORKDIR /app
  RUN apk add --no-cache curl
  COPY package*.json ./
  RUN npm install --omit=dev
  COPY --from=builder /app/dist ./dist
  EXPOSE 3001
  CMD ["node", "dist/server.js"]
  ```
- [ ] `docker build -t backend-node-ts backend-node/` conclui sem erros
- [ ] Container iniciado com `docker run --rm -e DB_HOST=... backend-node-ts` responde ao healthcheck

**Tests**: none
**Gate**: full-build (docker build)

**Verify**:
```bash
docker build -t backend-node-ts ./backend-node
# Expected: exit 0, todas as stages concluídas
```

**Commit**: `chore(backend-node): update Dockerfile for TypeScript multi-stage build`

---

## Mapa de Execução Paralela

```
Fase 1 (Sequencial + Paralelo):
  T01 ──→ T02 ──→ T03
                   └──→ T20 [P]   (T20 paralelo com T03)

Fase 2 (Paralelo após T03+T20):
  T03+T20 complete, então:
    ├── T04 [P]   (T20 é pré-req para testes co-localizados)
    ├── T05 [P]
    └── T06 [P]

Fase 3 (Paralelo após Fase 2):
  T04+T03+T20 → T10 [P]  ─┐
  T05+T20 → T07 [P]        │  } todos simultâneos
  T05+T20 → T08 [P]        │
  T05+T20 → T09 [P]       ─┘

Fase 4 (Paralelo após Fase 3):
  T07+T06+T04 → T11 [P]  ─┐
  T08+T10+T04 → T12 [P]   │  } simultâneos
  T09+T08+T06 → T13 [P]  ─┘

Fase 5 (Paralelo após Fase 4):
  T11+T10 → T14 [P]  ─┐
  T12+T10 → T15 [P]   │  } simultâneos
  T13+T10 → T16 [P]  ─┘

Fase 6 (Sequencial após Fase 5):
  T14+T15+T16+T05+T06+T20 ──→ T17

Fase 7 (Paralelo após T17):
  T17 → T19 [P]   } simultâneos (P2)
  T05 → T18 [P]

Fase 8 (Gate de cobertura — após T18+T19):
  npm run test:coverage   (todos os *.test.ts já escritos nas Fases 2–6)
```

---

## Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T01: Instalar deps e scripts | 1 arquivo (package.json) | ✅ Granular |
| T02: tsconfig.json + .gitignore | 2 arquivos coesos (configuração TS) | ✅ OK |
| T03: src/types/ | 2 arquivos coesos (módulo de tipos) | ✅ OK |
| T20: jest.config.ts + scripts teste | 2 arquivos coesos (infra de testes) | ✅ OK |
| T04: errors.ts + errors.test.ts | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T05: database.ts | 1 arquivo | ✅ Granular |
| T06: rabbitmq.ts | 1 arquivo | ✅ Granular |
| T07: User.ts + User.test.ts | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T08: Event.ts + Event.test.ts | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T09: Order.ts + Order.test.ts | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T10: auth.ts + auth.test.ts | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T11: authController.ts + test | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T12: eventController.ts + test | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T13: orderController.ts + test | 1 módulo + 1 suite co-localizada | ✅ Granular |
| T14: authRoutes.ts | 1 arquivo | ✅ Granular |
| T15: eventRoutes.ts | 1 arquivo | ✅ Granular |
| T16: orderRoutes.ts | 1 arquivo | ✅ Granular |
| T17: server.ts + health.test.ts | 1 entry point + 1 teste integração | ✅ Granular |
| T18: seed.ts | 1 arquivo | ✅ Granular |
| T19: Dockerfile | 1 arquivo | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagrama Mostra | Status |
|---|---|---|---|
| T01 | None | ponto de início | ✅ Match |
| T02 | T01 | T01 → T02 | ✅ Match |
| T03 | T02 | T02 → T03 | ✅ Match |
| T20 | T01, T02 | T02 → T20 [P paralelo com T03] | ✅ Match |
| T04 | T01, T02, T20 | T03+T20 complete → T04 [P] | ✅ Match |
| T05 | T01, T02 | T03 complete → T05 [P] | ✅ Match |
| T06 | T01, T02 | T03 complete → T06 [P] | ✅ Match |
| T07 | T05, T20 | T05+T20 → T07 [P] | ✅ Match |
| T08 | T05, T20 | T05+T20 → T08 [P] | ✅ Match |
| T09 | T05, T20 | T05+T20 → T09 [P] | ✅ Match |
| T10 | T03, T04, T20 | T04+T03+T20 → T10 [P] | ✅ Match |
| T11 | T07, T06, T04 | T07+T06+T04 → T11 [P] | ✅ Match |
| T12 | T08, T10, T04 | T08+T10+T04 → T12 [P] | ✅ Match |
| T13 | T09, T08, T06, T04 | T09+T08+T06 → T13 [P] | ✅ Match |
| T14 | T11, T10 | T11+T10 → T14 [P] | ✅ Match |
| T15 | T12, T10 | T12+T10 → T15 [P] | ✅ Match |
| T16 | T13, T10 | T13+T10 → T16 [P] | ✅ Match |
| T17 | T14, T15, T16, T05, T06, T20 | T14+T15+T16+T05+T06+T20 → T17 | ✅ Match |
| T18 | T05 | T05 → T18 [P] | ✅ Match |
| T19 | T17 | T17 → T19 [P] | ✅ Match |

---

## Test Co-location Validation

| Task | Camada Criada/Modificada | Arquivo de Teste | Gate | Status |
|---|---|---|---|---|
| T01 | config (package.json) | none | build | ✅ OK |
| T02 | config (tsconfig) | none | build | ✅ OK |
| T03 | tipos TypeScript | none | build | ✅ OK |
| T20 | infra de testes (jest.config) | none (cria a infra) | build | ✅ OK |
| T04 | utils/errors | `src/utils/__tests__/errors.test.ts` | build + test | ✅ OK |
| T05 | config/database | none (sem lógica testável isolada) | build | ✅ OK |
| T06 | config/rabbitmq | none (sem lógica testável isolada) | build | ✅ OK |
| T07 | model (User) | `src/models/__tests__/User.test.ts` | build + test | ✅ OK |
| T08 | model (Event) | `src/models/__tests__/Event.test.ts` | build + test | ✅ OK |
| T09 | model (Order) | `src/models/__tests__/Order.test.ts` | build + test | ✅ OK |
| T10 | middleware (auth) | `src/middleware/__tests__/auth.test.ts` | build + test | ✅ OK |
| T11 | controller (auth) | `src/controllers/__tests__/authController.test.ts` | build + test | ✅ OK |
| T12 | controller (event) | `src/controllers/__tests__/eventController.test.ts` | build + test | ✅ OK |
| T13 | controller (order) | `src/controllers/__tests__/orderController.test.ts` | build + test | ✅ OK |
| T14 | route (auth) | none (rotas testadas via controllers) | build | ✅ OK |
| T15 | route (event) | none (rotas testadas via controllers) | build | ✅ OK |
| T16 | route (order) | none (rotas testadas via controllers) | build | ✅ OK |
| T17 | entry point (server) | `src/__tests__/health.test.ts` (Supertest) | full-build + test | ✅ OK |
| T18 | script (seed) | none (script CLI, sem infra de teste) | build | ✅ OK |
| T19 | Dockerfile | none (build docker) | full-build (docker) | ✅ OK |

> Nota: T05 e T06 (database/rabbitmq) são wrappers de configuração de conexão — testados indiretamente via mocks nos controllers e models. T14–T16 (routes) são testados via suites dos controllers que as importam.

---

## Requirement Traceability Atualizada

| Requirement ID | Story | Tasks | Status |
|---|---|---|---|
| TSMIG-01 | P1: Toolchain TypeScript | T01, T02 | Pending |
| TSMIG-02 | P1: Tipos compartilhados | T03 | Pending |
| TSMIG-03 | P1: utils/errors.ts | T04 | Pending |
| TSMIG-04 | P1: config/database.ts | T05 | Pending |
| TSMIG-05 | P1: config/rabbitmq.ts | T06 | Pending |
| TSMIG-06 | P1: models/*.ts | T07, T08, T09 | Pending |
| TSMIG-07 | P1: middleware/auth.ts | T10 | Pending |
| TSMIG-08 | P1: controllers/*.ts | T11, T12, T13 | Pending |
| TSMIG-09 | P1: routes/*.ts | T14, T15, T16 | Pending |
| TSMIG-10 | P1: server.ts | T17 | Pending |
| TSMIG-11 | P2: Dockerfile | T19 | Pending |
| TSMIG-12 | P2: scripts/seed.ts | T18 | Pending |
| TSMIG-13 | P3: Jest + ts-jest infrastructure | T20 | Pending |
| TSMIG-14 | P3: Unit test suites (utils/models/middleware/controllers) | T04, T07, T08, T09, T10, T11, T12, T13 | Pending |
| TSMIG-15 | P3: Integration test — GET /health (Supertest) | T17 | Pending |

**Coverage:** 15 requisitos → 20 tarefas, todos mapeados ✅
