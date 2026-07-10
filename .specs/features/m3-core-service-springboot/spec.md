# Milestone 3: Core Business Service (Spring Boot)

**Feature ID:** M3-CORE
**Milestone:** Milestone 3 - Core Business Service
**Status:** In Progress (25% implemented — estrutura base + MySQL + RabbitMQ config prontos)
**Last Updated:** 2026-07-10

## Overview

Implementar o serviço core de negócio em Spring Boot para processar pedidos de forma assíncrona via RabbitMQ. Este serviço é o consumidor da fila `order.created`, responsável por:
- Validar disponibilidade de ingressos no MySQL
- Decrementar estoque com transação ACID
- Atualizar status do pedido para CONFIRMED ou CANCELLED
- Gerenciar o catálogo de eventos no banco de dados

## Estado Atual

A estrutura Spring Boot existe com User CRUD básico. A migração de H2 para MySQL e a configuração do Spring AMQP/RabbitMQ foram concluídas. O próximo passo é criar as entidades Event e Order, repositories, services e o consumer da fila `order.created`.

## Arquivos Existentes (a adaptar)

| Arquivo | Situação |
|---------|----------|
| `backend/src/main/java/.../CrudApplication.java` | Manter — entry point |
| `backend/src/main/java/.../config/CorsConfig.java` | Adaptar — atualizar origens permitidas |
| `backend/src/main/java/.../controller/UserController.java` | Manter como referência — padrão de controller |
| `backend/src/main/java/.../entities/User.java` | Adaptar — simplificar para validação JWT |
| `backend/src/main/java/.../exception/GlobalExceptionHandler.java` | Reusar — já existe |
| `backend/src/main/java/.../repositories/UserRepository.java` | Manter como referência |
| `backend/src/main/java/.../services/UserService.java` | Manter como referência |
| `backend/src/main/resources/application.properties` | ✅ Migrado para MySQL + RabbitMQ |

## Requirements

### Infraestrutura

**REQ-M3-001:** Migração de H2 para MySQL
- Remover dependência H2 do pom.xml
- Configurar MySQL datasource em application.properties
- Credenciais via variáveis de ambiente (${DB_HOST}, ${DB_USER}, etc.)
- Hibernate deve criar/validar schema automaticamente no startup (`spring.jpa.hibernate.ddl-auto=update`)

**REQ-M3-002:** Configuração Spring AMQP (RabbitMQ)
- Adicionar dependência `spring-boot-starter-amqp` no pom.xml
- Configurar conexão com RabbitMQ via application.properties
- Declarar beans: Queue (`order.created`), Exchange (default direct), Binding
- Configurar MessageConverter para JSON (Jackson2JsonMessageConverter)

**REQ-M3-003:** Variáveis de Ambiente
- Todas as credenciais via application.properties com variáveis de ambiente
- Arquivo `.env.example` ou `application-example.properties` documentado

### RF02 — Catálogo de Eventos (Spring Boot)

**REQ-M3-004:** Entidade Event
- JPA Entity `Event` com campos: id, nome, data, local, preco, quantidadeTotal, quantidadeDisponivel, adminId
- Anotações JPA: @Entity, @Table("events"), @Id, @GeneratedValue
- Validações: @NotNull, @NotBlank nos campos obrigatórios

**REQ-M3-005:** EventRepository
- Interface `EventRepository extends JpaRepository<Event, Long>`
- Query customizada: `findByQuantidadeDisponivelGreaterThan(0)` para eventos com ingressos disponíveis
- Query: `findAllByOrderByDataAsc()` para listagem ordenada por data

**REQ-M3-006:** EventService
- Método `findAll()` — retorna lista de eventos disponíveis
- Método `findById(Long id)` — retorna evento ou lança ResourceNotFoundException
- Método `create(EventDTO dto)` — cria novo evento
- Método `decrementInventory(Long eventId, Integer quantity)` — decrementa estoque com verificação (lança InsufficientInventoryException se quantidade < quantity)

**REQ-M3-007:** EventController (opcional, para consulta interna)
- GET /api/events — lista todos os eventos (para eventual uso direto)
- GET /api/events/:id — detalhes do evento

### RF03 — Processamento Assíncrono de Pedidos

**REQ-M3-008:** Entidade Order
- JPA Entity `Order` com campos: id, userId, eventId, quantity, status (enum: PENDING, CONFIRMED, CANCELLED), createdAt, updatedAt
- Status como `@Enumerated(EnumType.STRING)` para legibilidade no MySQL

**REQ-M3-009:** OrderRepository
- Interface `OrderRepository extends JpaRepository<Order, Long>`
- Query: `findByUserId(Long userId)` para histórico de pedidos
- Query: `findByIdAndUserId(Long id, Long userId)` para acesso seguro

**REQ-M3-010:** OrderService
- Método `findById(Long id)` — retorna pedido ou 404
- Método `updateStatus(Long orderId, OrderStatus status)` — atualiza status do pedido

**REQ-M3-011:** RabbitMQ Consumer
- Classe `OrderConsumer` com método anotado com `@RabbitListener(queues = "order.created")`
- Deserializar mensagem JSON: `{ orderId, userId, eventId, quantity }`
- Chamar fluxo de processamento do pedido
- Logar resultado do processamento (confirmado/cancelado)

**REQ-M3-012:** Lógica de Processamento de Pedido com Transação
- Método `@Transactional processOrder(OrderMessage msg)` em OrderService ou OrderConsumer
- Buscar pedido pelo orderId recebido na mensagem
- Verificar disponibilidade de ingressos via EventService.decrementInventory()
- Se disponível: decrementar estoque + atualizar pedido para CONFIRMED
- Se indisponível: atualizar pedido para CANCELLED (sem decrementar estoque)
- Em caso de erro inesperado: rollback automático via @Transactional
- Logar cada etapa do processamento

### RF01 — Validação JWT no Spring Boot (opcional para v1)

**REQ-M3-013:** Configuração JWT (opcional)
- Adicionar dependência JJWT ou spring-security-oauth2-resource-server
- Configurar validação do mesmo JWT_SECRET usado pelo Node.js
- Proteger endpoints Spring Boot que necessitem de autenticação
- Para v1: pode-se optar por deixar Spring Boot sem auth (acessado apenas via RabbitMQ)

## User Stories

**US-M3-001:** Como sistema, quando recebo uma mensagem na fila order.created, quero processar o pedido e decrementar o estoque atomicamente para garantir consistência.

**US-M3-002:** Como sistema, quando não há ingressos disponíveis para o evento, quero marcar o pedido como CANCELLED automaticamente.

**US-M3-003:** Como sistema, quero que erros no processamento façam rollback da transação e o pedido permaneça em estado PENDING para retry.

**US-M3-004:** Como usuário, quero que o status do meu pedido seja atualizado de PENDING para CONFIRMED ou CANCELLED após o processamento.

## Acceptance Criteria

### Infraestrutura
- [ ] `mvn spring-boot:run` inicia sem erros com MySQL e RabbitMQ rodando
- [ ] Hibernate cria tabelas `events` e `orders` no MySQL automaticamente
- [ ] Spring Boot conecta ao RabbitMQ e declara fila `order.created`
- [ ] Logs de startup confirmam conexões estabelecidas

### Consumer RabbitMQ
- [ ] Publicar mensagem na fila order.created dispara o consumer
- [ ] Consumer deserializa JSON corretamente
- [ ] Consumer processa e atualiza status no MySQL

### Transação de Inventário
- [ ] Pedido com estoque disponível: status → CONFIRMED, `quantidadeDisponivel` decrementada
- [ ] Pedido sem estoque: status → CANCELLED, estoque não alterado
- [ ] Dois pedidos simultâneos para último ingresso: apenas um confirmado (race condition handled)
- [ ] Erro inesperado: rollback automático, status permanece PENDING

### Qualidade
- [ ] Nenhuma credencial hardcoded no código
- [ ] Logs de cada etapa do processamento
- [ ] Exceções tratadas com mensagens claras

## Technical Considerations

### Package Structure
```
backend/src/main/java/ortolan/empresa/crud/
├── config/
│   ├── CorsConfig.java          (existente — adaptar)
│   └── RabbitMQConfig.java      (novo)
├── controller/
│   ├── UserController.java      (existente — manter ou remover)
│   └── EventController.java     (novo — opcional)
├── dto/
│   ├── EventDTO.java            (novo)
│   └── OrderMessageDTO.java     (novo)
├── entities/
│   ├── User.java                (existente — simplificar)
│   ├── Event.java               (novo)
│   └── Order.java               (novo)
├── enums/
│   └── OrderStatus.java         (novo)
├── exception/
│   ├── GlobalExceptionHandler.java      (existente)
│   ├── ResourceNotFoundException.java   (existente)
│   └── InsufficientInventoryException.java (novo)
├── messaging/
│   └── OrderConsumer.java       (novo)
├── repositories/
│   ├── UserRepository.java      (existente)
│   ├── EventRepository.java     (novo)
│   └── OrderRepository.java     (novo)
└── services/
    ├── UserService.java         (existente)
    ├── EventService.java        (novo)
    └── OrderService.java        (novo)
```

### application.properties Necessário
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:ticketflow}
spring.datasource.username=${DB_USER:ticketflow}
spring.datasource.password=${DB_PASSWORD:ticketflow123}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USER:admin}
spring.rabbitmq.password=${RABBITMQ_PASS:admin}
```

### Padrão de Transação
O processamento de pedido deve ser @Transactional para garantir atomicidade:
```
BEGIN TRANSACTION
  1. Verificar quantidadeDisponivel >= quantity
  2. UPDATE events SET quantidadeDisponivel = quantidadeDisponivel - quantity
  3. UPDATE orders SET status = 'CONFIRMED'
COMMIT (ou ROLLBACK em caso de erro)
```

## Out of Scope (v1)

- JWT validation no Spring Boot (acesso via RabbitMQ apenas)
- REST endpoints públicos de eventos no Spring Boot (Node.js é o gateway)
- Publicação de mensagem order.completed de volta para Node.js
- Dashboard administrativo
- Relatórios financeiros
- Notificações por email
