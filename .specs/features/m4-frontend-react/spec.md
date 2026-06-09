# Milestone 4: Frontend React — TicketFlow UI

**Feature ID:** M4-FRONTEND
**Milestone:** Milestone 4 - Frontend React
**Status:** Planned (10% — componentes User CRUD existem mas serão substituídos)
**Last Updated:** 2026-06-09

## Overview

Reimplementar o frontend React como interface completa do TicketFlow, substituindo o User CRUD atual. O App.jsx será reescrito do zero para orquestrar os novos fluxos:
- Autenticação (registro, login, logout com JWT)
- Catálogo de eventos (público)
- Fluxo de compra assíncrona com polling de status
- Histórico de pedidos do usuário

O frontend se comunica exclusivamente com o Node.js Auth & Gateway Service (porta 3001).

## Estado Atual

O frontend possui componentes de User CRUD (UserList, UserForm, DeleteConfirmation, ErrorMessage, LoadingSpinner) que serão descartados ou adaptados. O App.jsx atual também será substituído.

## Componentes a Remover/Substituir

| Componente | Ação |
|-----------|------|
| `frontend/src/components/UserList.jsx` | Remover |
| `frontend/src/components/UserForm.jsx` | Remover |
| `frontend/src/components/DeleteConfirmation.jsx` | Remover |
| `frontend/src/components/ErrorMessage.jsx` | Reusar/adaptar |
| `frontend/src/components/LoadingSpinner.jsx` | Reusar |
| `frontend/src/App.jsx` | Reescrever completamente |

## Requirements

### RF01 — Autenticação no Frontend

**REQ-M4-001:** Serviço de API (api.js)
- Módulo centralizado para todas as chamadas HTTP ao Node.js
- Funções: `register(data)`, `login(data)`, `getEvents()`, `getEventById(id)`, `createEvent(data)`, `createOrder(data)`, `getOrderById(id)`, `getUserOrders()`
- Injetar automaticamente header `Authorization: Bearer <TOKEN>` quando token disponível
- Tratar erros HTTP (4xx, 5xx) lançando erro com mensagem legível

**REQ-M4-002:** Contexto de Autenticação (AuthContext)
- React Context para estado global de autenticação
- Estado: `user` (dados do JWT decodificado), `token` (string JWT), `isAuthenticated` (boolean), `isAdmin` (boolean)
- Funções: `login(token)`, `logout()`
- Persistência no localStorage: salvar/recuperar token entre sessões
- Provider envolve toda a aplicação no App.jsx

**REQ-M4-003:** Formulário de Registro
- Campos: Nome, E-mail, Senha, CPF
- Validações: todos obrigatórios, formato de e-mail, CPF numérico (11 dígitos), senha mínima 6 caracteres
- Envio: POST /api/auth/register via api.js
- Sucesso: redirecionar para tela de login com mensagem de sucesso
- Erro: exibir mensagem de erro inline (409 para e-mail/CPF duplicado, etc.)
- Loading state durante envio

**REQ-M4-004:** Formulário de Login
- Campos: E-mail, Senha
- Validações: todos obrigatórios, formato de e-mail
- Envio: POST /api/auth/login via api.js
- Sucesso: armazenar JWT no AuthContext + localStorage, redirecionar para catálogo de eventos
- Erro: exibir "E-mail ou senha inválidos" — 401
- Loading state durante envio

**REQ-M4-005:** Botão de Logout
- Disponível quando usuário está autenticado (header/navbar)
- Ao clicar: limpar AuthContext e localStorage, redirecionar para tela de login

### RF02 — Catálogo de Eventos

**REQ-M4-006:** Listagem de Eventos (Pública)
- Exibir lista de eventos disponíveis (GET /api/events)
- Acessível sem autenticação
- Cada card de evento: nome, data formatada, local, preço, ingressos disponíveis
- Loading state enquanto carrega
- Estado vazio: "Nenhum evento disponível"
- Estado de erro com botão de retry

**REQ-M4-007:** Card de Evento
- Componente reutilizável `EventCard` para exibir um evento
- Props: evento (objeto com todos os campos)
- Exibir badge "Esgotado" quando quantidadeDisponivel = 0
- Botão "Comprar" visível apenas para usuários autenticados com quantidade > 0

**REQ-M4-008:** Formulário de Criação de Evento (Admin)
- Visível apenas para usuários com role ADMIN
- Campos: Nome, Data (datetime-local input), Local, Preço (number), Quantidade de Ingressos (number)
- Validações: todos obrigatórios, preço > 0, quantidade > 0
- Envio: POST /api/events com JWT ADMIN
- Sucesso: fechar form e atualizar listagem de eventos
- Erro: exibir mensagem de erro

### RF03 — Fluxo de Compra

**REQ-M4-009:** Botão e Seleção de Quantidade
- Ao clicar "Comprar" no EventCard, exibir campo de quantidade (1 a min(10, disponível))
- Botão "Confirmar Compra" para enviar pedido
- Botão "Cancelar" para fechar sem comprar

**REQ-M4-010:** Criação de Pedido e Feedback Imediato
- Enviar POST /api/orders com eventId e quantity
- Exibir imediatamente: "Seu pedido está sendo processado..." com orderId
- Iniciar polling de status (GET /api/orders/:id a cada 2 segundos)
- Mostrar spinner durante polling

**REQ-M4-011:** Polling de Status do Pedido
- Verificar status do pedido a cada 2 segundos (máximo 30 tentativas = 60 segundos)
- Quando status mudar de PENDING para CONFIRMED: exibir "Pedido Confirmado! Ingresso garantido."
- Quando status mudar de PENDING para CANCELLED: exibir "Pedido Cancelado — ingressos esgotados."
- Após 60 segundos sem resposta: exibir "Tempo esgotado. Verifique seu histórico de pedidos."
- Parar polling quando status for CONFIRMED ou CANCELLED

**REQ-M4-012:** Histórico de Pedidos
- Página/seção com lista de pedidos do usuário autenticado (GET /api/orders/user/orders)
- Para cada pedido: evento (buscar nome), quantidade, status (com badge colorido), data
- Status: PENDING (amarelo), CONFIRMED (verde), CANCELLED (vermelho)
- Acessível via link "Meus Pedidos" no header

### Navegação e Layout

**REQ-M4-013:** Roteamento de Telas (sem React Router)
- Implementar navegação por estado no App.jsx (sem biblioteca de roteamento)
- Telas: `login`, `register`, `events` (catálogo), `my-orders` (histórico)
- Header com link para catálogo, "Meus Pedidos" (se autenticado), nome do usuário, botão logout

**REQ-M4-014:** Header/Navbar
- Sempre visível
- Lado esquerdo: logo "TicketFlow"
- Lado direito (não autenticado): links "Login" e "Cadastrar"
- Lado direito (autenticado): "Meus Pedidos", nome do usuário, botão "Sair"
- Indicação visual para usuários ADMIN

## User Stories

**US-M4-001:** Como visitante, quero visualizar a lista de eventos disponíveis sem precisar fazer login.

**US-M4-002:** Como visitante, quero me cadastrar com nome, e-mail, senha e CPF para criar minha conta.

**US-M4-003:** Como usuário cadastrado, quero fazer login e ser redirecionado para o catálogo de eventos.

**US-M4-004:** Como usuário autenticado, quero clicar em "Comprar" em um evento e receber confirmação imediata do meu pedido.

**US-M4-005:** Como usuário autenticado, quero ver o status do meu pedido atualizar automaticamente de "Processando" para "Confirmado" ou "Cancelado".

**US-M4-006:** Como usuário autenticado, quero visualizar o histórico de todos os meus pedidos com seus status.

**US-M4-007:** Como usuário ADMIN, quero criar novos eventos com nome, data, local, preço e quantidade de ingressos.

## Acceptance Criteria

### Autenticação
- [ ] Visitante vê catálogo de eventos sem login
- [ ] Formulário de registro valida campos e cria conta (201)
- [ ] Formulário de registro exibe erro para e-mail duplicado
- [ ] Formulário de login retorna JWT e redireciona para catálogo
- [ ] Formulário de login exibe erro para credenciais inválidas
- [ ] Token JWT persiste após refresh da página (localStorage)
- [ ] Logout limpa token e redireciona para login

### Eventos
- [ ] Catálogo carrega eventos da API sem autenticação
- [ ] Loading spinner exibe durante carregamento
- [ ] EventCard mostra nome, data, local, preço, disponibilidade
- [ ] Botão "Comprar" visível apenas para usuários autenticados
- [ ] Badge "Esgotado" para eventos sem ingressos
- [ ] Admin vê formulário de criação de evento
- [ ] Admin cria evento e ele aparece na listagem

### Compra
- [ ] Clicar "Comprar" exibe campo de quantidade e botão confirmar
- [ ] Confirmar compra exibe "Processando..." imediatamente
- [ ] Status atualiza automaticamente via polling
- [ ] Exibe "Confirmado" ou "Cancelado" conforme processamento
- [ ] Polling para após resultado definitivo

### Histórico
- [ ] "Meus Pedidos" lista todos os pedidos do usuário
- [ ] Status exibido com badge colorido
- [ ] Pedidos ordenados do mais recente para o mais antigo

## Technical Considerations

### Estrutura de Componentes
```
frontend/src/
├── api.js                    (novo — serviço de API centralizado)
├── AuthContext.jsx            (novo — contexto de autenticação)
├── App.jsx                   (reescrever — orquestrador principal)
├── main.jsx                  (manter — entry point)
├── index.css                 (adaptar — adicionar novos estilos)
└── components/
    ├── LoadingSpinner.jsx    (manter/reusar)
    ├── ErrorMessage.jsx      (manter/reusar)
    ├── Header.jsx            (novo — navbar)
    ├── LoginForm.jsx         (novo)
    ├── RegisterForm.jsx      (novo)
    ├── EventList.jsx         (novo)
    ├── EventCard.jsx         (novo)
    ├── EventForm.jsx         (novo — admin)
    ├── OrderButton.jsx       (novo — botão + seleção de quantidade)
    ├── OrderStatus.jsx       (novo — polling e exibição de resultado)
    └── OrderHistory.jsx      (novo)
```

### Estado de Navegação no App.jsx
```jsx
// Telas possíveis como estado
const [currentPage, setCurrentPage] = useState('events');
// 'login' | 'register' | 'events' | 'my-orders'
```

### Lógica de Polling
```jsx
// useEffect com setInterval para polling
useEffect(() => {
  if (!orderId || orderStatus !== 'PENDING') return;
  const interval = setInterval(async () => {
    const order = await api.getOrderById(orderId);
    if (order.status !== 'PENDING') {
      setOrderStatus(order.status);
      clearInterval(interval);
    }
  }, 2000);
  return () => clearInterval(interval);
}, [orderId, orderStatus]);
```

### Decodificar JWT no Frontend
```js
// Sem biblioteca extra — usar atob para decodificar payload
const decodeToken = (token) => {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
};
```

## Out of Scope

- React Router (usar navegação por estado)
- Biblioteca de UI (Material UI, Tailwind, etc.)
- Biblioteca de formulários (react-hook-form)
- Biblioteca de notificações (react-toastify)
- Paginação na listagem de eventos
- Busca/filtro de eventos
- Upload de imagem para eventos
- Página de detalhes de evento (usar modal ou expansão inline)
- Responsividade mobile avançada
