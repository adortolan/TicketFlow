# Milestone 3: Core Business Service — Implementation Tasks

**Feature ID:** M3-CORE
**Total Tasks:** 17
**Estimated Complexity:** High (implementação do zero com integração RabbitMQ e transações)

## Task Breakdown

### Task 1: Migrar pom.xml (H2 → MySQL + Spring AMQP)

**What:** Atualizar dependências Maven: remover H2, confirmar MySQL driver e adicionar Spring AMQP
**Where:** `backend/pom.xml`
**Depends on:** Nenhuma
**Reuses:** pom.xml existente
**Done when:**
- Dependência H2 removida
- `spring-boot-starter-data-jpa` presente
- `mysql-connector-j` presente com escopo runtime
- `spring-boot-starter-amqp` adicionado
- `mvn dependency:resolve` executa sem erros
**Tests:** `mvn dependency:resolve` — nenhum erro de resolução
**Gate:** `mvn compile` compila sem erros

---

### Task 2: Migrar application.properties para MySQL

**What:** Substituir configuração H2 por MySQL com variáveis de ambiente
**Where:** `backend/src/main/resources/application.properties`
**Depends on:** Task 1
**Reuses:** Configuração H2 existente como referência
**Done when:**
- `spring.datasource.url` aponta para MySQL com variáveis de ambiente
- `spring.datasource.username` e `password` usam variáveis de ambiente
- `spring.jpa.hibernate.ddl-auto=update` configurado
- `spring.jpa.show-sql=true` para debug
- `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect` configurado
- H2 console config removido
**Tests:** `mvn spring-boot:run` com MySQL rodando — startup sem erros de datasource
**Gate:** Aplicação conecta ao MySQL com sucesso no startup

---

### Task 3: Configurar Spring AMQP (application.properties e RabbitMQConfig)

**What:** Configurar conexão RabbitMQ e declarar fila order.created como Spring Bean
**Where:** `backend/src/main/resources/application.properties` e `backend/src/main/java/.../config/RabbitMQConfig.java`
**Depends on:** Task 2
**Reuses:** CorsConfig.java como referência para estrutura de @Configuration
**Done when:**
- Properties RabbitMQ configuradas (`spring.rabbitmq.host`, port, username, password)
- Classe `RabbitMQConfig.java` criada com anotação `@Configuration`
- Bean `Queue` declarado para `order.created`
- Bean `Jackson2JsonMessageConverter` declarado para serialização JSON
- Bean `RabbitTemplate` configurado com o converter JSON
**Tests:** `mvn spring-boot:run` — log do RabbitMQ confirma conexão e declaração da fila
**Gate:** Aplicação inicia sem erros de AMQP

---

### Task 4: Criar Enum OrderStatus

**What:** Definir enum com os estados possíveis de um pedido
**Where:** `backend/src/main/java/.../enums/OrderStatus.java`
**Depends on:** Task 1
**Reuses:** Padrão de enums Java
**Done when:**
- Enum criado com valores: PENDING, CONFIRMED, CANCELLED
- Pode ser usado como tipo em @Enumerated(EnumType.STRING)
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 5: Criar Entidade Event

**What:** Criar JPA entity Event mapeada para a tabela `events` no MySQL
**Where:** `backend/src/main/java/.../entities/Event.java`
**Depends on:** Task 2
**Reuses:** User.java existente como referência de estrutura JPA
**Done when:**
- Classe anotada com `@Entity`, `@Table(name = "events")`
- Campos: id (Long, @Id, @GeneratedValue), nome (String), data (LocalDateTime), local (String), preco (BigDecimal), quantidadeTotal (Integer), quantidadeDisponivel (Integer), adminId (Long)
- `@Column` com constraints onde necessário
- Getters, setters e construtores gerados
- Tabela `events` criada automaticamente pelo Hibernate no MySQL
**Tests:** `mvn spring-boot:run` — tabela `events` aparece no MySQL
**Gate:** `SHOW TABLES;` no MySQL mostra tabela `events`

---

### Task 6: Criar Entidade Order

**What:** Criar JPA entity Order mapeada para a tabela `orders` no MySQL
**Where:** `backend/src/main/java/.../entities/Order.java`
**Depends on:** Tasks 2, 4
**Reuses:** User.java e Event.java como referência
**Done when:**
- Classe anotada com `@Entity`, `@Table(name = "orders")`
- Campos: id (Long), userId (Long), eventId (Long), quantity (Integer), status (OrderStatus, @Enumerated STRING), createdAt (LocalDateTime, @CreationTimestamp), updatedAt (LocalDateTime, @UpdateTimestamp)
- Tabela `orders` criada pelo Hibernate
**Tests:** `mvn spring-boot:run` — tabela `orders` aparece no MySQL
**Gate:** `SHOW TABLES;` no MySQL mostra tabela `orders`

---

### Task 7: Criar EventRepository

**What:** Criar interface Spring Data JPA para Event
**Where:** `backend/src/main/java/.../repositories/EventRepository.java`
**Depends on:** Task 5
**Reuses:** UserRepository.java existente como referência
**Done when:**
- Interface extends `JpaRepository<Event, Long>`
- Método `List<Event> findAllByOrderByDataAsc()` declarado
- Método `List<Event> findByQuantidadeDisponivelGreaterThan(Integer qtd)` declarado
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 8: Criar OrderRepository

**What:** Criar interface Spring Data JPA para Order
**Where:** `backend/src/main/java/.../repositories/OrderRepository.java`
**Depends on:** Task 6
**Reuses:** UserRepository.java existente como referência
**Done when:**
- Interface extends `JpaRepository<Order, Long>`
- Método `List<Order> findByUserId(Long userId)` declarado
- Método `Optional<Order> findByIdAndUserId(Long id, Long userId)` declarado
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 9: Criar InsufficientInventoryException

**What:** Criar exceção customizada para estoque insuficiente
**Where:** `backend/src/main/java/.../exception/InsufficientInventoryException.java`
**Depends on:** Nenhuma
**Reuses:** ResourceNotFoundException.java existente como referência
**Done when:**
- Classe extends `RuntimeException`
- Construtor aceita `eventId` e `quantity` para mensagem descritiva
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 10: Criar DTO OrderMessageDTO

**What:** Criar classe DTO para deserializar mensagens JSON da fila RabbitMQ
**Where:** `backend/src/main/java/.../dto/OrderMessageDTO.java`
**Depends on:** Nenhuma
**Reuses:** Estrutura de DTO Java
**Done when:**
- Classe com campos: `orderId` (Long), `userId` (Long), `eventId` (Long), `quantity` (Integer)
- Construtor padrão (para deserialização Jackson) e getters/setters
- Corresponde ao payload publicado pelo Node.js: `{ orderId, userId, eventId, quantity }`
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 11: Criar EventService

**What:** Implementar camada de serviço para gerenciamento de eventos
**Where:** `backend/src/main/java/.../services/EventService.java`
**Depends on:** Tasks 5, 7, 9
**Reuses:** UserService.java existente como referência de estrutura
**Done when:**
- Classe anotada com `@Service`
- Método `List<Event> findAll()` — delega para EventRepository.findAllByOrderByDataAsc()
- Método `Event findById(Long id)` — lança ResourceNotFoundException se não encontrado
- Método `@Transactional decrementInventory(Long eventId, Integer quantity)` — busca evento, verifica quantidadeDisponivel >= quantity (lança InsufficientInventoryException se não), decrementa e salva
**Tests:** Testes unitários com Mockito (opcional) ou teste de integração manual após Task 17
**Gate:** Compilação sem erros

---

### Task 12: Criar OrderService

**What:** Implementar camada de serviço para gerenciamento de pedidos
**Where:** `backend/src/main/java/.../services/OrderService.java`
**Depends on:** Tasks 6, 8
**Reuses:** UserService.java existente como referência
**Done when:**
- Classe anotada com `@Service`
- Método `Order findById(Long id)` — lança ResourceNotFoundException se não encontrado
- Método `Order updateStatus(Long orderId, OrderStatus status)` — busca pedido, atualiza status e salva
- Método `List<Order> findByUserId(Long userId)` — delega para repository
**Tests:** Compilação sem erros
**Gate:** Nenhum

---

### Task 13: Criar OrderConsumer (RabbitMQ Listener)

**What:** Implementar consumer da fila order.created
**Where:** `backend/src/main/java/.../messaging/OrderConsumer.java`
**Depends on:** Tasks 3, 10, 11, 12
**Reuses:** Padrão @RabbitListener do Spring AMQP
**Done when:**
- Classe anotada com `@Component`
- Método `processOrder(OrderMessageDTO msg)` anotado com `@RabbitListener(queues = "order.created")`
- Método chama `processOrderTransaction(msg)` do OrderService
- Logs de entrada e saída do processamento
**Tests:** Compilação sem erros — integração testada na Task 16
**Gate:** Nenhum

---

### Task 14: Implementar Lógica Transacional de Processamento

**What:** Implementar método @Transactional que une EventService e OrderService no fluxo de compra
**Where:** `backend/src/main/java/.../services/OrderService.java` (método adicional) ou `OrderConsumer.java`
**Depends on:** Tasks 11, 12, 13
**Reuses:** EventService.decrementInventory(), OrderService.updateStatus()
**Done when:**
- Método `@Transactional processOrderTransaction(OrderMessageDTO msg)`:
  1. Tenta EventService.decrementInventory(eventId, quantity)
  2. Se sucesso: OrderService.updateStatus(orderId, CONFIRMED)
  3. Se InsufficientInventoryException: OrderService.updateStatus(orderId, CANCELLED)
  4. Qualquer RuntimeException inesperada: logar e relançar (Spring faz rollback)
- Logs claros em cada caminho (confirmado, cancelado, erro)
**Tests:** Compilação sem erros — integração testada na Task 16
**Gate:** Nenhum

---

### Task 15: Adaptar GlobalExceptionHandler para Novos Casos

**What:** Adicionar handler para InsufficientInventoryException e garantir formato JSON consistente
**Where:** `backend/src/main/java/.../exception/GlobalExceptionHandler.java`
**Depends on:** Tasks 9
**Reuses:** GlobalExceptionHandler.java existente
**Done when:**
- Handler para `InsufficientInventoryException` retorna 409 com mensagem
- Handler para `ResourceNotFoundException` já existe — verificar que retorna 404
- Todos os erros retornam JSON: `{ "error": "mensagem", "timestamp": "...", "path": "..." }`
**Tests:** Verificação manual que erros retornam JSON correto
**Gate:** Nenhum

---

### Task 16: Testar Consumer RabbitMQ com Node.js

**What:** Validar o fluxo completo: Node.js publica → RabbitMQ → Spring Boot consome e atualiza MySQL
**Where:** Teste de integração manual com ambos os serviços rodando
**Depends on:** Tasks 13, 14 + Node.js do Milestone 2 (Task 7)
**Reuses:** curl para criar pedido via Node.js
**Done when:**
- Criar pedido via POST /api/orders (Node.js) — retorna 202 com status PROCESSING
- Spring Boot consome a mensagem (ver logs do consumer)
- MySQL `orders` table mostra status CONFIRMED (se houver ingressos)
- Chamar GET /api/orders/:id (Node.js) — retorna status CONFIRMED ou CANCELLED
**Tests:**
```bash
# 1. Criar evento (como ADMIN)
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Show Teste","data":"2026-12-01T20:00:00","local":"SP","preco":100,"quantidade":10}'

# 2. Criar pedido (como CLIENTE)
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"quantity":2}'

# 3. Aguardar processamento (~1-2 segundos)

# 4. Consultar status
curl http://localhost:3001/api/orders/1 -H "Authorization: Bearer CLIENTE_TOKEN"
```
**Gate:** Status do pedido muda de PENDING para CONFIRMED ou CANCELLED no MySQL

---

### Task 17: Testar Cenário de Estoque Esgotado

**What:** Validar que o sistema cancela pedidos corretamente quando não há ingressos disponíveis
**Where:** Teste de integração manual
**Depends on:** Task 16
**Reuses:** Mesmos comandos curl da Task 16
**Done when:**
- Criar evento com quantidade 1
- Criar 2 pedidos simultaneamente (ou sequencialmente rápido)
- Primeiro pedido: status CONFIRMED, estoque = 0
- Segundo pedido: status CANCELLED
- Estoque não fica negativo (>= 0)
**Tests:** Verificar diretamente no MySQL: `SELECT * FROM events WHERE id=1; SELECT * FROM orders;`
**Gate:** `quantidadeDisponivel` nunca fica negativa no MySQL

---

## Task Dependencies

```
Task 1 (pom.xml)
└── Task 2 (application.properties MySQL)
    └── Task 3 (RabbitMQ config)
        └── Task 13 (OrderConsumer) ─┐
                                     │
Task 4 (OrderStatus enum)            │
├── Task 5 (Event entity)            │
│   ├── Task 7 (EventRepository)     │
│   │   └── Task 11 (EventService)   │
│   └── Task 9 (InsufficientInventory)│
│                                    │
└── Task 6 (Order entity)            │
    └── Task 8 (OrderRepository)     │
        └── Task 12 (OrderService)───┘
                    │
                    └── Task 14 (Transação) ──► Task 16 (Teste) ──► Task 17 (Estoque)

Task 9 (InsufficientInventoryException) ──► Task 15 (GlobalExceptionHandler)
Task 10 (OrderMessageDTO) ──► Task 13 (OrderConsumer)
```

## Parallel Execution Opportunities

**[P] Tasks 4, 9, 10** — sem dependências entre si, podem ser feitas em paralelo
**[P] Task 5 e Task 6** — podem ser feitas em paralelo após Task 2
**[P] Task 7 e Task 8** — podem ser feitas em paralelo (dependem de 5 e 6 respectivamente)

## Verification Criteria

### Checklist de Testes de Integração
- [ ] `mvn spring-boot:run` inicia sem erros com MySQL e RabbitMQ rodando
- [ ] Tabelas `events` e `orders` criadas automaticamente no MySQL
- [ ] Spring Boot conecta ao RabbitMQ e escuta fila `order.created`
- [ ] Publicar mensagem manualmente no RabbitMQ Management UI dispara consumer
- [ ] Consumer atualiza status no MySQL para CONFIRMED (com estoque)
- [ ] Consumer atualiza status no MySQL para CANCELLED (sem estoque)
- [ ] Estoque decrementa corretamente no MySQL após pedido confirmado
- [ ] Estoque não fica negativo após pedido cancelado
- [ ] Logs do Spring Boot mostram cada etapa do processamento
- [ ] Fluxo completo via Node.js: criar pedido → aguardar → consultar status atualizado

### Build Verification
- [ ] `mvn compile` — sem erros de compilação
- [ ] `mvn spring-boot:run` — startup sem erros
- [ ] Nenhuma credencial hardcoded no código
