# Roadmap

**Current Milestone:** Infrastructure Setup
**Status:** Complete

---

## Milestone 1: Infrastructure Setup

**Goal:** Configurar infraestrutura base para microsserviços (MySQL, RabbitMQ, Docker Compose)
**Target:** Complete

### Features

**Docker Compose Configuration** - COMPLETE

- MySQL 8.0 container com volume persistente
- RabbitMQ 3.12 com interface de management
- Network configuration para comunicação entre serviços
- Health checks para todos os serviços
- Script init.sql para inicialização do banco

**Backend Node.js Structure** - COMPLETE

- Estrutura de pastas (config, controllers, middleware, models, routes)
- Configuração de dependências (Express, JWT, BCrypt, MySQL2, AMQP)
- Configuração de ambiente (.env.example)
- Dockerfile para containerização

**Backend Spring Boot Structure** - COMPLETE

- Estrutura de pastas (config, controller, entities, repositories, services)
- Configuração de dependências (Spring Boot, Spring Data JPA)
- Dockerfile para containerização
- Configuração Maven

**Frontend React Structure** - COMPLETE

- Estrutura de pastas (components, App.jsx)
- Configuração Vite
- Dockerfile com nginx para produção
- Configuração de proxy para backend

---

## Milestone 2: Auth & Gateway Service (Node.js)

**Goal:** Implementar serviço de autenticação e API Gateway com JWT
**Target:** In Progress

### Features

**RF01 - Gestão de Usuários** - IN PROGRESS

- Registro de usuários (Nome, E-mail, Senha, CPF) - TODO
- Login com geração de token JWT - TODO
- Criptografia de senhas com BCrypt - TODO
- Validação de tokens JWT em middleware - TODO
- Claims básicos (ID, email, role: CLIENTE/ADMIN) - TODO

**API Gateway** - IN PROGRESS

- Rotas de autenticação (/api/auth/*) - TODO
- Rotas de eventos (/api/events/*) - TODO
- Rotas de pedidos (/api/orders/*) - TODO
- Middleware de autenticação JWT - TODO
- CORS configuration - TODO

**Database Integration** - IN PROGRESS

- Conexão com MySQL via MySQL2 - TODO
- Models User, Event, Order - TODO
- Migração de schema para MySQL - TODO

---

## Milestone 3: Core Business Service (Spring Boot)

**Goal:** Implementar serviço core para processamento de eventos e pedidos
**Target:** In Progress

### Features

**RF03 - Processamento Assíncrono** - IN PROGRESS

- Configuração Spring AMQP para RabbitMQ - ✅ Done
- Consumer da fila order.created - TODO
- Validação de disponibilidade de ingressos - TODO
- Atualização de estoque no MySQL - TODO
- Geração de bilhete final - TODO

**RF02 - Catálogo de Eventos** - PLANNED

- Entities Event e Order com JPA - TODO
- Repositories Spring Data JPA - TODO
- Serviço de gerenciamento de eventos - TODO
- Validação de role ADMIN para criação - TODO

**Database Integration** - IN PROGRESS

- Configuração MySQL connection - ✅ Done
- Spring Data JPA configuration - ✅ Done
- Transaction management - TODO

---

## Milestone 4: Frontend React

**Goal:** Implementar interface de usuário para eventos e compra de ingressos
**Target:** Planned

### Features

**RF01 - Autenticação no Frontend** - PLANNED

- Formulário de registro de usuários - TODO
- Formulário de login - TODO
- Armazenamento de token JWT (localStorage) - TODO
- Envio de token em headers Authorization - TODO

**RF02 - Catálogo de Eventos** - PLANNED

- Listagem de eventos disponíveis - TODO
- Detalhes de evento individual - TODO
- Interface para criação de eventos (ADMIN) - TODO

**RF03 - Fluxo de Compra** - PLANNED

- Seleção de quantidade de ingressos - TODO
- Botão de compra com feedback - TODO
- Polling de status do pedido - TODO
- Exibição de bilhete confirmado - TODO

---

## Milestone 5: Integration & Testing

**Goal:** Integrar todos os serviços e implementar testes
**Target:** Planned

### Features

**Integration Testing** - PLANNED

- Teste de fluxo completo de compra - TODO
- Teste de comunicação RabbitMQ - TODO
- Teste de autenticação JWT entre serviços - TODO

**End-to-End Testing** - PLANNED

- Teste E2E com Cypress ou Playwright - TODO
- Teste de resiliência (serviço Spring Boot down) - TODO

**Documentation** - PLANNED

- Documentação de API endpoints - TODO
- Guia de setup local - TODO
- Diagramas de arquitetura - TODO

---

## Future Considerations

- Dashboard administrativo avançado
- Sistema de notificações por e-mail real
- Pagamento real com gateways de pagamento
- Sistema de avaliações/comentários de eventos
- Relatórios financeiros complexos
- Caching layer para performance
- TypeScript migration para frontend
- Mobile-responsive design improvements
