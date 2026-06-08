# TicketFlow - Sistema de Gestão de Eventos e Venda de Ingressos

Monorepo contendo backend Spring Boot, backend Node.js (Auth/Gateway), frontend React, MySQL e RabbitMQ para implementação de arquitetura de microsserviços orientada a eventos.

## Visão Geral

O TicketFlow é uma plataforma para descoberta de eventos e compra de ingressos que utiliza:
- **React**: Interface do usuário para navegação e compra
- **Node.js**: API Gateway responsável por autenticação JWT e recepção de pedidos
- **Spring Boot**: Core Business Service para processamento pesado e validação de estoque
- **RabbitMQ**: Mensageria para comunicação assíncrona entre serviços
- **MySQL**: Banco de dados relacional para persistência

## Arquitetura

```
[ React Frontend ] 
       │
       ├─► (Autenticação JWT & Cadastro) ─► [ Node.js API Gateway ] ──► [ MySQL ]
       │                                             │
       │                                        (Publica Evento)
       │                                             │
       │                                             ▼
       │                                      [ RabbitMQ Queue ]
       │                                             │
       │                                        (Consome Evento)
       │                                             │
       ▼                                             ▼
[ Spring Boot Core Service ] ◄───────────────────────┘
       │
       └──► [ MySQL ]
```

## Estrutura do Projeto

```
crud/
├── backend/          # Backend Spring Boot (Java) - Core Business Service
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── .mvn/
├── backend-node/     # Backend Node.js - Auth & Gateway Service
│   ├── src/
│   │   ├── config/       # Database e RabbitMQ config
│   │   ├── controllers/  # Auth, Events, Orders controllers
│   │   ├── middleware/   # JWT authentication
│   │   ├── models/       # User, Event, Order models
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/         # Frontend React (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── package.json      # Scripts do monorepo
├── docker-compose.yml # Orquestração de containers
├── init.sql          # Script de inicialização do banco
└── README.md
```

## Scripts Disponíveis

### Backend (Spring Boot)
- `npm run backend:install` - Instala dependências do backend (Maven)
- `npm run backend:run` - Executa o backend Spring Boot
- `npm run backend:test` - Executa testes do backend

### Backend Node.js (Auth/Gateway)
- `npm run backend-node:install` - Instala dependências do backend-node (npm)
- `npm run backend-node:run` - Executa o backend-node em modo desenvolvimento (nodemon)
- `npm run backend-node:start` - Executa o backend-node em modo produção
- `npm run backend-node:test` - Executa testes do backend-node

### Frontend (React)
- `npm run frontend:install` - Instala dependências do frontend (npm)
- `npm run frontend:dev` - Executa o frontend em modo desenvolvimento
- `npm run frontend:build` - Build do frontend para produção
- `npm run frontend:test` - Executa lint do frontend

### Monorepo
- `npm run install:all` - Instala dependências de todos os projetos
- `npm run dev` - Executa backend Spring Boot, backend-node e frontend simultaneamente
- `npm run dev:backend` - Executa apenas os backends (Spring Boot e Node.js)
- `npm run build:all` - Build de backend e frontend

## Como Usar

### Opção 1: Docker Compose (Recomendado)

Esta opção inicia todos os serviços (MySQL, RabbitMQ, Spring Boot, Node.js, React) com a configuração correta:

1. **Iniciar todos os serviços:**
   ```bash
   docker-compose up --build
   ```

2. **Acessar os serviços:**
   - Frontend (React): http://localhost:3000
   - Backend Node.js (Auth/Gateway): http://localhost:3001
   - Backend Spring Boot (Core): http://localhost:8080
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - MySQL: localhost:3306 (root/root)

3. **Parar os serviços:**
   ```bash
   docker-compose down
   ```

### Opção 2: Desenvolvimento Local

Para desenvolvimento local, você precisará ter MySQL e RabbitMQ rodando separadamente.

1. **Instalar dependências:**
   ```bash
   npm run install:all
   ```

2. **Configurar variáveis de ambiente do backend-node:**
   ```bash
   cd backend-node
   cp .env.example .env
   # Edite o arquivo .env com suas configurações locais
   cd ..
   ```

3. **Executar todos os serviços:**
   ```bash
   npm run dev
   ```

   - Backend Spring Boot: http://localhost:8080
   - Backend Node.js: http://localhost:3001
   - Frontend: http://localhost:3000

4. **Executar apenas os backends:**
   ```bash
   npm run dev:backend
   ```

5. **Executar serviços individualmente:**
   ```bash
   # Apenas backend Spring Boot
   npm run backend:run

   # Apenas backend Node.js
   npm run backend-node:run

   # Apenas frontend
   npm run frontend:dev
   ```

## Configuração

### Backend Node.js
O serviço `backend-node` requer configuração via variáveis de ambiente. Copie o arquivo `.env.example` para `.env` e configure:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ticketflow
DB_USER=root
DB_PASSWORD=root
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE_ORDER_CREATED=order.created
RABBITMQ_QUEUE_USER_REGISTERED=user.registered
```

### Backend Spring Boot
O Spring Boot se conecta ao MySQL e RabbitMQ automaticamente quando executado via Docker Compose. Para desenvolvimento local, configure em `backend/src/main/resources/application.properties`.

### Frontend
O frontend está configurado com proxy para o backend-node em `frontend/vite.config.js`:
- Requisições para `/api` são redirecionadas para `http://localhost:3001`

### Docker
No Docker Compose, o frontend usa nginx como proxy reverso:
- Requisições para `/api/` são redirecionadas para `http://backend-node:3001/`
- Todos os serviços têm healthchecks configurados para garantir dependências

## API Endpoints

### Backend Node.js (Auth/Gateway) - Porta 3001

#### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login e geração de token JWT
- `GET /api/auth/profile` - Obter perfil do usuário (requer autenticação)

#### Eventos
- `GET /api/events` - Listar todos os eventos
- `GET /api/events/:id` - Obter detalhes de um evento
- `POST /api/events` - Criar novo evento (requer role ADMIN)

#### Pedidos
- `POST /api/orders` - Criar novo pedido (requer autenticação)
- `GET /api/orders/:id` - Obter detalhes de um pedido (requer autenticação)
- `GET /api/orders/user/orders` - Listar pedidos do usuário (requer autenticação)

### Backend Spring Boot (Core) - Porta 8080

O Spring Boot consome mensagens do RabbitMQ e processa pedidos de forma assíncrona. Ele também expõe endpoints para relatórios e administração.

## Fluxo de Trabalho

1. **Autenticação**: Usuário se registra ou faz login via Node.js API Gateway
2. **Token JWT**: Node.js gera e retorna um token JWT
3. **Navegação**: Frontend envia o token no header `Authorization: Bearer <TOKEN>`
4. **Compra de Ingresso**:
   - Usuário seleciona evento e quantidade
   - Node.js salva pedido como "PENDING" no MySQL
   - Node.js publica mensagem na fila `order.created` do RabbitMQ
   - Spring Boot consome a mensagem, valida estoque e atualiza status
5. **Resultado**: Frontend consulta status do pedido periodicamente

## Tecnologias

- **Frontend**: React 18, Vite
- **Backend Node.js**: Express, JWT, BCrypt, MySQL2, AMQP
- **Backend Spring Boot**: Spring Boot, Spring Data JPA, Spring AMQP
- **Banco de Dados**: MySQL 8.0
- **Mensageria**: RabbitMQ 3.12
- **Containerização**: Docker, Docker Compose
