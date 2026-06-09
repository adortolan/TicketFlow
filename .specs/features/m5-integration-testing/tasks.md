# Milestone 5: Integration & Testing — Implementation Tasks

**Feature ID:** M5-TESTING
**Total Tasks:** 10
**Estimated Complexity:** Medium (testes manuais + documentação)

**Pré-requisito:** Milestones 2, 3 e 4 concluídos e todos os serviços rodando.

## Task Breakdown

### Task 1: Configurar e Verificar Docker Compose Full Stack

**What:** Garantir que todos os 5 containers sobem corretamente e se comunicam
**Where:** `docker-compose.yml` (raiz do projeto)
**Depends on:** Milestones 2, 3 e 4 concluídos
**Reuses:** docker-compose.yml existente
**Done when:**
- `docker compose up` sobe todos os containers: mysql, rabbitmq, backend (Spring Boot), backend-node (Node.js), frontend (React)
- Todos os health checks passam (ver `docker compose ps` — status "healthy")
- Node.js conecta ao MySQL e RabbitMQ (ver logs: `docker compose logs backend-node`)
- Spring Boot conecta ao MySQL e RabbitMQ (ver logs: `docker compose logs backend`)
- Frontend acessível em http://localhost:3000
**Tests:**
```bash
docker compose up -d
docker compose ps          # todos "healthy"
docker compose logs --tail=20 backend-node
docker compose logs --tail=20 backend
curl http://localhost:3001/health
curl http://localhost:3000
```
**Gate:** `docker compose ps` mostra todos os serviços com status "healthy"

---

### Task 2: Testar Fluxo de Autenticação Completo

**What:** Validar registro → login → acesso a rotas protegidas → logout (via frontend e curl)
**Where:** Browser (http://localhost:3000) + curl para API direta
**Depends on:** Task 1
**Reuses:** Comandos curl documentados no M2
**Done when:**
- Registro via frontend: dados válidos → conta criada
- Registro via curl: dados válidos → 201; e-mail duplicado → 409
- Login via frontend: credenciais válidas → catálogo de eventos exibido
- Login via curl: retorna JWT com claims `{ id, email, role }`
- Rota protegida sem token → 401
- Rota admin com token CLIENTE → 403
- Logout via frontend: sessão encerrada, redirecionado para login
- Refresh da página: sessão mantida via localStorage
**Tests:**
```bash
# Registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Cliente Teste","email":"cliente@test.com","senha":"123456","cpf":"11122233344"}'

# Login — salvar o token retornado
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","senha":"123456"}'

# Rota protegida sem token
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"nome":"Evento"}'
```
**Gate:** Todos os cenários retornam os HTTP status esperados (201, 200, 401, 403)

---

### Task 3: Testar Catálogo de Eventos (Admin + Público)

**What:** Validar criação de evento por ADMIN e visualização pública
**Where:** Browser + curl
**Depends on:** Task 2 (precisa de token ADMIN)
**Reuses:** Seed de admin do M2 (Task 10)
**Done when:**
- Login como ADMIN (via seed ou usuário criado manualmente)
- Criar evento via frontend: formulário visível, evento criado aparece na lista
- Criar evento via curl com token ADMIN: retorna 201
- Tentar criar evento com token CLIENTE: retorna 403
- Listar eventos sem autenticação (GET /api/events): retorna array com evento criado
- GET /api/events/:id com ID inválido: retorna 404
**Tests:**
```bash
# Login admin e criar evento
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Show Teste","data":"2026-12-01T20:00:00","local":"São Paulo - SP","preco":150,"quantidade":50}'

# Listar sem auth
curl http://localhost:3001/api/events
```
**Gate:** Evento criado aparece na listagem e no frontend sem autenticação

---

### Task 4: Testar Fluxo de Compra Completo (Happy Path)

**What:** Validar o fluxo end-to-end: comprar ingresso → RabbitMQ → Spring Boot → status CONFIRMED
**Where:** Browser + curl + MySQL + RabbitMQ Management UI
**Depends on:** Tasks 3 + Milestone 3 (Spring Boot consumer ativo)
**Reuses:** N/A
**Done when:**
- Criar pedido via frontend como CLIENTE: feedback "Processando" aparece imediatamente
- Criar pedido via curl: retorna 202 com `{ orderId, status: "PROCESSING" }`
- Verificar na fila RabbitMQ (http://localhost:15672) que mensagem foi publicada
- Aguardar ~2-5 segundos
- Status no MySQL muda de PENDING para CONFIRMED
- GET /api/orders/:id retorna status CONFIRMED
- Frontend polling mostra "Pedido Confirmado!" automaticamente
- Verificar no MySQL que `quantidadeDisponivel` foi decrementada no evento
**Tests:**
```bash
# Criar pedido (CLIENTE_TOKEN e eventId válido)
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"quantity":2}'

# Aguardar 3 segundos e consultar status
curl http://localhost:3001/api/orders/1 -H "Authorization: Bearer CLIENTE_TOKEN"

# Verificar MySQL
mysql -u ticketflow -pticketflow123 ticketflow -e "SELECT * FROM orders;"
mysql -u ticketflow -pticketflow123 ticketflow -e "SELECT id, nome, quantidade_disponivel FROM events;"
```
**Gate:** Status do pedido no MySQL é CONFIRMED e `quantidadeDisponivel` decrementou

---

### Task 5: Testar Cenário de Estoque Esgotado

**What:** Validar que pedido é CANCELLED quando não há ingressos disponíveis
**Where:** curl + MySQL
**Depends on:** Task 4
**Reuses:** N/A
**Done when:**
- Criar evento com `quantidade: 1`
- Criar primeiro pedido → CONFIRMED (estoque = 0)
- Criar segundo pedido → CANCELLED (sem alterar estoque)
- Verificar no MySQL: `quantidadeDisponivel` = 0 (nunca negativo)
- Verificar no frontend: badge "Esgotado" aparece no EventCard após atualização
**Tests:**
```bash
# Criar evento com 1 ingresso
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Show Esgotado","data":"2026-12-02T20:00:00","local":"Rio de Janeiro - RJ","preco":200,"quantidade":1}'

# Criar 2 pedidos para o mesmo evento
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":2,"quantity":1}'

curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":2,"quantity":1}'

# Aguardar processamento e verificar
mysql -u ticketflow -pticketflow123 ticketflow -e "SELECT * FROM orders WHERE event_id=2;"
```
**Gate:** Um pedido CONFIRMED e outro CANCELLED; `quantidadeDisponivel` = 0 no MySQL

---

### Task 6: Testar Resiliência com Spring Boot Fora do Ar

**What:** Validar que Node.js retém pedidos na fila quando Spring Boot está indisponível
**Where:** Docker Desktop + curl + RabbitMQ Management UI
**Depends on:** Task 4
**Reuses:** N/A
**Done when:**
- Parar o container Spring Boot: `docker compose stop backend`
- Criar pedido via Node.js: retorna 202 "PROCESSING"
- Verificar que mensagem está na fila order.created no RabbitMQ Management UI (Messages: 1+)
- Pedido permanece com status PENDING no MySQL
- Restartar Spring Boot: `docker compose start backend`
- Aguardar ~5-10 segundos para consumo da mensagem pendente
- Status no MySQL muda para CONFIRMED
**Tests:**
```bash
docker compose stop backend
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"quantity":1}'
# Verificar fila em http://localhost:15672 — mensagem enfileirada
docker compose start backend
sleep 10
curl http://localhost:3001/api/orders/LAST_ORDER_ID -H "Authorization: Bearer CLIENTE_TOKEN"
```
**Gate:** Pedido criado durante downtime do Spring Boot é processado após reinicialização

---

### Task 7: Documentar Endpoints da API (API.md)

**What:** Criar documentação completa de todos os endpoints do Node.js
**Where:** `backend-node/API.md`
**Depends on:** Tasks 2-4 (para garantir que todos os endpoints foram testados)
**Reuses:** README.md existente do backend-node como base
**Done when:**
- Arquivo `API.md` criado com:
  - Seção de autenticação: como obter e usar o JWT
  - Tabela de endpoints com: Método, Path, Auth, Descrição
  - Para cada endpoint: exemplo de payload de requisição e resposta (sucesso e erro)
  - Exemplos curl funcionais para cada endpoint
  - Seção de códigos de erro (400, 401, 403, 404, 409, 500)
- Documento usa terminologia em português (projeto de estudos em PT-BR)
**Tests:** Outro desenvolvedor consegue usar todos os endpoints só com a API.md
**Gate:** Nenhum

---

### Task 8: Criar Guia de Setup Local

**What:** Escrever guia passo a passo para rodar o projeto do zero
**Where:** `SETUP.md` (raiz do projeto) ou seção dedicada no README.md raiz
**Depends on:** Task 1
**Reuses:** README.md raiz existente
**Done when:**
- Seção de pré-requisitos: Docker Desktop, Node.js 18+, Java 17, Maven 3.9+
- Passo a passo:
  1. Clonar o repositório
  2. Configurar variáveis de ambiente (copiar .env.example)
  3. Subir infraestrutura: `docker compose up mysql rabbitmq -d`
  4. Iniciar backend-node: `cd backend-node && npm install && npm start`
  5. Iniciar Spring Boot: `cd backend && mvn spring-boot:run`
  6. Iniciar frontend: `cd frontend && npm install && npm run dev`
- Seção de troubleshooting: porta em uso, Docker sem memória, MySQL connection refused
- Credenciais padrão para desenvolvimento
- URLs de acesso: frontend (3000), API (3001), RabbitMQ Management (15672)
**Tests:** Seguir o guia em máquina limpa (sem nada instalado além dos pré-requisitos)
**Gate:** Nenhum (verificação manual)

---

### Task 9: Atualizar README.md Raiz

**What:** Atualizar o README.md principal do projeto com visão geral da arquitetura TicketFlow
**Where:** `README.md` (raiz)
**Depends on:** Task 8
**Reuses:** README.md existente
**Done when:**
- Título e descrição atualizada: "TicketFlow — Sistema de Gestão de Eventos"
- Seção de visão geral com diagrama ASCII da arquitetura
- Stack tecnológica listada
- Milestones e status de cada um
- Links para: guia de setup, API.md, README de cada serviço
- Badges de status (opcional)
**Tests:** README renderizado corretamente no GitHub/GitLab
**Gate:** Nenhum

---

### Task 10: Criar Checklist de Entrega Final (Definition of Done)

**What:** Documentar o checklist de validação final do projeto para confirmar que está completo
**Where:** `.specs/project/IMPLEMENTATION_STATUS.md` (atualizar) ou novo `DONE.md`
**Depends on:** Tasks 1-9
**Reuses:** IMPLEMENTATION_STATUS.md existente
**Done when:**
- Atualizar IMPLEMENTATION_STATUS.md com status final de todos os componentes
- Checklist de funcionalidades completas marcadas
- Seção de "Technical Debt" atualizada com o que ficou de fora (out of scope para v1)
- Seção de "Deferred Ideas" revisada para próximas versões
- Cada RF (RF01, RF02, RF03) com % de conclusão atualizada para 100% ou valor correto
**Tests:** Revisão manual do documento
**Gate:** Nenhum

---

## Task Dependencies

```
Milestones 2, 3, 4 concluídos
└── Task 1 (Docker Compose Full Stack)
    ├── Task 2 (Teste Autenticação)
    │   └── Task 3 (Teste Eventos)
    │       └── Task 4 (Teste Compra — Happy Path)
    │           ├── Task 5 (Teste Estoque Esgotado)
    │           └── Task 6 (Teste Resiliência Spring Boot)
    │               └── Task 7 (API.md)
    │                   └── Task 8 (Guia de Setup)
    │                       └── Task 9 (README.md Raiz)
    │                           └── Task 10 (Checklist Final)
    │
    └── Task 8 (pode começar em paralelo com Tasks 2-6)
```

## Parallel Execution Opportunities

**[P] Task 7, 8, 9** — documentação pode ser feita em paralelo com os testes (Tasks 5, 6)
**[P] Tasks 5 e 6** — podem ser executadas em paralelo após Task 4

## Verification Criteria

### Checklist Final do Projeto TicketFlow

#### RF01 — Autenticação JWT
- [ ] Registro de usuário funciona (nome, email, senha, CPF)
- [ ] Login retorna JWT com claims corretos
- [ ] JWT válido entre Node.js e Spring Boot
- [ ] Controle de acesso por role (CLIENTE/ADMIN) funciona

#### RF02 — Catálogo de Eventos
- [ ] ADMIN cria eventos via frontend e API
- [ ] Qualquer visitante visualiza eventos sem autenticação
- [ ] Eventos esgotados exibem badge corretamente

#### RF03 — Fluxo de Compra Assíncrona
- [ ] Node.js cria pedido PENDING e publica no RabbitMQ imediatamente
- [ ] Frontend recebe feedback imediato "Processando"
- [ ] Spring Boot consome mensagem e processa pedido
- [ ] Status atualiza para CONFIRMED ou CANCELLED
- [ ] Frontend polling detecta mudança de status automaticamente
- [ ] Estoque decrementado corretamente no MySQL

#### Resiliência
- [ ] Spring Boot fora do ar: Node.js retém pedido na fila
- [ ] Spring Boot volta: pedido é processado da fila

#### Documentação
- [ ] README.md raiz descreve a arquitetura
- [ ] API.md documenta todos os endpoints
- [ ] Guia de setup funciona do zero

### Build Verification
- [ ] `docker compose up` — todos os serviços sobem saudáveis
- [ ] Nenhum hardcode de credenciais nos arquivos commitados
- [ ] `.env` está no `.gitignore` (apenas `.env.example` está versionado)
