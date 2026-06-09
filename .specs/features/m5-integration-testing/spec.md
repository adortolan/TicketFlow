# Milestone 5: Integration & Testing

**Feature ID:** M5-TESTING
**Milestone:** Milestone 5 - Integration & Testing
**Status:** Planned
**Last Updated:** 2026-06-09

## Overview

Validar a integração completa entre todos os serviços do TicketFlow, documentar a API e criar guias de setup. Este milestone garante que a arquitetura de microsserviços funciona de ponta a ponta (Frontend → Node.js → RabbitMQ → Spring Boot → MySQL) antes de considerar o projeto concluído.

**Pré-requisito:** Milestones 2, 3 e 4 completos.

## Requirements

### Testes de Integração

**REQ-M5-001:** Teste de Fluxo de Autenticação
- Testar registro → login → uso de token em rotas protegidas
- Cobrir casos: registro duplicado, login inválido, token expirado, role insuficiente
- Testar que Spring Boot (se configurado com JWT) valida o mesmo token do Node.js

**REQ-M5-002:** Teste de Comunicação RabbitMQ
- Verificar que Node.js publica mensagem correta na fila order.created
- Verificar que Spring Boot consome a mensagem dentro de um tempo aceitável (< 5 segundos)
- Verificar formato da mensagem: `{ orderId, userId, eventId, quantity }`
- Testar resiliência: Spring Boot fora do ar → Node.js retém mensagem na fila → Spring Boot volta → mensagem consumida

**REQ-M5-003:** Teste de Fluxo de Compra Completo (Happy Path)
- Criar usuário → login → criar evento (admin) → comprar ingresso → verificar status CONFIRMED → verificar estoque decrementado
- Validar cada etapa individualmente antes do fluxo completo

**REQ-M5-004:** Teste de Cenário de Estoque Esgotado
- Criar evento com 1 ingresso → criar 2 pedidos sequenciais
- Primeiro pedido: CONFIRMED, segundo: CANCELLED
- Verificar estoque nunca fica negativo no MySQL

**REQ-M5-005:** Teste de Resiliência (Spring Boot Down)
- Parar o container Spring Boot
- Criar pedido via frontend → recebe "Processando"
- Verificar mensagem retida na fila RabbitMQ (Management UI)
- Restartar Spring Boot
- Verificar que pedido é processado automaticamente e status atualiza

### Documentação

**REQ-M5-006:** Documentação de API (Endpoints Node.js)
- Documentar todos os 8+ endpoints do Node.js com: método, path, autenticação, payload e exemplos de resposta
- Formato: Markdown no README.md do backend-node ou arquivo separado `API.md`

**REQ-M5-007:** Guia de Setup Local
- Passo a passo para rodar o projeto do zero em qualquer máquina
- Pré-requisitos: Docker, Node.js, Java 17, Maven
- Incluir: como criar o .env, como rodar o Docker Compose, como iniciar cada serviço
- Troubleshooting comum (porta em uso, Docker não inicia, etc.)

**REQ-M5-008:** Atualizar README.md do Projeto Raiz
- Seção de visão geral da arquitetura
- Diagrama textual dos serviços
- Links para READMEs individuais de cada serviço
- Requisitos mínimos do sistema

## User Stories

**US-M5-001:** Como desenvolvedor, quero conseguir rodar o projeto do zero seguindo o guia de setup sem precisar pedir ajuda.

**US-M5-002:** Como desenvolvedor, quero entender todos os endpoints disponíveis na API do Node.js sem precisar ler o código-fonte.

**US-M5-003:** Como desenvolvedor, quero ter confiança que os serviços funcionam integrados através de testes de integração documentados.

## Acceptance Criteria

### Fluxo Completo Funcional
- [ ] Usuário consegue se registrar e fazer login via frontend
- [ ] Usuário ADMIN consegue criar eventos via frontend
- [ ] Usuário CLIENTE consegue comprar ingresso e ver status CONFIRMED
- [ ] Status do pedido atualiza no frontend via polling sem refresh manual
- [ ] Estoque do evento decrementa corretamente no MySQL

### Resiliência
- [ ] Node.js retém pedido na fila quando Spring Boot está fora do ar
- [ ] Spring Boot processa pedido pendente ao reiniciar
- [ ] Frontend exibe estado "Processando" durante indisponibilidade do Spring Boot

### Documentação
- [ ] README.md raiz descreve a arquitetura e como rodar o projeto
- [ ] Todos os endpoints Node.js documentados com exemplos
- [ ] Guia de setup funciona em máquina limpa

## Technical Considerations

### Stack de Teste Manual (sem framework de teste)
Para v1 (projeto de aprendizado), os testes serão manuais usando:
- `curl` ou Postman para testar APIs
- MySQL Workbench ou `mysql` CLI para verificar dados
- RabbitMQ Management UI (http://localhost:15672) para verificar filas
- Docker Desktop para gerenciar containers

### Testes Automatizados (desejáveis, não obrigatórios para v1)

**Node.js (Jest):**
```bash
npm install --save-dev jest supertest
```
- Testes unitários de authController, eventController, orderController
- Mock do MySQL2 e amqplib

**Spring Boot (JUnit 5 + @SpringBootTest):**
- Teste de integração do OrderConsumer com RabbitMQ embarcado
- Teste de transação de inventário

### Sequência de Startup Correta
```
1. docker compose up mysql rabbitmq    (infraestrutura)
2. Aguardar health checks passarem
3. cd backend-node && npm start        (Node.js na porta 3001)
4. cd backend && mvn spring-boot:run   (Spring Boot na porta 8080)
5. cd frontend && npm run dev          (React na porta 3000)
```

## Out of Scope

- Testes E2E automatizados com Cypress ou Playwright
- Testes de performance/carga
- CI/CD pipeline
- Monitoramento de produção (Prometheus, Grafana)
- Testes de segurança (penetration testing)
