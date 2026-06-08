# Backend Node.js - Auth & Gateway Service

Este é o serviço de autenticação e gateway API do projeto TicketFlow, implementado em Node.js com Express.

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
│   │   ├── database.js       # Configuração do MySQL
│   │   └── rabbitmq.js       # Configuração do RabbitMQ
│   ├── controllers/
│   │   ├── authController.js  # Lógica de autenticação
│   │   ├── eventController.js # Lógica de eventos
│   │   └── orderController.js # Lógica de pedidos
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.js           # Modelo de usuário
│   │   ├── Event.js          # Modelo de evento
│   │   └── Order.js          # Modelo de pedido
│   ├── routes/
│   │   ├── authRoutes.js     # Rotas de autenticação
│   │   ├── eventRoutes.js    # Rotas de eventos
│   │   └── orderRoutes.js    # Rotas de pedidos
│   └── server.js             # Entry point da aplicação
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login e geração de token JWT
- `GET /api/auth/profile` - Obter perfil do usuário (requer autenticação)

### Eventos
- `GET /api/events` - Listar todos os eventos
- `GET /api/events/:id` - Obter detalhes de um evento
- `POST /api/events` - Criar novo evento (requer role ADMIN)

### Pedidos
- `POST /api/orders` - Criar novo pedido (requer autenticação)
- `GET /api/orders/:id` - Obter detalhes de um pedido (requer autenticação)
- `GET /api/orders/user/orders` - Listar pedidos do usuário (requer autenticação)

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`

## Instalação e Execução

### Local
```bash
npm install
npm run dev
```

### Docker
```bash
docker build -t backend-node .
docker run -p 3001:3001 --env-file .env backend-node
```

### Via Docker Compose (com todo o ecossistema)
```bash
docker-compose up backend-node
```

## Dependências Principais

- `express` - Framework web
- `jsonwebtoken` - Geração e validação de tokens JWT
- `bcrypt` - Hash de senhas
- `mysql2` - Cliente MySQL
- `amqplib` - Cliente RabbitMQ
- `cors` - Middleware CORS
- `dotenv` - Gerenciamento de variáveis de ambiente
- `express-validator` - Validação de requisições

## Fluxo de Trabalho

1. **Registro/Login**: Usuário se registra ou faz login através do Node.js
2. **Token JWT**: Node.js gera e retorna um token JWT
3. **Requisições Autenticadas**: Frontend envia o token no header Authorization
4. **Criação de Pedido**: Quando um usuário compra um ingresso, o Node.js:
   - Salva o pedido como "PENDING" no MySQL
   - Publica uma mensagem na fila `order.created` do RabbitMQ
5. **Processamento Assíncrono**: O serviço Spring Boot consome a mensagem e processa o pedido
