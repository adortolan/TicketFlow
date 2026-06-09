# Milestone 2: Auth & Gateway Service (Node.js)

**Feature ID:** M2-AUTH
**Milestone:** Milestone 2 - Auth & Gateway Service
**Status:** In Progress (95% implemented)
**Last Updated:** 2026-06-09

## Overview

Implementar e validar o serviço de autenticação e API Gateway em Node.js + Express. Este serviço é o ponto de entrada único do frontend React, responsável por:
- Registro e login de usuários com JWT
- Validação de tokens JWT em todas as rotas protegidas
- Gerenciamento de eventos (catálogo)
- Criação de pedidos e publicação assíncrona no RabbitMQ
- Conexão com MySQL para persistência de dados

## Estado Atual

A implementação dos controllers, models, routes e middleware está completa. Falta verificar a integração real com MySQL e RabbitMQ, ajustar tratamento de erros e validar todos os endpoints funcionando em conjunto.

## Arquivos Implementados

| Arquivo | Status |
|---------|--------|
| `backend-node/src/config/database.js` | COMPLETE |
| `backend-node/src/config/rabbitmq.js` | COMPLETE |
| `backend-node/src/controllers/authController.js` | COMPLETE |
| `backend-node/src/controllers/eventController.js` | COMPLETE |
| `backend-node/src/controllers/orderController.js` | COMPLETE |
| `backend-node/src/middleware/auth.js` | COMPLETE |
| `backend-node/src/models/User.js` | COMPLETE |
| `backend-node/src/models/Event.js` | COMPLETE |
| `backend-node/src/models/Order.js` | COMPLETE |
| `backend-node/src/routes/authRoutes.js` | COMPLETE |
| `backend-node/src/routes/eventRoutes.js` | COMPLETE |
| `backend-node/src/routes/orderRoutes.js` | COMPLETE |
| `backend-node/src/server.js` | COMPLETE |

## Requirements

### RF01 — Gestão de Usuários (Autenticação JWT)

**REQ-M2-001:** Registro de Usuário
- O sistema deve aceitar POST /api/auth/register com: nome, email, senha, CPF
- A senha deve ser criptografada com BCrypt antes de salvar no MySQL
- O email e CPF devem ser únicos (retornar 409 em caso de duplicidade)
- Retornar 201 com dados do usuário criado (sem senha)

**REQ-M2-002:** Login de Usuário
- O sistema deve aceitar POST /api/auth/login com email e senha
- Verificar credenciais contra MySQL com BCrypt
- Retornar token JWT com claims: `{ id, email, role }`
- Role padrão: `CLIENTE`; admins configurados manualmente ou por seed
- Token JWT deve expirar em 24h

**REQ-M2-003:** Validação de JWT (Middleware)
- O middleware `auth.js` deve interceptar todas as rotas protegidas
- Extrair token do header `Authorization: Bearer <TOKEN>`
- Validar assinatura e expiração do token
- Retornar 401 se token ausente, inválido ou expirado
- Injetar dados do usuário em `req.user`

**REQ-M2-004:** Controle de Acesso por Role
- Rotas de criação de evento devem exigir role `ADMIN`
- Rotas de pedido devem exigir role `CLIENTE` ou `ADMIN`
- Retornar 403 se role insuficiente

### RF02 — Catálogo de Eventos (Node.js Gateway)

**REQ-M2-005:** Listagem de Eventos (Público)
- GET /api/events — retorna lista de eventos sem autenticação
- Campos: id, nome, data, local, preco, quantidade_disponivel

**REQ-M2-006:** Detalhes de Evento (Público)
- GET /api/events/:id — retorna detalhes de evento específico
- Retornar 404 se evento não encontrado

**REQ-M2-007:** Criação de Evento (Admin)
- POST /api/events — requer JWT com role ADMIN
- Campos obrigatórios: nome, data, local, preco, quantidade_disponivel
- Retornar 201 com evento criado

### RF03 — Fluxo de Pedidos (Publicação RabbitMQ)

**REQ-M2-008:** Criação de Pedido
- POST /api/orders — requer JWT autenticado
- Campos: eventId, quantity
- Criar registro de pedido com status `PENDING` no MySQL
- Publicar mensagem `{ userId, eventId, quantity, orderId }` na fila `order.created`
- Retornar imediatamente 202 com orderId e status "PROCESSING"

**REQ-M2-009:** Consulta de Status de Pedido
- GET /api/orders/:id — retorna status atual do pedido
- Usuário só pode ver seus próprios pedidos (retornar 403 para outros)

**REQ-M2-010:** Histórico de Pedidos do Usuário
- GET /api/orders/user/orders — retorna todos os pedidos do usuário autenticado

### Infraestrutura

**REQ-M2-011:** Conexão MySQL com Reconexão
- O pool de conexões deve se reconectar automaticamente se MySQL cair
- Logar erros de conexão sem derrubar o servidor

**REQ-M2-012:** Conexão RabbitMQ com Retry
- Se RabbitMQ estiver indisponível na inicialização, tentar reconexão com backoff
- Pedidos com RabbitMQ fora do ar devem retornar 503 com mensagem clara
- Logar falhas de publicação

**REQ-M2-013:** Configuração via .env
- Todas as variáveis sensíveis devem vir do .env
- .env.example deve documentar todas as variáveis necessárias

## User Stories

**US-M2-001:** Como usuário, quero me registrar com nome, email, senha e CPF para acessar a plataforma.

**US-M2-002:** Como usuário registrado, quero fazer login e receber um token JWT para autenticar minhas requisições.

**US-M2-003:** Como usuário autenticado, quero visualizar a lista de eventos disponíveis.

**US-M2-004:** Como usuário ADMIN, quero criar novos eventos com nome, data, local, preço e quantidade de ingressos.

**US-M2-005:** Como usuário autenticado, quero comprar um ingresso e receber confirmação imediata de que meu pedido está sendo processado.

**US-M2-006:** Como usuário autenticado, quero consultar o status do meu pedido para saber se foi confirmado ou cancelado.

## Acceptance Criteria

### Autenticação
- [ ] POST /api/auth/register cria usuário com senha BCrypt e retorna 201
- [ ] POST /api/auth/register retorna 409 para email ou CPF duplicado
- [ ] POST /api/auth/login retorna JWT válido com claims id, email, role
- [ ] POST /api/auth/login retorna 401 para credenciais inválidas
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Rotas protegidas retornam 401 com token expirado/inválido
- [ ] Rotas de admin retornam 403 para role CLIENTE

### Eventos
- [ ] GET /api/events funciona sem autenticação
- [ ] GET /api/events/:id retorna 404 para ID inexistente
- [ ] POST /api/events cria evento com JWT ADMIN (201)
- [ ] POST /api/events retorna 403 com JWT CLIENTE

### Pedidos
- [ ] POST /api/orders cria pedido PENDING e publica no RabbitMQ (202)
- [ ] GET /api/orders/:id retorna status do pedido
- [ ] GET /api/orders/user/orders retorna pedidos do usuário autenticado

### Infraestrutura
- [ ] Servidor inicia sem erros com Docker Compose rodando
- [ ] Logs de conexão MySQL e RabbitMQ aparecem no startup
- [ ] Variáveis de ambiente carregadas corretamente do .env

## Technical Considerations

### Padronização de Erros
Todos os erros devem seguir o formato:
```json
{ "error": "mensagem descritiva", "code": "ERROR_CODE" }
```

### Variáveis de Ambiente Necessárias
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=ticketflow
DB_PASSWORD=ticketflow123
DB_NAME=ticketflow
JWT_SECRET=seu-segredo-super-secreto
JWT_EXPIRES_IN=24h
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

### Endpoints Summary
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/events           (público)
GET    /api/events/:id       (público)
POST   /api/events           (ADMIN)
POST   /api/orders           (autenticado)
GET    /api/orders/:id       (autenticado, próprio pedido)
GET    /api/orders/user/orders (autenticado)
```

## Out of Scope

- Refresh tokens (JWT de curta duração + refresh)
- Rate limiting por IP
- Webhook de retorno do Spring Boot para o frontend
- CRUD completo de usuários (update/delete de conta)
- Upload de imagem para eventos
