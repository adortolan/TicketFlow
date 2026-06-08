# Frontend CRUD

Este é o frontend da aplicação CRUD, desenvolvido com React e Vite.

## Funcionalidades

- Listagem de usuários vindos do backend
- Interface responsiva com tabela de dados
- Tratamento de erros e estados de carregamento

## Pré-requisitos

- Node.js instalado
- Backend rodando em http://localhost:8080

## Como rodar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse http://localhost:5173 no navegador

## API

### Desenvolvimento Local
O frontend consome o endpoint `GET http://localhost:8080/users` que retorna a lista de usuários.

### Docker
No ambiente Docker, o frontend consome o endpoint `GET /api/users` que é proxy pelo nginx para o backend.

## Estrutura do projeto

- `src/App.jsx` - Componente principal com a lógica de fetch e renderização da lista
- `src/index.css` - Estilos globais da aplicação