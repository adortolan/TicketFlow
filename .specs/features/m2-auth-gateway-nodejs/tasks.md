# Milestone 2: Auth & Gateway — Implementation Tasks

**Feature ID:** M2-AUTH
**Total Tasks:** 11
**Estimated Complexity:** Low (implementação já existe, foco em validação e ajustes)

## Task Breakdown

### Task 1: Verificar e Ajustar .env.example ✅ COMPLETED

**What:** Garantir que o arquivo `.env.example` contém todas as variáveis necessárias e está documentado
**Where:** `backend-node/.env.example`
**Depends on:** Nenhuma
**Reuses:** Variáveis existentes em database.js e rabbitmq.js
**Done when:**
- Arquivo `.env.example` existe com todas as variáveis: PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, RABBITMQ_URL
- Cada variável tem comentário explicando seu propósito
- Arquivo `.env` local criado a partir do exemplo com valores para desenvolvimento
**Tests:** `cat backend-node/.env.example` — todas as variáveis aparecem com comentários
**Gate:** Nenhum

---

### Task 2: Verificar Startup do Servidor e Conexões ✅ COMPLETED

**What:** Iniciar o servidor Node.js e confirmar conexão com MySQL e RabbitMQ sem erros
**Where:** `backend-node/src/server.js`
**Depends on:** Task 1, Docker Compose rodando (MySQL + RabbitMQ)
**Reuses:** server.js existente
**Done when:**
- `node src/server.js` inicia sem erros
- Log confirma conexão com MySQL: "Database connected"
- Log confirma conexão com RabbitMQ: "RabbitMQ connected"
- Servidor escuta na porta 3001
**Tests:** `curl http://localhost:3001/api/health` (ou curl raiz) retorna resposta
**Gate:** Rodar `node src/server.js` e verificar logs no terminal

---

### Task 3: Testar Endpoint de Registro de Usuário ✅ COMPLETED

**What:** Validar que POST /api/auth/register funciona conforme spec
**Where:** `backend-node/src/controllers/authController.js`
**Depends on:** Task 2
**Reuses:** authController.js existente
**Done when:**
- Registro com dados válidos retorna 201 com usuário criado (sem campo senha)
- Registro com email duplicado retorna 409
- Registro com CPF duplicado retorna 409
- Registro sem campos obrigatórios retorna 400 com mensagem clara
- Senha armazenada no MySQL está hasheada (BCrypt)
**Tests:**
```bash
# Registro válido
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","senha":"123456","cpf":"12345678900"}'

# Duplicata
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","senha":"123456","cpf":"12345678900"}'
```
**Gate:** Ambos os testes retornam o status HTTP esperado

---

### Task 4: Testar Endpoint de Login e Geração de JWT ✅ COMPLETED

**What:** Validar que POST /api/auth/login retorna JWT válido com claims corretos
**Where:** `backend-node/src/controllers/authController.js`
**Depends on:** Task 3
**Reuses:** authController.js existente
**Done when:**
- Login com credenciais válidas retorna 200 com token JWT
- Token decodificado contém: `id`, `email`, `role`
- Login com senha errada retorna 401
- Login com email inexistente retorna 401
**Tests:**
```bash
# Login válido — copiar o token retornado
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@test.com","senha":"123456"}'
```
**Gate:** Token retornado pode ser decodificado em jwt.io com claims corretos

---

### Task 5: Testar Middleware de Autenticação JWT ✅ COMPLETED

**What:** Validar que rotas protegidas rejeitam requisições sem token ou com token inválido
**Where:** `backend-node/src/middleware/auth.js`
**Depends on:** Task 4
**Reuses:** middleware auth.js existente
**Done when:**
- POST /api/events sem token retorna 401
- POST /api/events com token expirado retorna 401
- POST /api/events com token malformado retorna 401
- POST /api/events com token válido de CLIENTE retorna 403
- POST /api/events com token válido de ADMIN retorna 201 ou 400 (validation error)
**Tests:**
```bash
# Sem token
curl -X POST http://localhost:3001/api/events -H "Content-Type: application/json" \
  -d '{"nome":"Evento Teste","data":"2026-12-01","local":"SP","preco":50,"quantidade":100}'

# Com token válido (substituir TOKEN pelo retorno do Task 4)
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"nome":"Evento Teste","data":"2026-12-01","local":"SP","preco":50,"quantidade":100}'
```
**Gate:** Respostas HTTP batem com os códigos esperados (401, 403)

---

### Task 6: Testar CRUD de Eventos ✅ COMPLETED

**What:** Validar endpoints de listagem e criação de eventos
**Where:** `backend-node/src/controllers/eventController.js`
**Depends on:** Task 5
**Reuses:** eventController.js e Event.js existentes
**Done when:**
- GET /api/events retorna array (pode estar vazio) sem autenticação — 200
- GET /api/events/:id com ID válido retorna evento — 200
- GET /api/events/:id com ID inexistente retorna — 404
- POST /api/events com token ADMIN cria evento — 201
- Evento criado aparece na listagem
**Tests:** Sequência: criar evento como ADMIN → listar eventos → verificar que aparece → buscar por ID
**Gate:** GET /api/events retorna o evento recém-criado

---

### Task 7: Testar Fluxo de Criação de Pedido ✅ COMPLETED

**What:** Validar que POST /api/orders cria pedido PENDING e publica no RabbitMQ
**Where:** `backend-node/src/controllers/orderController.js`
**Depends on:** Task 6
**Reuses:** orderController.js, Order.js, rabbitmq.js existentes
**Done when:**
- POST /api/orders com JWT válido e eventId existente retorna 202 com orderId e status PROCESSING
- Registro de pedido criado no MySQL com status PENDING
- Mensagem publicada na fila order.created do RabbitMQ (verificar via Management UI: http://localhost:15672)
- GET /api/orders/:id retorna o pedido com status
- GET /api/orders/user/orders retorna lista de pedidos do usuário
**Tests:**
```bash
# Criar pedido (usar TOKEN de usuário CLIENTE e eventId existente)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"eventId":1,"quantity":2}'

# Consultar status
curl http://localhost:3001/api/orders/1 \
  -H "Authorization: Bearer TOKEN"
```
**Gate:** RabbitMQ Management UI (http://localhost:15672) mostra mensagem na fila order.created

---

### Task 8: Padronizar Respostas de Erro ✅ COMPLETED

**What:** Garantir que todos os erros seguem formato JSON consistente
**Where:** `backend-node/src/server.js` e controllers
**Depends on:** Tasks 3-7
**Reuses:** Estrutura existente de error handling
**Done when:**
- Todos os erros 4xx e 5xx retornam JSON com campos `error` (mensagem) e `code` (código string)
- Erros de validação retornam 400 com lista de campos inválidos
- Erros de autenticação retornam 401 com mensagem clara
- Erros de autorização retornam 403 com mensagem clara
- Erros internos retornam 500 sem expor stack trace
- Middleware de error handler global adicionado ao server.js
**Tests:** Verificar manualmente as respostas de erro dos testes anteriores
**Gate:** Nenhum erro retorna HTML em vez de JSON

---

### Task 9: Implementar Health Check Endpoint

**What:** Adicionar endpoint GET /health para verificação de saúde do serviço
**Where:** `backend-node/src/server.js` ou nova rota
**Depends on:** Task 2
**Reuses:** Estrutura Express existente
**Done when:**
- GET /health retorna 200 com status das conexões
- Resposta inclui: `{ status: "ok", mysql: "connected"|"disconnected", rabbitmq: "connected"|"disconnected" }`
- Docker Compose pode usar este endpoint para health check
**Tests:** `curl http://localhost:3001/health` retorna JSON com status
**Gate:** Resposta 200 com JSON quando serviços estão conectados

---

### Task 10: Criar Usuário Admin via Seed ou Script

**What:** Criar um usuário com role ADMIN para testes de criação de eventos
**Where:** `backend-node/scripts/seed.js` (novo arquivo) ou diretamente no MySQL
**Depends on:** Task 3
**Reuses:** Módulo User.js e database.js existentes
**Done when:**
- Existe um mecanismo para criar usuário ADMIN (script npm run seed ou INSERT SQL)
- Usuário admin criado com email e senha documentados no README
- Login com usuário admin retorna JWT com `role: "ADMIN"`
**Tests:** Login com credenciais admin → decodificar token → verificar `role === "ADMIN"`
**Gate:** Endpoint POST /api/events aceita requisição com token do admin

---

### Task 11: Documentar Endpoints no README do Backend Node.js

**What:** Atualizar README.md do backend-node com todos os endpoints, payloads e exemplos curl
**Where:** `backend-node/README.md`
**Depends on:** Tasks 3-7
**Reuses:** Documentação existente
**Done when:**
- README lista todos os 8 endpoints com método, path, autenticação necessária
- Cada endpoint tem exemplo de payload e resposta esperada
- Seção de variáveis de ambiente documentada
- Instruções de como rodar o servidor localmente
**Tests:** Outro desenvolvedor consegue testar todos os endpoints só com o README
**Gate:** Nenhum

---

## Task Dependencies

```
Task 1 (.env.example)
└── Task 2 (Startup e conexões)
    ├── Task 9 (Health check) — pode ser paralelo
    └── Task 3 (Teste de registro)
        └── Task 4 (Teste de login / JWT)
            └── Task 5 (Teste middleware JWT)
                └── Task 6 (Teste de eventos)
                    └── Task 7 (Teste de pedidos)
                        └── Task 8 (Padronizar erros)
                            └── Task 11 (Documentação)

Task 3 — paralelo a Task 9
Task 10 — pode ser feito após Task 3 ou Task 4
```

## Parallel Execution Opportunities

**[P] Task 9 e Task 3** podem ser feitas em paralelo após Task 2.
**[P] Task 10** pode ser feita junto com Tasks 5-7.

## Verification Criteria

### Checklist de Testes Manuais
- [ ] Registro de usuário com dados válidos — 201
- [ ] Registro com email duplicado — 409
- [ ] Login com credenciais válidas — 200 com JWT
- [ ] Login com senha errada — 401
- [ ] Acesso a rota protegida sem token — 401
- [ ] Acesso a rota de admin com token CLIENTE — 403
- [ ] Listagem de eventos sem autenticação — 200
- [ ] Criação de evento como ADMIN — 201
- [ ] Criação de pedido como CLIENTE — 202
- [ ] Status do pedido aparece no MySQL como PENDING
- [ ] Mensagem aparece na fila order.created do RabbitMQ
- [ ] GET /health retorna status das conexões
- [ ] Todos os erros retornam JSON (não HTML)

### Build Verification
- [ ] `npm start` (ou `node src/server.js`) inicia sem erros
- [ ] Nenhum aviso de dependências obsoletas críticas
