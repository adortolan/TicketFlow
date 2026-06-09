# Milestone 4: Frontend React — Implementation Tasks

**Feature ID:** M4-FRONTEND
**Total Tasks:** 20
**Estimated Complexity:** High (reescrita completa da UI com auth, eventos e compra)

## Task Breakdown

### Task 1: Remover Componentes User CRUD

**What:** Deletar componentes obsoletos do User CRUD que serão substituídos
**Where:** `frontend/src/components/`
**Depends on:** Nenhuma
**Reuses:** N/A
**Done when:**
- `UserList.jsx` removido
- `UserForm.jsx` removido
- `DeleteConfirmation.jsx` removido
- `LoadingSpinner.jsx` mantido (reusar)
- `ErrorMessage.jsx` mantido (reusar)
**Tests:** `npm run dev` — confirmar que não há imports quebrados
**Gate:** Nenhum (o App.jsx será reescrito na Task 12, então imports ainda podem quebrar antes disso)

---

### Task 2: Criar Módulo de API Centralizado (api.js)

**What:** Criar helper de chamadas HTTP com injeção automática de JWT
**Where:** `frontend/src/api.js`
**Depends on:** Nenhuma
**Reuses:** Padrão fetch do App.jsx atual
**Done when:**
- Arquivo `api.js` criado com todas as funções necessárias:
  - `register(data)` → POST /api/auth/register
  - `login(data)` → POST /api/auth/login
  - `getEvents()` → GET /api/events
  - `getEventById(id)` → GET /api/events/:id
  - `createEvent(data)` → POST /api/events (requer token)
  - `createOrder(data)` → POST /api/orders (requer token)
  - `getOrderById(id)` → GET /api/orders/:id (requer token)
  - `getUserOrders()` → GET /api/orders/user/orders (requer token)
- Função interna `authFetch(url, options)` que injeta `Authorization: Bearer TOKEN` quando token existe no localStorage
- Erros HTTP lançam `Error` com mensagem da resposta JSON (campo `error`)
- `BASE_URL` configurável (padrão: `http://localhost:3001`)
**Tests:** Importar no console do browser e chamar `api.getEvents()` — retorna array
**Gate:** Nenhum

---

### Task 3: Criar AuthContext (Contexto de Autenticação)

**What:** Criar React Context para estado global de autenticação com persistência em localStorage
**Where:** `frontend/src/AuthContext.jsx`
**Depends on:** Nenhuma
**Reuses:** Padrão React Context com hooks
**Done when:**
- `AuthContext` criado com React.createContext()
- `AuthProvider` component que envolve children
- Estado: `token` (string ou null), `user` (objeto decodificado do JWT ou null)
- Funções expostas: `login(token)` e `logout()`
- `login(token)`: salvar token no localStorage, decodificar JWT (atob do payload), setToken e setUser
- `logout()`: remover do localStorage, resetar estado
- `isAuthenticated`: boolean derivado (token !== null)
- `isAdmin`: boolean derivado (user?.role === 'ADMIN')
- Recuperar token do localStorage no useEffect inicial (persistência de sessão)
- Hook customizado `useAuth()` exportado para facilitar uso nos componentes
**Tests:** Adicionar Provider no main.jsx e verificar que useAuth() funciona nos componentes
**Gate:** Nenhum

---

### Task 4: Criar Componente Header/Navbar

**What:** Criar navbar persistente com navegação e informações do usuário
**Where:** `frontend/src/components/Header.jsx`
**Depends on:** Task 3
**Reuses:** useAuth() do AuthContext
**Done when:**
- Header com logo "TicketFlow" à esquerda
- Não autenticado: links "Entrar" e "Cadastrar"
- Autenticado: link "Eventos", link "Meus Pedidos", nome do usuário, botão "Sair"
- Badge "ADMIN" visível para usuários com role ADMIN
- Props: `onNavigate(page)` para mudar a tela atual
- Botão "Sair" chama `logout()` do AuthContext
**Tests:** Render visual — verificar que botões aparecem conforme estado de autenticação
**Gate:** Nenhum

---

### Task 5: Criar Formulário de Login

**What:** Implementar componente de login com validação e integração com api.js
**Where:** `frontend/src/components/LoginForm.jsx`
**Depends on:** Tasks 2, 3
**Reuses:** Padrão de formulário do projeto anterior
**Done when:**
- Campos E-mail e Senha com labels
- Validação: ambos obrigatórios, e-mail com formato válido
- Erros de validação exibidos inline abaixo de cada campo
- Botão "Entrar" desabilitado durante loading
- Loading state com texto "Entrando..."
- Erro de API (401) exibido abaixo do formulário: "E-mail ou senha inválidos"
- Sucesso: chamar `login(token)` do AuthContext + callback `onLoginSuccess()`
- Link "Cadastrar" para navegar ao formulário de registro
**Tests:** Preencher credenciais válidas → login funciona; credenciais inválidas → mensagem de erro
**Gate:** Nenhum

---

### Task 6: Criar Formulário de Registro

**What:** Implementar componente de registro com validação e integração com api.js
**Where:** `frontend/src/components/RegisterForm.jsx`
**Depends on:** Tasks 2, 3
**Reuses:** Padrão de formulário, validações similares ao LoginForm
**Done when:**
- Campos: Nome, E-mail, Senha, CPF
- Validações:
  - Nome: obrigatório, mínimo 2 caracteres
  - E-mail: obrigatório, formato válido
  - Senha: obrigatório, mínimo 6 caracteres
  - CPF: obrigatório, exatamente 11 dígitos numéricos
- Erros de validação inline
- Loading state durante envio
- Erro de API (409) exibido: "E-mail ou CPF já cadastrado"
- Sucesso: exibir mensagem "Conta criada! Faça login para continuar." + callback `onRegisterSuccess()`
- Link "Já tenho conta" para navegar ao login
**Tests:** Registro com dados válidos → mensagem de sucesso; e-mail duplicado → erro 409
**Gate:** Nenhum

---

### Task 7: Adicionar CSS para Formulários de Auth

**What:** Estilizar os formulários de login e registro
**Where:** `frontend/src/index.css`
**Depends on:** Tasks 5, 6
**Reuses:** CSS existente do projeto anterior
**Done when:**
- Container centralizado para formulários auth (max-width, margin auto)
- Estilo de campos de input (border, padding, border-radius)
- Estilo de labels
- Estilo de mensagens de erro inline (cor vermelha)
- Estilo de botão primário (submit)
- Estilo de link de navegação entre login/registro
- Loading state visual (opacidade ou text mudança)
**Tests:** Verificação visual com `npm run dev`
**Gate:** Nenhum

---

### Task 8: Criar Componente EventCard

**What:** Criar card reutilizável para exibir um evento
**Where:** `frontend/src/components/EventCard.jsx`
**Depends on:** Task 3
**Reuses:** useAuth() para saber se usuário pode comprar
**Done when:**
- Card com: nome do evento, data formatada (pt-BR), local, preço (formatado como moeda), ingressos disponíveis
- Badge "Esgotado" quando `quantidadeDisponivel === 0` (estilo vermelho)
- Botão "Comprar" visível apenas para usuários autenticados E com quantidade > 0
- Props: `event` (objeto), `onBuy(eventId)` (callback)
- Estilo de card com borda, padding, hover effect
**Tests:** Render com evento disponível (botão aparece para auth) e esgotado (badge aparece)
**Gate:** Nenhum

---

### Task 9: Criar Componente EventList

**What:** Criar listagem de eventos com carregamento da API
**Where:** `frontend/src/components/EventList.jsx`
**Depends on:** Tasks 2, 8
**Reuses:** api.getEvents(), EventCard, LoadingSpinner, ErrorMessage
**Done when:**
- useEffect busca eventos na API ao montar o componente
- LoadingSpinner durante carregamento
- ErrorMessage com botão "Tentar novamente" em caso de erro
- Lista de EventCard quando eventos carregados
- Mensagem "Nenhum evento disponível" quando lista vazia
- Prop `onBuy(eventId)` passado para cada EventCard
- Prop `onRefresh` para recarregar lista após criar evento
**Tests:** `npm run dev` — lista de eventos aparece (ou mensagem vazia se API sem dados)
**Gate:** npm run dev sem erros de console

---

### Task 10: Criar Formulário de Criação de Evento (Admin)

**What:** Criar formulário para ADMIN criar novos eventos
**Where:** `frontend/src/components/EventForm.jsx`
**Depends on:** Tasks 2, 3
**Reuses:** useAuth() para verificar isAdmin, padrão de formulário
**Done when:**
- Campos: Nome, Data e Hora (input datetime-local), Local, Preço (number), Quantidade (number)
- Validações: todos obrigatórios, preço > 0, quantidade > 0
- Visível apenas quando `isAdmin === true`
- Loading state durante envio
- Sucesso: chamar callback `onEventCreated()` e limpar campos
- Erro: exibir mensagem
- Botão "Adicionar Evento" para abrir e "Cancelar" para fechar
**Tests:** Login como ADMIN → formulário aparece; criar evento → aparece na lista
**Gate:** Nenhum

---

### Task 11: Adicionar CSS para Eventos

**What:** Estilizar a listagem de eventos, cards e formulário de criação
**Where:** `frontend/src/index.css`
**Depends on:** Tasks 8, 9, 10
**Reuses:** CSS existente do projeto
**Done when:**
- Grid de cards responsivo (2-3 colunas em desktop)
- Estilo de EventCard (sombra, border-radius, hover)
- Badge "Esgotado" vermelho
- Estilo do botão "Comprar" (verde, desabilitado quando esgotado)
- Estilo do formulário de criação de evento
- Seção de admin visualmente separada
**Tests:** Verificação visual
**Gate:** Nenhum

---

### Task 12: Criar Componente OrderButton (Seleção e Compra)

**What:** Criar componente para seleção de quantidade e confirmação de compra
**Where:** `frontend/src/components/OrderButton.jsx`
**Depends on:** Tasks 2, 3
**Reuses:** api.createOrder()
**Done when:**
- Estado inicial: botão "Comprar"
- Ao clicar "Comprar": exibe campo de quantidade (min 1, max min(10, disponível)) + botão "Confirmar" + botão "Cancelar"
- Botão "Confirmar" chama api.createOrder com eventId e quantity
- Loading state durante envio
- Sucesso: retornar `orderId` via callback `onOrderCreated(orderId)`
- Erro: exibir mensagem inline
- Props: `eventId`, `maxQuantity`, `onOrderCreated`
**Tests:** Selecionar quantidade e confirmar → orderId retornado via callback
**Gate:** Nenhum

---

### Task 13: Criar Componente OrderStatus (Polling)

**What:** Criar componente que exibe status do pedido com polling automático
**Where:** `frontend/src/components/OrderStatus.jsx`
**Depends on:** Task 2
**Reuses:** api.getOrderById(), LoadingSpinner
**Done when:**
- Recebe `orderId` como prop
- useEffect inicia polling: GET /api/orders/:orderId a cada 2 segundos
- Enquanto status === 'PENDING': exibir spinner + "Seu pedido está sendo processado... (#orderId)"
- Quando status === 'CONFIRMED': exibir mensagem de sucesso (verde) + parar polling
- Quando status === 'CANCELLED': exibir mensagem de cancelamento (vermelho) + parar polling
- Após 30 tentativas (60s): exibir "Tempo esgotado. Verifique seus pedidos." + parar polling
- Botão "Ver Meus Pedidos" após resultado definitivo
- Limpar interval no cleanup do useEffect
**Tests:** Criar pedido via Node.js → componente mostra spinner → status muda para CONFIRMED
**Gate:** Nenhum

---

### Task 14: Criar Componente OrderHistory

**What:** Criar lista do histórico de pedidos do usuário
**Where:** `frontend/src/components/OrderHistory.jsx`
**Depends on:** Tasks 2, 3
**Reuses:** api.getUserOrders(), LoadingSpinner, ErrorMessage
**Done when:**
- useEffect busca pedidos do usuário autenticado
- LoadingSpinner durante carregamento
- Tabela com colunas: Pedido #, Evento ID, Quantidade, Status, Data
- Badge colorido por status: PENDING (amarelo), CONFIRMED (verde), CANCELLED (vermelho)
- Mensagem "Você ainda não fez nenhum pedido" quando lista vazia
- Botão "Atualizar" para recarregar a lista
**Tests:** Login → navegar para Meus Pedidos → lista aparece
**Gate:** Nenhum

---

### Task 15: Adicionar CSS para Pedidos

**What:** Estilizar os componentes de compra e histórico
**Where:** `frontend/src/index.css`
**Depends on:** Tasks 12, 13, 14
**Reuses:** CSS existente
**Done when:**
- Estilo do campo de seleção de quantidade (input number)
- Botão "Confirmar" (azul) e "Cancelar" (cinza)
- Box de status do pedido (spinner, sucesso, erro)
- Tabela de histórico de pedidos
- Badges de status com cores (amarelo, verde, vermelho)
**Tests:** Verificação visual
**Gate:** Nenhum

---

### Task 16: Reescrever App.jsx

**What:** Substituir App.jsx atual pela orquestração completa do TicketFlow
**Where:** `frontend/src/App.jsx`
**Depends on:** Tasks 1-15 (ou ao menos 3, 4, 5, 6, 9, 12, 13, 14)
**Reuses:** Todos os novos componentes
**Done when:**
- App.jsx reescrito completamente (sem referências ao User CRUD)
- `AuthProvider` do AuthContext envolvendo toda a aplicação
- Estado `currentPage` controla qual tela exibir
- Telas implementadas:
  - `'login'`: `<LoginForm onLoginSuccess={() => setCurrentPage('events')} />`
  - `'register'`: `<RegisterForm onRegisterSuccess={() => setCurrentPage('login')} />`
  - `'events'`: `<EventList>` + `<EventForm>` (se admin) + `<OrderButton>` + `<OrderStatus>`
  - `'my-orders'`: `<OrderHistory>`
- `<Header>` sempre visível com `onNavigate` conectado
- Usuário não autenticado acessando 'my-orders': redirecionar para 'login'
- Lógica de seleção de evento e criação de pedido gerenciada no App.jsx
**Tests:** `npm run dev` — aplicação completa funciona sem erros
**Gate:** `npm run dev` e verificar todos os fluxos principais

---

### Task 17: Adaptar main.jsx

**What:** Garantir que main.jsx está configurado corretamente para o novo App
**Where:** `frontend/src/main.jsx`
**Depends on:** Task 16
**Reuses:** main.jsx existente
**Done when:**
- main.jsx importa e renderiza `<App />` (sem mudanças necessárias provavelmente)
- Verificar que `<AuthProvider>` está no lugar certo (App.jsx ou main.jsx)
- Sem React.StrictMode issues com o polling do OrderStatus
**Tests:** `npm run build` — build completa sem erros
**Gate:** `npm run build` sem erros

---

### Task 18: Testar Fluxo de Autenticação

**What:** Validar o fluxo completo de registro → login → logout
**Where:** Browser com `npm run dev`
**Depends on:** Tasks 5, 6, 16
**Reuses:** N/A
**Done when:**
- Cadastro com dados válidos → mensagem de sucesso → redirecionado para login
- Cadastro com e-mail duplicado → mensagem de erro 409
- Login com credenciais válidas → catálogo de eventos carregado → nome no header
- Refresh da página → ainda está logado (localStorage)
- Logout → redirecionado para login, localStorage limpo
**Tests:** Testes manuais no browser
**Gate:** Todos os cenários funcionam conforme esperado

---

### Task 19: Testar Fluxo de Eventos

**What:** Validar catálogo de eventos e criação por admin
**Where:** Browser com `npm run dev` e Node.js rodando
**Depends on:** Tasks 9, 10, 18
**Reuses:** N/A
**Done when:**
- Catálogo visível sem login
- Login como ADMIN → formulário de criação de evento aparece
- Criar evento → aparece na listagem
- Login como CLIENTE → formulário de criação não aparece
- Evento esgotado (quantidade 0) → badge "Esgotado" e sem botão "Comprar"
**Tests:** Testes manuais no browser
**Gate:** Evento criado por ADMIN aparece na lista para todos os usuários

---

### Task 20: Testar Fluxo de Compra Completo

**What:** Validar o fluxo end-to-end de compra com polling de status
**Where:** Browser com `npm run dev`, Node.js e Spring Boot rodando
**Depends on:** Tasks 12, 13, 14, 19 + Milestone 3 completo
**Reuses:** N/A
**Done when:**
- Login como CLIENTE
- Clicar "Comprar" em evento disponível → campo de quantidade aparece
- Confirmar compra → "Processando..." com spinner aparece
- Aguardar 2-5 segundos → status muda para "Confirmado" (se Spring Boot processou)
- Navegar para "Meus Pedidos" → pedido aparece com status CONFIRMED
- Testar compra quando estoque esgotado → status CANCELLED exibido
**Tests:** Testes manuais com toda a stack rodando
**Gate:** Status do pedido atualiza automaticamente via polling sem refresh manual

---

## Task Dependencies

```
Task 1 (Remover User CRUD)
Task 2 (api.js) ────────────────────────────────────────────────────────────────────────┐
Task 3 (AuthContext) ─────────────────────────────────────────────────────────────┐     │
                                                                                   │     │
Task 4 (Header) ◄── Task 3                                                         │     │
Task 5 (LoginForm) ◄── Tasks 2, 3 ──► Task 18 (Teste Auth)                         │     │
Task 6 (RegisterForm) ◄── Tasks 2, 3 ──► Task 18                                   │     │
Task 7 (CSS Auth) ◄── Tasks 5, 6                                                    │     │
                                                                                   │     │
Task 8 (EventCard) ◄── Task 3                                                      │     │
Task 9 (EventList) ◄── Tasks 2, 8 ──► Task 19 (Teste Eventos)                      │     │
Task 10 (EventForm) ◄── Tasks 2, 3 ──► Task 19                                     │     │
Task 11 (CSS Eventos) ◄── Tasks 8, 9, 10                                            │     │
                                                                                   │     │
Task 12 (OrderButton) ◄── Tasks 2, 3                                               │     │
Task 13 (OrderStatus) ◄── Task 2 ──► Task 20 (Teste Compra)                        │     │
Task 14 (OrderHistory) ◄── Tasks 2, 3 ──► Task 20                                  │     │
Task 15 (CSS Pedidos) ◄── Tasks 12, 13, 14                                          │     │
                                                                                   │     │
Task 16 (App.jsx rewrite) ◄── Tasks 3,4,5,6,9,12,13,14 ◄──────────────────────────┘     │
Task 17 (main.jsx) ◄── Task 16                                                           │
Task 18 (Teste Auth) ◄── Tasks 5, 6, 16                                                  │
Task 19 (Teste Eventos) ◄── Tasks 9, 10, 18                                               │
Task 20 (Teste Compra) ◄── Tasks 12, 13, 19 + Milestone 3 ◄──────────────────────────────┘
```

## Parallel Execution Opportunities

**[P] Tasks 1, 2, 3** — independentes, podem ser feitas em paralelo
**[P] Tasks 5, 6** — após Task 3, podem ser feitas em paralelo
**[P] Tasks 8, 10, 12, 13, 14** — após Tasks 2 e 3, podem ser feitas em paralelo
**[P] Tasks 7, 11, 15** — CSS pode ser feito junto com seus componentes

## Verification Criteria

### Checklist de Testes Manuais
- [ ] Visitante vê catálogo de eventos sem login
- [ ] Cadastro com dados válidos — sucesso
- [ ] Cadastro com e-mail duplicado — erro 409
- [ ] Login válido — JWT armazenado, catálogo carregado
- [ ] Login inválido — mensagem de erro
- [ ] Refresh da página — sessão mantida
- [ ] Logout — sessão encerrada, localStorage limpo
- [ ] ADMIN: formulário de criação de evento visível
- [ ] ADMIN: criar evento — aparece na listagem
- [ ] CLIENTE: sem formulário de criação
- [ ] Comprar ingresso — feedback imediato "Processando"
- [ ] Polling atualiza status automaticamente
- [ ] Histórico de pedidos — lista com status corretos

### Build Verification
- [ ] `npm run dev` — sem erros de console
- [ ] `npm run build` — build de produção sem erros
- [ ] `npm run lint` — sem warnings críticos
