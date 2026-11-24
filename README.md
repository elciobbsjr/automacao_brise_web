# Brise | Monitoramento e Controle de Climatização

Aplicação web para monitoramento e controle dos equipamentos de climatização integrados à API Brise, utilizada no contexto operacional do TRE-MA e da SEMEQ.

O sistema reúne consulta de dispositivos, acompanhamento de condições operacionais, envio de comandos, gerenciamento de agendamentos e administração de usuários em uma única interface.

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Perfis e permissões](#perfis-e-permissões)
- [Tecnologias](#tecnologias)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Instalação e execução local](#instalação-e-execução-local)
- [Banco de dados](#banco-de-dados)
- [Comandos disponíveis](#comandos-disponíveis)
- [Integração com a API Brise](#integração-com-a-api-brise)
- [Deploy](#deploy)
- [Segurança e boas práticas](#segurança-e-boas-práticas)

---

## Visão geral

O Brise oferece uma interface centralizada para consultar os equipamentos vinculados à conta de integração, acompanhar informações operacionais e executar ações conforme o nível de acesso do usuário.

A aplicação utiliza a API Brise para obter dados dos dispositivos e encaminhar operações de controle. Os dados de usuários e os registros de auditoria são persistidos em PostgreSQL por meio do Prisma ORM.

A comunicação com a API externa é realizada no servidor Next.js. O navegador interage com rotas internas da aplicação, evitando expor diretamente credenciais de integração.

## Funcionalidades

### Monitoramento de dispositivos

- Listagem dos equipamentos disponíveis na integração.
- Consulta de informações de configuração, variáveis e parâmetros.
- Apresentação de condições de comunicação dos equipamentos.
- Organização e filtragem dos dispositivos na interface.
- Consulta individual de informações e parâmetros do equipamento.

### Controle de climatização

- Envio de comandos e atualização de parâmetros do equipamento.
- Controles de operação disponibilizados pela interface.
- Consulta posterior dos parâmetros para verificar a confirmação do comando.

> A disponibilidade de cada operação depende das permissões do usuário, da comunicação com o equipamento e das capacidades oferecidas pela API Brise.

### Agendamentos

- Consulta dos agendamentos.
- Criação de agendamentos em lote para equipamentos selecionados.
- Edição, ativação, desativação e exclusão de agendamentos.
- Retorno dos resultados das operações realizadas nos dispositivos.

### Notificações e atualização de informações

- Notificações relacionadas às condições dos equipamentos.
- Consulta e atualização de informações do painel.
- Estratégias de concorrência e cache para reduzir chamadas desnecessárias à API externa.

### Administração

- Autenticação por e-mail e senha.
- Gerenciamento de usuários.
- Edição de dados e permissões.
- Ativação e desativação de contas.
- Redefinição de senha.
- Histórico de auditoria das operações registradas.

---

## Perfis e permissões

O sistema possui três perfis de acesso:

| Perfil | Permissões |
|---|---|
| **VIEWER** | Consultar informações e visualizar os dispositivos. |
| **OPERATOR** | Consultar, controlar equipamentos e gerenciar agendamentos. |
| **ADMIN** | Todas as permissões do operador, além da administração de usuários e recursos administrativos. |

As permissões são verificadas no servidor, tanto nas páginas protegidas quanto nas rotas de API.

## Tecnologias

| Tecnologia | Utilização |
|---|---|
| [Next.js 16](https://nextjs.org/) | Framework da aplicação web e rotas de servidor |
| [React 19](https://react.dev/) | Construção da interface |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização da interface |
| [Auth.js / NextAuth 5](https://authjs.dev/) | Autenticação e sessões |
| [Prisma 7](https://www.prisma.io/) | ORM e acesso ao banco de dados |
| [PostgreSQL](https://www.postgresql.org/) | Persistência de usuários e auditoria |
| [Neon](https://neon.tech/) | Hospedagem PostgreSQL utilizada na configuração do projeto |
| [Vercel](https://vercel.com/) | Plataforma de deploy |

## Arquitetura do projeto

A aplicação está organizada por responsabilidades:

```text
src/
├── app/
│   ├── admin/                 # Páginas administrativas
│   ├── api/
│   │   ├── auth/              # Rotas de autenticação
│   │   └── brise/             # Endpoints internos da integração
│   ├── dispositivos/          # Visualização individual de dispositivos
│   ├── login/                 # Tela de autenticação
│   ├── layout.tsx             # Layout raiz e metadados
│   └── page.tsx               # Painel principal
│
├── components/
│   ├── dashboard/             # Componentes do painel
│   ├── device/                # Componentes de dispositivos e controles
│   ├── schedule/              # Componentes de agendamentos
│   └── user/                  # Componentes de usuário
│
├── features/
│   ├── audit/                 # Serviços de auditoria
│   ├── auth/                  # Autenticação, permissões e validações
│   └── users/                 # Operações e componentes de usuários
│
├── lib/                       # Integrações e infraestrutura
├── services/                  # Serviços de negócio e integração Brise
├── types/                     # Tipos compartilhados
├── constants/                 # Constantes da aplicação
└── utils/                     # Funções utilitárias

prisma/
├── migrations/                # Histórico de migrações
└── schema.prisma              # Modelo do banco de dados

public/                        # Imagens, logos e arquivos estáticos
```

### Fluxo simplificado de integração

```text
Navegador
   │
   ▼
Aplicação Next.js
   │
   ├── Autenticação e autorização
   │
   ├── Rotas internas (/api/brise)
   │       │
   │       ▼
   │    Serviço de integração
   │       │
   │       ▼
   │    API Brise
   │
   └── Serviços Prisma
           │
           ▼
       PostgreSQL
```

A API Brise é acessada pelo servidor. As credenciais de integração não devem ser enviadas ao cliente.

---

## Pré-requisitos

Antes de executar o projeto, tenha disponível:

- Node.js compatível com a versão do Next.js utilizada.
- npm.
- PostgreSQL acessível por uma URL de conexão.
- Credenciais válidas da API Brise.
- Git.

## Configuração do ambiente

Crie o arquivo `.env.local` na raiz do projeto.

Configure as variáveis abaixo com os valores fornecidos para o seu ambiente:

```env
# Autenticação
AUTH_SECRET="gere-um-segredo-forte-para-a-aplicacao"

# Banco PostgreSQL - conexão utilizada pela aplicação
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/BANCO?sslmode=require"

# Banco PostgreSQL - conexão direta utilizada nas migrações
DATABASE_URL_UNPOOLED="postgresql://USUARIO:SENHA@HOST:5432/BANCO?sslmode=require"

# Integração com a API Brise
BRISE_API_URL="https://ENDERECO-DA-API"
BRISE_TOKEN="TOKEN_DE_ACESSO"
```

### Descrição das variáveis

| Variável | Finalidade |
|---|---|
| `AUTH_SECRET` | Segredo utilizado pelo Auth.js para proteger a autenticação e as sessões. |
| `DATABASE_URL` | Conexão PostgreSQL utilizada pela aplicação em runtime. |
| `DATABASE_URL_UNPOOLED` | Conexão direta utilizada pela configuração do Prisma para operações de migração. |
| `BRISE_API_URL` | Endereço base da API Brise. |
| `BRISE_TOKEN` | Token de autenticação da API Brise. |

**Importante:** os valores acima são exemplos de configuração. Substitua-os pelas credenciais reais do ambiente. Não compartilhe nem versione o arquivo `.env.local`.

O projeto utiliza `prisma7.config.ts` para carregar explicitamente o arquivo `.env.local` nas operações da CLI do Prisma.

## Instalação e execução local

Clone o repositório:

```bash
git clone https://github.com/elciobbsjr/automacao_brise_web.git
cd automacao_brise_web
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env.local` conforme a seção anterior.

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrações pendentes no banco configurado:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

[http://localhost:3000](http://localhost:3000)

---

## Banco de dados

O PostgreSQL armazena os dados internos da aplicação.

Atualmente, o schema Prisma contém os seguintes modelos:

### User

Armazena as contas de acesso, incluindo:

- Identificador.
- Nome.
- E-mail único.
- Hash da senha.
- Perfil de acesso.
- Situação da conta.
- Datas de criação e atualização.

### AuditLog

Armazena os registros de auditoria, incluindo:

- Usuário responsável pela ação e seus dados de identificação registrados no momento do evento.
- Tipo da ação.
- Recurso afetado e identificador correspondente.
- Descrição legível.
- Metadados estruturados.
- Data e horário do evento.

O histórico de migrações está em `prisma/migrations/`, e a definição dos modelos está em `prisma/schema.prisma`.

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run start` | Inicia a aplicação em modo de produção após o build. |
| `npm run lint` | Executa a análise estática com ESLint. |
| `npx prisma generate` | Gera o Prisma Client. |
| `npx prisma migrate deploy --config prisma7.config.ts` | Aplica migrações pendentes no banco configurado. |

## Integração com a API Brise

A comunicação externa está centralizada em `src/lib/brise-api.ts`. Esse módulo adiciona o token de autenticação, trata respostas HTTP e padroniza erros da integração.

Os serviços em `src/services/` concentram operações de negócio, enquanto as rotas em `src/app/api/brise/` disponibilizam endpoints internos para a interface.

### Estratégia de consultas

O serviço de monitoramento utiliza:

- Limite de concorrência de quatro dispositivos por lote.
- Pequenos intervalos entre o início das consultas.
- Pausa entre lotes de dispositivos.
- Cache em memória de cinco minutos para configurações.
- Consulta individual de parâmetros e variáveis do dispositivo.

Esses mecanismos ajudam a controlar o volume de requisições enviadas à API externa.

Falhas de comunicação podem ocorrer por indisponibilidade do equipamento, credenciais inválidas, permissões ou respostas da API. A aplicação trata essas respostas para evitar que uma falha isolada interrompa toda a experiência do painel.

## Deploy

O projeto está preparado para execução no ambiente Next.js e utiliza a Vercel como plataforma de deploy.

Para publicar uma nova versão:

1. Envie as alterações para o repositório Git.
2. Integre as alterações à branch configurada para produção.
3. Configure as variáveis de ambiente no projeto da Vercel.
4. Garanta que o banco PostgreSQL esteja acessível pelo ambiente de produção.
5. Execute ou disponibilize as migrações necessárias antes de utilizar alterações de schema.
6. Acompanhe o resultado do build e do deploy na Vercel.

As variáveis de ambiente utilizadas localmente também precisam estar configuradas no ambiente de produção. Não utilize credenciais de desenvolvimento em produção.

Consulte a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) e a [documentação da Vercel](https://vercel.com/docs).

## Segurança e boas práticas

- Nunca versione `.env.local`, tokens, senhas ou segredos.
- Não exponha `BRISE_TOKEN` ou credenciais da API no navegador.
- Mantenha as verificações de autenticação e autorização nas rotas do servidor.
- Utilize os perfis de acesso para limitar operações administrativas e de controle.
- Armazene senhas somente em formato de hash.
- Não registre senhas, hashes, tokens ou segredos nos metadados de auditoria.
- Revise as migrações antes de aplicá-las em produção.
- Valide as alterações com lint e build antes de integrar à branch de produção.

---

## Repositório

[github.com/elciobbsjr/automacao_brise_web](https://github.com/elciobbsjr/automacao_brise_web)

**Brise | SEMEQ — Sistema de monitoramento e controle de climatização do TRE-MA.**
