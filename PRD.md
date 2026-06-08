Para unir **Spring Boot**, **Node.js**, **React**, **MySQL** e **RabbitMQ** em um único projeto de estudos, o segredo é criar um cenário de **microsserviços** ou de **arquitetura orientada a eventos**. Se colocássemos tudo em um monólito, algumas tecnologias ficariam redundantes (como ter Spring Boot e Node.js fazendo a mesma coisa).

A melhor ideia para esse ecossistema é um **Sistema de Gestão de Eventos e Venda de Ingressos (Estilo Ticketmaster/Sympla)**.

Aqui está o porquê essa ideia funciona perfeitamente para as suas tecnologias:

* **React:** O portal onde o usuário compra o ingresso e vê o painel.
* **Node.js (API de Alta Performance / Notificações):** Um microsserviço rápido responsável por processar o checkout e gerenciar o envio de notificações em tempo real.
* **Spring Boot (Core Business / Processamento):** O microsserviço robusto que cuida das regras de negócio pesadas, validação de estoque de ingressos e relatórios financeiros.
* **RabbitMQ:** O mensageiro que garante que, quando um usuário compra um ingresso no Node.js, o Spring Boot seja avisado para dar baixa no estoque, e vice-versa, sem travar a aplicação.
* **MySQL:** Banco de dados relacional para garantir a consistência de usuários, eventos e compras (ACID).
* **JWT:** Garante que o usuário faça login uma vez e navegue de forma segura entre o front-end e os diferentes microsserviços.

---

# Product Requirement Document (PRD) — Projeto "TicketFlow"

## 1. Visão Geral do Produto

O **TicketFlow** é uma plataforma web para descoberta de eventos e compra de ingressos. O objetivo principal deste projeto de estudos é aplicar padrões de arquitetura distribuída, comunicação assíncrona entre serviços e segurança com tokens descentralizados.

## 2. Escopo do Ecossistema Técnico

Para o projeto fazer sentido, a arquitetura será dividida da seguinte forma:

```
[ React Front-end ] 
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
       └──► [ MySQL (ou DB Isolado) ]

```

* **Front-end (React):** Interface do usuário (Login, Cadastro, Listagem de Eventos e Carrinho de Compras).
* **Auth & Gateway Service (Node.js + Express):** Responsável pelo cadastro de usuários, login, geração do token JWT e recepção inicial dos pedidos de compra.
* **Mensageria (RabbitMQ):** Fila `order.created` para processamento de compras e `user.registered` para e-mails de boas-vindas.
* **Core Business Service (Spring Boot):** Consome a fila de compras, valida a disponibilidade do ingresso no banco de dados, processa a baixa e gera o bilhete final.

---

## 3. Requisitos Funcionais (RF)

### RF01 – Gestão de Usuários (Autenticação JWT)

* O sistema deve permitir que novos usuários se cadastrem (Nome, E-mail, Senha, CPF).
* O sistema deve permitir o login de usuários e retornar um token JWT válido.
* O token JWT deve conter claims básicos (ID do usuário, email e role: `CLIENTE` ou `ADMIN`).
* Tanto o serviço Node.js quanto o Spring Boot devem ser capazes de validar o JWT para proteger suas rotas.

### RF02 – Catálogo de Eventos

* Apenas usuários `ADMIN` podem criar novos eventos (Nome, Data, Local, Preço, Quantidade de Ingressos Disponíveis).
* Qualquer usuário (autenticado ou não) pode visualizar a lista de eventos disponíveis.

### RF03 – Fluxo de Compra Assíncrona

* O usuário logado escolhe um ingresso e clica em "Comprar".
* A API em **Node.js** recebe a requisição, salva um registro temporário de "Pedido Pendente" no MySQL e posta uma mensagem no **RabbitMQ** com os dados da compra.
* A API retorna imediatamente um status de "Processando" para o front-end React.
* O serviço **Spring Boot** consome a mensagem do RabbitMQ, verifica se ainda há ingressos disponíveis no MySQL e atualiza o status do pedido para "Confirmado" ou "Cancelado (Esgotado)".

---

## 4. Requisitos Não-Funcionais (RNF)

* **Segurança:** As senhas dos usuários devem ser criptografadas no MySQL utilizando BCrypt.
* **Disponibilidade/Assincronismo:** Se o serviço Spring Boot estiver fora do ar, o usuário ainda deve conseguir clicar em comprar no React, e o Node.js deve conseguir reter o pedido na fila do RabbitMQ sem estourar erro na tela.
* **Persistência:** Utilizar o MySQL com tabelas devidamente relacionadas (Users, Events, Orders). Você pode optar por usar um único banco com schemas separados ou instâncias separadas para simular microsserviços reais.

---

## 5. Casos de Uso Principais para Desenvolver

Para guiar o seu desenvolvimento técnico, foque em finalizar estes três fluxos:

### Fluxo 1: O Primeiro Acesso (Foco em JWT e Segurança)

1. Usuário acessa o React, preenche o cadastro e clica em Entrar.
2. Node.js valida as credenciais no MySQL, gera o JWT e devolve ao React.
3. O React armazena esse token (ex: `localStorage` ou `cookies`) e o envia no Header (`Authorization: Bearer <TOKEN>`) de todas as próximas requisições.

### Fluxo 2: A Compra Pesada (Foco em RabbitMQ)

1. Usuário clica em comprar. O Node.js valida o JWT enviado pelo React.
2. Node.js joga o payload `{ userId: 1, eventId: 42, quantity: 2 }` para a exchange do RabbitMQ.
3. Spring Boot, que está "escutando" aquela fila, captura o objeto, abre uma transação no banco, decrementa o estoque do evento e gera o ticket.

---