# CRUD Monorepo

Monorepo contendo backend Spring Boot e frontend React.

## Estrutura do Projeto

```
crud/
├── backend/          # Backend Spring Boot (Java)
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── .mvn/
├── frontend/         # Frontend React (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── package.json      # Scripts do monorepo
└── README.md
```

## Scripts Disponíveis

### Backend
- `npm run backend:install` - Instala dependências do backend (Maven)
- `npm run backend:run` - Executa o backend Spring Boot
- `npm run backend:test` - Executa testes do backend

### Frontend
- `npm run frontend:install` - Instala dependências do frontend (npm)
- `npm run frontend:dev` - Executa o frontend em modo desenvolvimento
- `npm run frontend:build` - Build do frontend para produção
- `npm run frontend:test` - Executa lint do frontend

### Monorepo
- `npm run install:all` - Instala dependências de ambos os projetos
- `npm run dev` - Executa backend e frontend simultaneamente
- `npm run build:all` - Build de ambos os projetos

## Como Usar

1. **Instalar dependências:**
   ```bash
   npm run install:all
   ```

2. **Executar ambos os serviços:**
   ```bash
   npm run dev
   ```

   - Backend: http://localhost:8080
   - Frontend: http://localhost:3000

3. **Executar individualmente:**
   ```bash
   # Apenas backend
   npm run backend:run

   # Apenas frontend
   npm run frontend:dev
   ```

## Configuração

### Desenvolvimento Local
O frontend está configurado com proxy para o backend em `frontend/vite.config.js`:
- Requisições para `/api` são redirecionadas para `http://localhost:8080`

### Docker
O frontend usa nginx como proxy reverso para o backend:
- Requisições para `/api/` são redirecionadas para `http://backend:8080/`
- O backend tem healthcheck configurado para garantir que está pronto antes do frontend iniciar

## Docker

Para rodar a aplicação completa com Docker:

```bash
docker-compose up --build
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

Para parar os containers:
```bash
docker-compose down
```
