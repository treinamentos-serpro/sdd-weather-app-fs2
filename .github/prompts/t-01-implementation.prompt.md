---
mode: agent
description: 'Implementa T-01 — bootstrap React/Vite do Weather App.'
---

# Prompt de implementação — T-01

Você é o Code Agent do SDD Weather App. Implemente somente a tarefa abaixo,
seguindo as regras de `.github/agents/code.agent.md`, a spec e o plano técnico.

## Contexto do produto

O projeto é uma SPA client-side de consulta meteorológica em React + Vite,
TypeScript strict e Tailwind. A aplicação será publicada como conteúdo estático
e usará a Open-Meteo em tarefas posteriores. Esta tarefa prepara apenas o
bootstrap executável; tipos de domínio, funções puras, services, hooks e
componentes de produto ficam para tarefas posteriores.

## Tarefa

**T-01 — Preparar o bootstrap React**

Criar a estrutura mínima de `src/` e o entrypoint React/Vite.

**Dependências:** nenhuma.

**Arquivos autorizados/prioritários:**

- `src/main.tsx`
- `src/App.tsx`

Consulte arquivos de configuração existentes quando necessário, mas não altere
configuração ou crie arquivos fora desse escopo sem uma justificativa técnica
bloqueadora.

## Critérios de aceite

1. `pnpm build` termina com código 0 e gera o bundle de produção.
2. `src/main.tsx` monta `<App />` no elemento `#root`.
3. `src/App.tsx` renderiza sem exceção em uma inicialização limpa da aplicação.
4. O bootstrap não depende de chamadas de rede, payloads da Open-Meteo ou tipos
de domínio que ainda serão criados em tarefas posteriores.

## Orientações de implementação

- Inspecione primeiro o estado atual do repositório e preserve alterações do
  usuário já existentes.
- Use o entrypoint e o padrão de montagem já adotados pelo scaffold Vite, se
  estiverem presentes.
- Mantenha `App` mínimo e determinístico; uma marcação placeholder simples é
  suficiente para provar que a montagem funciona.
- Use TypeScript sem `any` e mantenha o código compatível com `strict`.
- Não implemente busca, forecast, estados de consulta, unidade, tema completo,
  acesso à API, persistência ou componentes de produto nesta tarefa.
- Não adicione dependências novas se as dependências existentes já suportarem o
  bootstrap.

## Validação obrigatória

Execute, nesta ordem:

```bash
pnpm build
pnpm lint
pnpm test
```

O critério mínimo desta tarefa é `pnpm build` com código 0. Registre também o
resultado de lint e testes; se algum comando falhar por configuração ou por um
problema preexistente fora do escopo, identifique a causa sem ampliar a tarefa.

## Formato da resposta final

Informe:

1. arquivos alterados;
2. resumo do bootstrap implementado;
3. comandos executados e seus resultados;
4. qualquer bloqueio ou falha preexistente que não pertença a T-01.
