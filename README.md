# Track - Projeto de Rastreamento

Este é um projeto full-stack com Express (backend) e React (frontend) usando Vite.

## Pré-requisitos

- Node.js (versão 20 ou superior)
- PostgreSQL (versão 16 ou superior)
- npm

## Configuração Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o banco de dados

O projeto precisa de uma variável de ambiente `DATABASE_URL` apontando para um banco PostgreSQL.

**Opção A: Usar PostgreSQL local**

Crie um banco de dados:

```bash
# Conectar ao PostgreSQL e criar o banco
psql -U riipen -d postgres -c "CREATE DATABASE track;"
```

Depois, configure a variável de ambiente:

```bash
export DATABASE_URL="postgresql://riipen@localhost:5432/track"
```

**Opção B: Usar arquivo .env (recomendado)**

Crie um arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL=postgresql://riipen@localhost:5432/track
PORT=5000
```

> **Nota:** Ajuste o usuário (`riipen`) conforme sua configuração do PostgreSQL. Se usar senha, adicione: `postgresql://usuario:senha@localhost:5432/track`

### 3. Configurar o schema do banco de dados

Após configurar a `DATABASE_URL`, execute o push do schema:

```bash
npm run db:push
```

## Executando o Projeto

### Modo Desenvolvimento

O comando `dev` roda o servidor completo (API + cliente) em modo desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:5000`

> **Nota:** O projeto carrega automaticamente as variáveis de ambiente do arquivo `.env` (se existir). Não é necessário exportar manualmente as variáveis.

> **Nota:** Em desenvolvimento, o Vite serve o cliente automaticamente através do servidor Express.

### Apenas o Cliente (desenvolvimento)

Se quiser rodar apenas o cliente separadamente:

```bash
npm run dev:client
```

## Outros Comandos

- `npm run build` - Faz o build do projeto para produção
- `npm run start` - Roda o projeto em modo produção (após build)
- `npm run check` - Verifica erros de TypeScript
- `npm run db:push` - Atualiza o schema do banco de dados

## Estrutura do Projeto

- `client/` - Aplicação React (frontend)
- `server/` - Servidor Express (backend)
- `shared/` - Código compartilhado (schemas, tipos, etc.)
- `attached_assets/` - Assets estáticos (imagens, etc.)

## Porta

Por padrão, o servidor roda na porta **5000**. Você pode alterar isso definindo a variável de ambiente `PORT`.

