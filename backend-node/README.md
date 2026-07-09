# Backend Node.js - Auth & Gateway Service

Este é o serviço de autenticação e gateway API do projeto TicketFlow, implementado em **TypeScript** com Express.

## Responsabilidades

- **Autenticação JWT**: Registro de usuários, login e geração de tokens
- **API Gateway**: Recebe requisições do frontend e as roteia para os serviços apropriados
- **Publicação de Eventos**: Publica mensagens no RabbitMQ para processamento assíncrono
- **Validação**: Validação de entrada e middleware de autenticação

## Estrutura do Projeto

```
backend-node/
├── src/
│   ├── config/
│   │   ├── database.ts       # Configuração do MySQL
│   │   └── rabbitmq.ts       # Configuração do RabbitMQ
│   ├── controllers/
│   │   ├── authController.ts  # Lógica de autenticação
│   │   ├── eventController.ts # Lógica de eventos
│   │   └── orderController.ts # Lógica de pedidos
│   ├── middleware/
│   │   └── auth.ts           # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.ts           # Modelo de usuário
│   │   ├── Event.ts          # Modelo de evento
│   │   └── Order.ts          # Modelo de pedido
│   ├── routes/
│   │   ├── authRoutes.ts     # Rotas de autenticação
│   │   ├── eventRoutes.ts    # Rotas de eventos
│   │   └── orderRoutes.ts    # Rotas de pedidos
│   ├── types/
│   │   ├── index.ts          # Tipos compartilhados (JWTPayload, UserRole)
│   │   └── express/index.d.ts # Extensão do Express com req.user tipado
│   ├── utils/
│   │   └── errors.ts         # Utilitários de erro (AppError, ErrorCodes)
│   ├── __tests__/            # Testes unitários e de integração
│   └── server.ts             # Entry point da aplicação
├── scripts/
│   └── seed.ts               # Script de seed de usuário admin
├── dist/                     # Código JavaScript compilado (gerado pelo build)
├── coverage/                 # Relatórios de cobertura de testes
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── Dockerfile                # Multi-stage build para TypeScript
├── jest.config.ts            # Configuração do Jest
├── package.json
├── tsconfig.json             # Configuração do TypeScript
└── README.md
```

## API Endpoints

### Autenticação

#### POST /api/auth/register
Registro de novo usuário no sistema.

**Autenticação:** Não requer
**Payload:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "123456",
  "cpf": "12345678900"
}
```

**Resposta (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Resposta (409):** Email ou CPF já cadastrado
```json
{
  "error": "Email already registered",
  "code": "EMAIL_ALREADY_REGISTERED"
}
```

**Exemplo curl:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@example.com","senha":"123456","cpf":"12345678900"}'
```

---

#### POST /api/auth/login
Login de usuário e geração de token JWT.

**Autenticação:** Não requer
**Payload:**
```json
{
  "email": "joao@example.com",
  "senha": "123456"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "CLIENTE"
  }
}
```

**Resposta (401):** Credenciais inválidas
```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Exemplo curl:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","senha":"123456"}'
```

---

#### GET /api/auth/profile
Obter perfil do usuário autenticado.

**Autenticação:** Requer token JWT
**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "role": "CLIENTE",
  "created_at": "2026-06-16T10:00:00.000Z"
}
```

**Exemplo curl:**
```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

---

### Eventos

#### GET /api/events
Listar todos os eventos disponíveis.

**Autenticação:** Não requer
**Resposta (200):**
```json
[
  {
    "id": 1,
    "name": "Show de Rock",
    "date": "2026-12-01",
    "location": "São Paulo",
    "price": 100.00,
    "available_tickets": 50,
    "created_by": 1,
    "created_at": "2026-06-16T10:00:00.000Z"
  }
]
```

**Exemplo curl:**
```bash
curl http://localhost:3001/api/events
```

---

#### GET /api/events/:id
Obter detalhes de um evento específico.

**Autenticação:** Não requer
**Resposta (200):**
```json
{
  "id": 1,
  "name": "Show de Rock",
  "date": "2026-12-01",
  "location": "São Paulo",
  "price": 100.00,
  "available_tickets": 50,
  "created_by": 1,
  "created_at": "2026-06-16T10:00:00.000Z"
}
```

**Resposta (404):** Evento não encontrado
```json
{
  "error": "Event not found",
  "code": "EVENT_NOT_FOUND"
}
```

**Exemplo curl:**
```bash
curl http://localhost:3001/api/events/1
```

---

#### POST /api/events
Criar novo evento (apenas usuários ADMIN).

**Autenticação:** Requer token JWT com role ADMIN
**Headers:**
```
Authorization: Bearer <token>
```

**Payload:**
```json
{
  "name": "Show de Rock",
  "date": "2026-12-01",
  "location": "São Paulo",
  "price": 100.00,
  "available_tickets": 50
}
```

**Resposta (201):**
```json
{
  "message": "Event created successfully",
  "eventId": 1
}
```

**Resposta (403):** Usuário sem permissão de ADMIN
```json
{
  "error": "Access denied",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**Exemplo curl:**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Show de Rock","date":"2026-12-01","location":"São Paulo","price":100.00,"available_tickets":50}'
```

---

### Pedidos

#### POST /api/orders
Criar novo pedido de compra de ingressos.

**Autenticação:** Requer token JWT
**Headers:**
```
Authorization: Bearer <token>
```

**Payload:**
```json
{
  "eventId": 1,
  "quantity": 2
}
```

**Resposta (202):**
```json
{
  "message": "Order created and is being processed",
  "orderId": 1,
  "status": "PROCESSING"
}
```

**Resposta (400):** Evento não encontrado ou ingressos insuficientes
```json
{
  "error": "Event not found",
  "code": "EVENT_NOT_FOUND"
}
```

**Exemplo curl:**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"eventId":1,"quantity":2}'
```

---

#### GET /api/orders/:id
Obter detalhes de um pedido específico.

**Autenticação:** Requer token JWT (apenas dono do pedido ou ADMIN)
**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "event_id": 1,
  "quantity": 2,
  "total_price": 200.00,
  "status": "CONFIRMED",
  "created_at": "2026-06-16T10:00:00.000Z"
}
```

**Resposta (403):** Acesso negado
```json
{
  "error": "Access denied",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**Exemplo curl:**
```bash
curl http://localhost:3001/api/orders/1 \
  -H "Authorization: Bearer <token>"
```

---

#### GET /api/orders/user/orders
Listar todos os pedidos do usuário autenticado.

**Autenticação:** Requer token JWT
**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "event_id": 1,
    "quantity": 2,
    "total_price": 200.00,
    "status": "CONFIRMED",
    "created_at": "2026-06-16T10:00:00.000Z"
  }
]
```

**Exemplo curl:**
```bash
curl http://localhost:3001/api/orders/user/orders \
  -H "Authorization: Bearer <token>"
```

---

### Health Check

#### GET /health
Verificar status de saúde do serviço e conexões.

**Autenticação:** Não requer
**Resposta (200):**
```json
{
  "status": "ok",
  "mysql": "connected",
  "rabbitmq": "connected"
}
```

**Resposta (degraded):** Algum serviço desconectado
```json
{
  "status": "degraded",
  "mysql": "connected",
  "rabbitmq": "disconnected"
}
```

**Exemplo curl:**
```bash
curl http://localhost:3001/health
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`

### Variáveis de Ambiente

**Configuração do Servidor:**
- `PORT` - Porta onde o servidor Node.js irá escutar (padrão: 3001)
- `NODE_ENV` - Ambiente de execução (development, production, test)

**Configuração JWT:**
- `JWT_SECRET` - Chave secreta para assinar tokens JWT (obrigatório alterar em produção)
- `JWT_EXPIRES_IN` - Tempo de expiração do token (ex: 24h, 7d, 1h)

**Configuração MySQL:**
- `DB_HOST` - Hostname do servidor MySQL (localhost para desenvolvimento local, mysql para Docker)
- `DB_PORT` - Porta do servidor MySQL (padrão: 3306)
- `DB_NAME` - Nome do banco de dados (padrão: ticketflow)
- `DB_USER` - Usuário do banco de dados (padrão: root)
- `DB_PASSWORD` - Senha do banco de dados

**Configuração RabbitMQ:**
- `RABBITMQ_URL` - URL de conexão com RabbitMQ (formato: amqp://user:password@host:port)
- `RABBITMQ_QUEUE_ORDER_CREATED` - Nome da fila para eventos de criação de pedidos (padrão: order.created)
- `RABBITMQ_QUEUE_USER_REGISTERED` - Nome da fila para eventos de registro de usuários (padrão: user.registered)

## TypeScript

Este projeto utiliza **TypeScript** para fornecer type-safety, melhor suporte de IDE e refatorações mais seguras. 

### Configuração TypeScript

- **tsconfig.json**: Configuração do compilador TypeScript com `target: ES2020`, `module: commonjs`, `strict: false`
- **Tipos**: Tipos centralizados em `src/types/` incluindo `JWTPayload` e extensão do Express com `req.user` tipado
- **Build**: O código TypeScript é compilado para JavaScript no diretório `dist/` via `npm run build`

### Scripts TypeScript

```bash
# Compilar TypeScript para JavaScript
npm run build

# Executar em modo desenvolvimento com hot-reload (tsx + nodemon)
npm run dev

# Executar em produção (código compilado)
npm start
```

## Instalação e Execução

### Local (Desenvolvimento)
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor em modo desenvolvimento
npm run dev
```

### Docker (Individual)
```bash
# Construir imagem (multi-stage build com TypeScript)
docker build -t backend-node .

# Executar container
docker run -p 3001:3001 --env-file .env backend-node
```

**Nota:** O Dockerfile utiliza multi-stage build para compilar TypeScript e gerar uma imagem de produção otimizada com apenas o código JavaScript compilado.

### Via Docker Compose (com todo o ecossistema)
```bash
# Iniciar apenas o serviço backend-node
docker-compose up backend-node

# Iniciar todos os serviços
docker-compose up

# Parar serviços
docker-compose down
```

## Seed de Usuário Admin

Para criar um usuário administrador para testes, execute o script de seed:

```bash
npm run seed
```

Isso criará (ou atualizará) um usuário admin com as seguintes credenciais:
- **Email**: admin@ticketflow.com
- **Senha**: admin123
- **Role**: ADMIN

Você pode usar este usuário para testar endpoints que requerem permissão de administrador, como a criação de eventos.

## Dependências Principais

### Runtime
- `express` - Framework web
- `jsonwebtoken` - Geração e validação de tokens JWT
- `bcrypt` - Hash de senhas
- `mysql2` - Cliente MySQL
- `amqplib` - Cliente RabbitMQ
- `cors` - Middleware CORS
- `dotenv` - Gerenciamento de variáveis de ambiente
- `express-validator` - Validação de requisições

### TypeScript & Desenvolvimento
- `typescript` - Compilador TypeScript
- `tsx` - Execução direta de TypeScript em desenvolvimento
- `nodemon` - Hot-reload em desenvolvimento
- `@types/*` - Definições de tipos para pacotes Node.js

### Testes
- `jest` - Framework de testes
- `ts-jest` - Preconfiguração Jest para TypeScript
- `supertest` - Testes de integração HTTP

## Testes

Este projeto possui uma suíte completa de testes unitários e de integração configurada com Jest.

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura de código
npm run test:coverage
```

### Estrutura de Testes

- **Unitários**: Testes de utils, models, middleware e controllers
- **Integração**: Testes de endpoints HTTP via Supertest
- **Cobertura**: Relatórios gerados no diretório `coverage/`

### Status Atual

- ✅ 69 testes passando em 9 suites
- ✅ Cobertura de código gerada com sucesso
- ✅ Testes de health check via Supertest

## Fluxo de Trabalho

1. **Registro/Login**: Usuário se registra ou faz login através do Node.js
2. **Token JWT**: Node.js gera e retorna um token JWT
3. **Requisições Autenticadas**: Frontend envia o token no header Authorization
4. **Criação de Pedido**: Quando um usuário compra um ingresso, o Node.js:
   - Salva o pedido como "PENDING" no MySQL
   - Publica uma mensagem na fila `order.created` do RabbitMQ
5. **Processamento Assíncrono**: O serviço Spring Boot consome a mensagem e processa o pedido

## Status da Migração TypeScript

✅ **Migração TypeScript Completa** (100%)

Este serviço foi completamente migrado de JavaScript para TypeScript, fornecendo:

- ✅ **Type-safety**: Verificação estática de tipos em compile-time
- ✅ **Melhor suporte de IDE**: Autocomplete, refatorações seguras e detecção de erros
- ✅ **Contratos explícitos**: Interfaces e tipos definidos para todos os módulos
- ✅ **Testes tipados**: Suites de testes completas com TypeScript
- ✅ **Build otimizado**: Multi-stage Docker build para produção
- ✅ **Desenvolvimento aprimorado**: Hot-reload com tsx + nodemon

### Detalhes da Migração

- **Todos os arquivos .js convertidos para .ts** (src/ e scripts/)
- **Tipos centralizados** em `src/types/` (JWTPayload, UserRole, extensão Express)
- **Configuração TypeScript** com tsconfig.json otimizado
- **Testes completos** com Jest + ts-jest (69 testes passando)
- **Dockerfile atualizado** com multi-stage build para TypeScript
- **Script de seed migrado** para TypeScript com tipos explícitos

### Métricas

- **25 arquivos TypeScript** (incluindo testes)
- **15 arquivos JavaScript compilados** no dist/
- **69 testes** em 9 suites (100% passando)
- **Cobertura de código** gerada com sucesso
- **0 arquivos .js** em src/ ou scripts/ (apenas dist/ gerado)
