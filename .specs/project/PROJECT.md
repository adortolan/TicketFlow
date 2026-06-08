# TicketFlow - Sistema de Gestão de Eventos e Venda de Ingressos

**Vision:** Uma plataforma web para descoberta de eventos e compra de ingressos utilizando arquitetura de microsserviços orientada a eventos.
**For:** Desenvolvedores aprendendo arquitetura distribuída, comunicação assíncrona entre serviços e segurança com tokens descentralizados
**Solves:** Demonstra padrões de microsserviços, mensageria com RabbitMQ, autenticação JWT e processamento assíncrono em um ecossistema heterogêneo (Node.js + Spring Boot + React)

## Goals

- Demonstrar arquitetura de microsserviços com comunicação assíncrona via RabbitMQ
- Implementar autenticação JWT descentralizada válida entre Node.js e Spring Boot
- Processar pedidos de forma assíncrona com garantia de consistência de estoque
- Estabelecer fundação para desenvolvimento full-stack com containerização
- Habilitar desenvolvimento rápido com hot-reload para todos os serviços

## Tech Stack

**Core:**

- Frontend: React 18.3.1 com Vite 5.3.1
- Auth/Gateway Service: Node.js + Express 4.18.2
- Core Business Service: Spring Boot 4.0.6 (Java 17)
- Database: MySQL 8.0
- Messaging: RabbitMQ 3.12
- Containerization: Docker Compose

**Key dependencies:**

- Node.js: JWT (jsonwebtoken 9.0.2), BCrypt (5.1.1), MySQL2 (3.6.5), AMQP (amqplib 0.10.3)
- Spring Boot: Spring Data JPA, Spring AMQP, Spring MVC
- Frontend: React hooks (useState, useEffect), Vite
- Security: JWT tokens, BCrypt password hashing

## Scope

**v1 includes:**

- RF01: Gestão de Usuários com Autenticação JWT (registro, login, validação de tokens)
- RF02: Catálogo de Eventos (criação por ADMIN, visualização pública)
- RF03: Fluxo de Compra Assíncrona (Node.js → RabbitMQ → Spring Boot → MySQL)
- Comunicação assíncrona entre serviços via RabbitMQ
- Configuração de MySQL com tabelas relacionadas (Users, Events, Orders)
- Docker Compose para orquestração de todos os serviços
- Scripts de desenvolvimento para execução simultânea dos serviços

**Explicitly out of scope:**

- Pagamento real (apenas simulação de compra)
- Sistema de notificações por e-mail real
- Dashboard administrativo avançado
- Relatórios financeiros complexos
- Sistema de avaliações/comentários de eventos
- E2E testing automatizado
- API documentation (Swagger/OpenAPI)

## Constraints

- Timeline: Projeto de aprendizado, sem prazos estritos
- Technical: Arquitetura de microsserviços requer coordenação entre múltiplos serviços
- Resources: Projeto de desenvolvedor único, foco educacional
- Environment: Requer Docker e Docker Compose para execução completa
