# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Comandos de Desenvolvimento

### Instalação
```bash
npm install --legacy-peer-deps
```

### Desenvolvimento Local
```bash
npm run dev
```

### Build e Deploy
```bash
npm run build
npm run start
npm run build:prod
```

### Linting e Qualidade de Código
```bash
npm run lint
```

### Limpeza e Reinstalação
```bash
npm run clean
npm run reinstall
```

## Arquitetura do Sistema

### Tecnologias Principais
- **Next.js 15** com App Router
- **React 19** com TypeScript
- **Tailwind CSS** + **shadcn/ui** para componentes
- **Supabase** para banco de dados e autenticação
- **React Hook Form** com **Zod** para validação

### Estrutura da Aplicação

#### Rotas Principais
- `/` - Landing page
- `/registro_ocorrencia` - Formulário multi-step de sinistro
- `/dashboard_cliente` - Dashboard do cliente
- `/admin` - Sistema administrativo (login, dashboard, usuários, sinistros)
- `/whatsapp` - Interface de WhatsApp para gerentes
- `/gerente` - Interface específica para gerentes

#### Contextos Globais
- `AuthProvider` - Autenticação de clientes
- `AdminAuthProvider` - Autenticação de administradores
- `FormProvider` - Estado do formulário multi-step
- `ThemeProvider` - Sistema de temas (light/dark)

#### Tipos de Sinistro/Atendimento
- **Atendimento**: sinistro | assistência
- **Sinistros**: colisão | furto | roubo | pequenos_reparos
- **Assistências**: hotel | guincho | taxi | pane_seca | pane_mecanica | pane_eletrica | trocar_pneu

### Sistema Multi-Step
O formulário principal (`/registro_ocorrencia`) é um wizard de 12 etapas:
1. Início
2. Tipo de Atendimento
3. Tipo de Sinistro
4. Assistência (se aplicável)
5. Situação dos Documentos
6. CNH
7. CRLV
8. Boletim de Ocorrência
9. Fotos do Veículo (11 tipos diferentes)
10. Terceiros
11. Assistência Adicional
12. Finalização

### Banco de Dados (Supabase)
- Tabela `sinistros` - dados principais
- Tabela `cnh_dados` - informações de CNH
- Tabela `crlv_dados` - dados do veículo
- Tabela `arquivos_sinistro` - documentos e fotos
- Tabela `log_atividades` - auditoria

### Sistema de Arquivos
- Upload de documentos via Supabase Storage
- OCR automatizado para CNH e CRLV
- Sistema de fotos guiadas com 11 etapas diferentes

## Convenções de Código

### Componentes
- Usar `shadcn/ui` para componentes base
- Seguir padrões do Tailwind CSS
- Componentes de step em `components/steps/`

### Estado
- React Hook Form para formulários
- Zod para validação
- Context API para estado global

### Configurações Importantes
- ESLint e TypeScript desabilitados no build (next.config.mjs)
- Usa `--legacy-peer-deps` para instalação de dependências
- Temas gerenciados com `next-themes`
- Suporte a imagens remotas configurado

### Estrutura de Arquivos
- `/app` - rotas Next.js App Router
- `/components` - componentes reutilizáveis
- `/lib` - utilitários (Supabase, auth, validações)
- `/types` - definições TypeScript
- `/constants` - constantes (steps, configurações)
- `/context` - provedores de contexto
- `/sql` - scripts de banco de dados

## Alterações Manuais Recentes

### 16/08/2025 - Padronização e Dark Mode
**Commit:** `034cf1c` - refactor: padronização de formatação e ajustes de tema dark mode

**Arquivos Modificados:**
- `components/ui/card.tsx` - Ajuste de background com opacity para melhor visualização em dark mode
- `app/gerente/gerente-filtros.tsx` - Adição de classes `text-foreground` para visibilidade em tema escuro
- `app/gerente/gerente-estatisticas.tsx` - Formatação de código (aspas simples)
- `app/gerente/page.tsx` - Ajustes menores de formatação
- `app/admin/calls/page.tsx` - Padronização de código
- `app/globals.css` - Adições de estilo global

**Principais Mudanças:**
1. **Formatação:** Padronização de aspas duplas para simples em componentes React
2. **Dark Mode:** Implementação de melhor suporte ao tema escuro com:
   - Background com opacity em cards (`bg-card-foreground/50`)
   - Classes `text-foreground` para garantir contraste adequado
3. **Reorganização:** Reformatação de componentes para melhor legibilidade

**Motivo:** Melhorar a experiência do usuário em dark mode e padronizar o código