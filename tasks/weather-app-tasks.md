# Weather App — Backlog de Tarefas

Fonte: [plans/weather-app-plan.md](../plans/weather-app-plan.md).

As tarefas seguem a ordem de implementação: tipos, funções puras, services,
hook, componentes, integração, testes e hardening. Cada tarefa é uma unidade
implementável e testável, possui critérios observáveis e referencia requisitos
funcionais (RF) ou não funcionais (RNF) da spec.

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas que implementam ou verificam | Cobertura |
| --- | --- | --- |
| RF1 — Buscar cidade | T-04, T-13, T-16, T-20, T-26, T-28, T-31, T-33, T-35, T-38 | Implementação e testes unitários, de componente e E2E. |
| RF2 — Desambiguar cidade | T-04, T-09, T-13, T-16, T-17, T-21, T-26, T-30, T-31, T-33, T-35, T-38 | Implementação da seleção válida e testes de normalização, hook, componente e E2E. |
| RF3 — Exibir clima atual | T-02, T-05, T-06, T-07, T-10, T-14, T-17, T-23, T-25, T-27, T-29, T-30, T-32, T-34, T-37, T-38 | Contrato, domínio, service, UI, testes unitários e E2E. |
| RF4 — Exibir previsão de cinco dias | T-02, T-05, T-06, T-08, T-10, T-14, T-17, T-24, T-25, T-27, T-28, T-29, T-30, T-32, T-34, T-37, T-38 | Janela de datas, normalização, UI, testes e E2E. |
| RF5 — Alternar unidade de temperatura | T-02, T-05, T-15, T-17, T-25, T-27, T-29, T-34, T-37, T-38, T-39 | Estado canônico em Celsius, controle local, testes unitários, de hook, componente e E2E. |
| RF6 — Comunicar estados da interface | T-02, T-04, T-06, T-07, T-08, T-09, T-10, T-12, T-13, T-14, T-15, T-16, T-17, T-20, T-21, T-22, T-23, T-24, T-26, T-27, T-28, T-30, T-31, T-32, T-33, T-34, T-36, T-39 | Classificação, estado, mensagens, acessibilidade e recuperação. |
| RF7 — Tentar novamente | T-02, T-10, T-12, T-14, T-15, T-16, T-17, T-22, T-26, T-27, T-31, T-32, T-33, T-34, T-35, T-36, T-39 | Retry isolado no hook, UI, testes e E2E. |

**Lacunas:** nenhum requisito funcional da spec ficou sem tarefa
correspondente. Cada RF possui ao menos uma tarefa de implementação e uma
tarefa de teste; RF1 a RF5 também possuem cobertura E2E no T-38, enquanto RF6
e RF7 possuem cobertura de recuperação no T-39.

## Classificação de prioridade e tamanho

`P0` representa o caminho mínimo utilizável do produto; `P1` representa
qualidade, cobertura e comportamentos complementares necessários para a
entrega; `P2` representa hardening, medição e documentação final. O tamanho é
relativo ao esforço e ao número de decisões da tarefa: `S` pequena, `M` média,
`G` grande.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | S |
| T-02 | P0 | S |
| T-03 | P0 | S |
| T-04 | P0 | S |
| T-05 | P0 | S |
| T-06 | P0 | S |
| T-07 | P0 | S |
| T-08 | P0 | S |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | S |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | M |
| T-17 | P0 | G |
| T-18 | P0 | S |
| T-19 | P0 | S |
| T-20 | P0 | M |
| T-21 | P0 | M |
| T-22 | P0 | S |
| T-23 | P0 | S |
| T-24 | P0 | S |
| T-25 | P0 | M |
| T-26 | P0 | M |
| T-27 | P0 | G |
| T-28 | P1 | S |
| T-29 | P1 | S |
| T-30 | P1 | S |
| T-31 | P1 | S |
| T-32 | P1 | M |
| T-33 | P1 | S |
| T-34 | P1 | S |
| T-35 | P1 | S |
| T-36 | P1 | S |
| T-37 | P1 | M |
| T-38 | P1 | G |
| T-39 | P1 | S |
| T-40 | P1 | M |
| T-41 | P2 | G |
| T-42 | P2 | S |
| T-43 | P2 | M |
| T-44 | P2 | S |

## Sequência de fatias verticais

As fatias abaixo entregam comportamento observável de ponta a ponta. Cada
fatia pode ser demonstrada antes de iniciar a seguinte; tarefas de teste
associadas entram na mesma fatia quando já houver comportamento executável.

### Fatia 1 — Buscar uma cidade

- **Entrega visível:** shell responsivo, campo de busca, sugestões e estados de loading/empty/error.
- **Tarefas:** T-01, T-02, T-03, T-04, T-09, T-11, T-12, T-13, T-15, T-16, T-18, T-19, T-20, T-21, T-22, T-26.
- **Resultado demonstrável:** informar uma cidade, ver até dez sugestões, navegar por teclado e selecionar uma localidade válida.

### Fatia 2 — Exibir o forecast

- **Entrega visível:** chamada de forecast, clima atual e previsão de cinco dias.
- **Tarefas:** T-05, T-06, T-07, T-08, T-10, T-14, T-17, T-23, T-24, T-27.
- **Resultado demonstrável:** selecionar uma sugestão e ver clima atual e exatamente cinco dias, com `—` para opcionais ausentes.

### Fatia 3 — Alternar unidade com confiança

- **Entrega visível:** Celsius/Fahrenheit local, sem nova requisição.
- **Tarefas:** T-25, T-29, T-34, T-37.
- **Resultado demonstrável:** alternar a unidade atualiza todas as temperaturas e mantém o relatório canônico e a contagem de chamadas.

### Fatia 4 — Proteger o caminho principal

- **Entrega visível:** regressões detectadas automaticamente em domínio, services, hook e componentes.
- **Tarefas:** T-28, T-30, T-31, T-32, T-33, T-35, T-36.
- **Resultado demonstrável:** `pnpm test` cobre regras puras, mocks de `fetch`, estados, teclado, retry e respostas obsoletas.

### Fatia 5 — Validar o produto em uso

- **Entrega visível:** fluxo principal executável em desktop e mobile.
- **Tarefas:** T-38, T-39, T-40.
- **Resultado demonstrável:** Playwright cobre busca, seleção, forecast, vazio, erro/retry e viewport `320x568`.

### Fatia 6 — Preparar entrega

- **Entrega visível:** qualidade, performance, privacidade e documentação verificadas.
- **Tarefas:** T-41, T-42, T-43, T-44.
- **Resultado demonstrável:** comandos de qualidade passam, limites de performance são registrados e o README descreve a entrega.

## Entrega 1 — Tipos e fundação

### T-01 — Preparar o bootstrap React

- **Descrição:** Criar a estrutura mínima de `src/` e o entrypoint React/Vite.
- **Critérios de aceite:** `pnpm build` termina com código 0; `src/main.tsx` monta `<App />` no elemento `#root`; `src/App.tsx` renderiza sem exceção.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra
- **Requisitos:** RNF1, RNF5, RNF8.

### T-02 — Definir os contratos de domínio e estado

- **Descrição:** Implementar tipos para localidade, relatório, previsão, unidade, status, operações e erros.
- **Critérios de aceite:** `WeatherReport` usa campos de temperatura em Celsius; métricas opcionais aceitam `number | null`; `QueryStatus` é `idle | loading | success | empty | error`; `WeatherErrorKind` contém os sete tipos da spec; nenhum payload bruto da Open-Meteo é exportado como contrato de componente.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF4, RF5, RF6, RF7, RNF6, RNF9.

### T-03 — Preparar TypeScript e qualidade

- **Descrição:** Confirmar o modo TypeScript strict do projeto.
- **Critérios de aceite:** `tsconfig.app.json` contém `compilerOptions.strict: true` e `pnpm build` termina com código 0.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `tsconfig.json`, `tsconfig.app.json`.
- **Tipo:** Infra
- **Requisitos:** RNF8.

## Entrega 2 — Funções puras do domínio

### T-04 — Implementar validação de busca e coordenadas

- **Descrição:** Criar funções puras para validar texto de busca e coordenadas.
- **Critérios de aceite:** Entradas com 2 e 80 caracteres após `trim()` retornam válido; entradas com 1 e 81 retornam inválido; `São-Paulo` e `O'Fallon` preservam caracteres; latitude em `[-90,90]` e longitude em `[-180,180]` são válidas; valores fora, `NaN` e infinitos são inválidos.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherRules.ts`.
- **Tipo:** Data
- **Requisitos:** RF1, RF2, RNF6, RNF9.

### T-05 — Implementar conversão de temperatura

- **Descrição:** Criar conversões puras entre Celsius e Fahrenheit a partir do valor canônico.
- **Critérios de aceite:** `0`, `25` e `-40` °C produzem `32`, `77` e `-40` °F; conversão C -> F -> C não altera o valor canônico além da precisão numérica definida; `null` permanece `null`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF4, RF5, RNF6.

### T-06 — Implementar formatação meteorológica

- **Descrição:** Criar formatadores de métricas, datas pt-BR e valores ausentes.
- **Critérios de aceite:** Valores numéricos são arredondados a uma casa decimal somente na saída; `null` retorna `—`; datas usam locale `pt-BR` e o timezone recebido; `22.44` retorna `22.4`.
- **Dependências:** T-02, T-05.
- **Arquivos prováveis:** `src/lib/formatters.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF4, RF6, RNF6.

### T-07 — Implementar mapeamento de códigos meteorológicos

- **Descrição:** Mapear códigos WMO para descrições em pt-BR.
- **Critérios de aceite:** Os códigos `0`, `1`, `2` e `61` retornam descrições não vazias em pt-BR; o código `999` retorna exatamente `Condição indisponível`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherMapper.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF6, RNF6.

### T-08 — Implementar janela de cinco dias

- **Descrição:** Validar datas e selecionar hoje mais quatro dias no timezone recebido.
- **Critérios de aceite:** Quatro datas retornam `invalid-data`; cinco ou mais datas retornam exatamente os cinco primeiros itens válidos; o resultado nunca possui sexto item; timezone vazio ou inválido retorna erro de dados.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `src/lib/weatherRules.ts`.
- **Tipo:** Data
- **Requisitos:** RF4, RF6, RNF6, RNF9.

### T-09 — Normalizar resultados de geocoding

- **Descrição:** Transformar resultados brutos em `LocationSuggestion` selecionável.
- **Critérios de aceite:** Para 12 resultados, retorna exatamente os 10 primeiros na mesma ordem; preserva nome, país e região; item sem latitude ou longitude finita não pode ser selecionado.
- **Dependências:** T-02, T-04, T-07.
- **Arquivos prováveis:** `src/lib/weatherMapper.ts`.
- **Tipo:** Data
- **Requisitos:** RF2, RF6, RNF9.

### T-10 — Normalizar payload de forecast

- **Descrição:** Validar payload bruto e produzir um `WeatherReport` canônico.
- **Critérios de aceite:** Timezone, coordenadas, data atual ou qualquer uma das cinco datas inválidos retornam `invalid-data`; opcionais ausentes viram `null`; tipo incompatível retorna `invalid-data`; payload válido produz `daily.length === 5`.
- **Dependências:** T-02, T-04, T-06, T-07, T-08.
- **Arquivos prováveis:** `src/lib/weatherMapper.ts`, `src/lib/weatherRules.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF4, RF6, RF7, RNF6, RNF9.

## Entrega 3 — Services e acesso a dados

### T-11 — Implementar cliente HTTP com timeout

- **Descrição:** Criar cliente compartilhado para `fetch`, timeout e cancelamento.
- **Critérios de aceite:** `fetch` pendente é abortado após 10.000 ms; geocoding e forecast usam o mesmo timeout; cancelamento provocado por nova operação não publica erro de usuário.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data
- **Requisitos:** RNF4, RNF9.

### T-12 — Classificar falhas HTTP e de transporte

- **Descrição:** Converter falhas externas em `QueryError` sem expor payload bruto.
- **Critérios de aceite:** HTTP `429` produz `rate-limit`; rede produz `network`; timeout produz `timeout`; indisponibilidade produz `unavailable`; JSON/payload inválido produz `invalid-data`; mensagem não contém corpo bruto.
- **Dependências:** T-02, T-11.
- **Arquivos prováveis:** `src/services/openMeteo.ts`, `src/types/weather.ts`.
- **Tipo:** Data
- **Requisitos:** RF6, RF7, RNF4, RNF9.

### T-13 — Implementar service de geocoding

- **Descrição:** Construir a chamada de geocoding e entregar resultados ao normalizador.
- **Critérios de aceite:** Usa a URL oficial com `count=10`, `language=pt` e `format=json`; o parâmetro `name` preserva acentos, hífens e apóstrofos; `results: []` produz estado `empty`, distinto de `QueryError`.
- **Dependências:** T-04, T-09, T-11, T-12.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data
- **Requisitos:** RF1, RF2, RF6, RNF9.

### T-14 — Implementar service de forecast

- **Descrição:** Construir a chamada de forecast e delegar sua normalização.
- **Critérios de aceite:** Usa coordenadas selecionadas sem nova geocodificação, `timezone=auto`, `forecast_days=5` e campos `current`/`daily` do plano; resposta válida retorna `WeatherReport`; resposta inválida retorna `QueryError`.
- **Dependências:** T-08, T-10, T-11, T-12.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data
- **Requisitos:** RF3, RF4, RF6, RF7, RNF4, RNF9.

## Entrega 4 — Hook e orquestração

### T-15 — Implementar reducer e estado inicial

- **Descrição:** Modelar estado inicial e transições síncronas da tela.
- **Critérios de aceite:** Estado inicial tem operações em `idle`, sugestões/localidade/forecast vazios e unidade `celsius`; cada ação produz status permitido; nova busca limpa sugestões/erro de geocoding e preserva forecast; nova seleção limpa forecast antes de `loading`.
- **Dependências:** T-02, T-13, T-14.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data
- **Requisitos:** RF1, RF2, RF5, RF6, RF7, RNF4.

### T-16 — Integrar busca de sugestões no hook

- **Descrição:** Orquestrar geocoding com validação, request id, cancelamento e descarte de respostas obsoletas.
- **Critérios de aceite:** Busca com 0, 1 ou 81 caracteres produz zero chamadas e `invalid-input`; duas submissões em `loading` produzem uma chamada; resposta tardia de A não altera sugestões nem erro de B; estados vazio/sucesso/erro são publicados.
- **Dependências:** T-04, T-11, T-12, T-13, T-15.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data
- **Requisitos:** RF1, RF2, RF6, RF7, RNF4.

### T-17 — Integrar forecast, retry e unidade no hook

- **Descrição:** Orquestrar seleção, forecast, retry isolado, respostas obsoletas e unidade.
- **Critérios de aceite:** Seleção válida produz uma chamada de forecast com suas coordenadas; retry de geocoding não chama forecast e retry de forecast não chama geocoding; resposta tardia não altera seleção/forecast vigente; alternar unidade produz zero chamadas de service.
- **Dependências:** T-05, T-14, T-15, T-16.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`.
- **Tipo:** Data
- **Requisitos:** RF2, RF3, RF4, RF5, RF6, RF7, RNF4.

## Entrega 5 — Componentes

### T-18 — Criar shell responsivo

- **Descrição:** Implementar layout mobile-first com áreas estáveis para busca, estados e forecast.
- **Critérios de aceite:** Em 320px, 375px e 1280px não existe overflow horizontal; áreas de busca, feedback e forecast são visíveis no estado vazio; suas larguras não mudam entre loading e success.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/App.tsx`, `src/index.css`.
- **Tipo:** UI
- **Requisitos:** RNF1, RNF2, RNF3, RNF6, RNF7.

### T-19 — Configurar tema Tailwind

- **Descrição:** Definir tokens e utilitários do tema dark glassmorphism.
- **Critérios de aceite:** `tailwind.config.js` define os tokens usados pelo shell; nenhum arquivo em `src/` importa essa configuração; `pnpm build` termina com código 0.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tailwind.config.js`.
- **Tipo:** UI
- **Requisitos:** RNF2, RNF6, RNF7.

### T-20 — Implementar `SearchBox` acessível

- **Descrição:** Criar campo combobox com submissão por botão/Enter e erro de input.
- **Critérios de aceite:** Campo possui nome acessível; botão e Enter acionam callback; texto original é preservado; loading bloqueia duplicidade; `aria-expanded`, `aria-controls` e `aria-invalid="true"` são publicados nos estados correspondentes.
- **Dependências:** T-16, T-18, T-19.
- **Arquivos prováveis:** `src/components/SearchBox.tsx`.
- **Tipo:** UI
- **Requisitos:** RF1, RF6, RNF2, RNF3.

### T-21 — Implementar lista de sugestões navegável

- **Descrição:** Exibir sugestões e permitir navegação por teclado e seleção explícita.
- **Critérios de aceite:** Cada item exibe nome, país e região quando disponível; nunca há mais de 10 itens; ArrowUp/ArrowDown mudam item ativo; Enter seleciona o item ativo; Escape fecha a lista; seleção dispara uma chamada ao callback.
- **Dependências:** T-09, T-16, T-20.
- **Arquivos prováveis:** `src/components/LocationSuggestions.tsx`.
- **Tipo:** UI
- **Requisitos:** RF2, RF6, RNF2, RNF3.

### T-22 — Implementar estados da consulta

- **Descrição:** Apresentar idle, loading, empty e error com mensagens pt-BR e retry.
- **Critérios de aceite:** Cada status tem apresentação distinta; rede, timeout, API e dados inválidos têm mensagens distintas; retry existe somente com `retryable === true`; estado atualiza `role="status"` ou `role="alert"`.
- **Dependências:** T-12, T-16, T-18, T-19.
- **Arquivos prováveis:** `src/components/QueryState.tsx`.
- **Tipo:** UI
- **Requisitos:** RF6, RF7, RNF3, RNF4, RNF6.

### T-23 — Implementar clima atual

- **Descrição:** Renderizar localidade e métricas atuais do `WeatherReport`.
- **Critérios de aceite:** Renderiza nome, temperatura, condição, umidade, vento, pressão e precipitação; toda métrica `null` renderiza `—`; o componente não importa URL nem payload bruto.
- **Dependências:** T-06, T-07, T-17, T-18, T-22.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI
- **Requisitos:** RF3, RF6, RNF2, RNF6.

### T-24 — Implementar previsão diária

- **Descrição:** Renderizar cinco dias a partir do relatório normalizado.
- **Critérios de aceite:** Relatório válido produz exatamente 5 itens; cada item contém data, mínima, máxima, condição e precipitação; `null` renderiza `—`; data usa `pt-BR` e timezone do relatório.
- **Dependências:** T-06, T-07, T-08, T-17, T-18, T-22.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI
- **Requisitos:** RF4, RF6, RNF2, RNF6.

### T-25 — Implementar alternância de unidade

- **Descrição:** Criar controle Celsius/Fahrenheit derivado do Celsius canônico.
- **Critérios de aceite:** Celsius inicia selecionado; Fahrenheit atualiza temperatura atual e as 5 previsões; valores têm uma casa decimal; relatório canônico não muda; interação gera zero chamadas de rede; opções são acionáveis por teclado.
- **Dependências:** T-05, T-17, T-23, T-24.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/lib/temperature.ts`.
- **Tipo:** UI
- **Requisitos:** RF3, RF4, RF5, RNF3, RNF6.

## Entrega 6 — Integração da tela

### T-26 — Integrar busca e estados na tela principal

- **Descrição:** Conectar `SearchBox`, sugestões e `QueryState` ao hook.
- **Critérios de aceite:** Digitar, buscar e selecionar uma sugestão produz a sequência `loading -> success` com mocks; retry de geocoding chama somente geocoding; componentes não contêm URL da Open-Meteo nem campos de payload bruto.
- **Dependências:** T-16, T-20, T-21, T-22.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF1, RF2, RF6, RF7, RNF2, RNF3, RNF4.

### T-27 — Integrar conteúdo meteorológico na tela

- **Descrição:** Conectar forecast, clima atual, previsão e unidade à tela principal.
- **Critérios de aceite:** Ao trocar A por B, forecast de A fica vazio ou em loading até B responder; retry de forecast chama somente forecast; foco vai para forecast em sucesso ou alerta em erro; relatório de B renderiza após sucesso.
- **Dependências:** T-17, T-23, T-24, T-25, T-26.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF3, RF4, RF5, RF6, RF7, RNF2, RNF3, RNF4.

## Entrega 7 — Testes

### T-28 — Testar validação e janela de datas

- **Descrição:** Criar testes Vitest para busca, coordenadas, timezone e cinco dias.
- **Critérios de aceite:** Testes verificam limites 2/80, inválidos 1/81, caracteres especiais, coordenadas fora dos limites, timezone/data inválidos e entradas com 4, 5 e 6 datas resultando em erro, 5 itens e 5 itens.
- **Dependências:** T-04, T-08.
- **Arquivos prováveis:** `tests/unit/lib/weatherRules.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF1, RF4, RF6, RNF6, RNF8.

### T-29 — Testar conversão de unidade

- **Descrição:** Criar testes unitários Vitest exclusivos para a conversão Celsius/Fahrenheit.
- **Critérios de aceite:** Expectativas verificam `0 °C -> 32 °F`, `25 °C -> 77 °F`, `-40 °C -> -40 °F`, conversão inversa sem acumulação e preservação de `null`; nenhum teste depende de componente ou rede.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF3, RF4, RF5, RNF6, RNF8.

### T-30 — Testar mapeamentos e normalizadores

- **Descrição:** Criar testes para códigos WMO, localidades e relatório normalizado.
- **Critérios de aceite:** Expectativas verificam códigos conhecidos e `999`, 12 sugestões reduzidas a 10, coordenadas inválidas não selecionáveis, opcionais como `null` e `daily.length === 5`.
- **Dependências:** T-07, T-09, T-10.
- **Arquivos prováveis:** `tests/unit/lib/weatherMapper.test.ts`, `tests/fixtures/forecast.ts`.
- **Tipo:** Test
- **Requisitos:** RF2, RF3, RF4, RF6, RNF8, RNF9.

### T-31 — Testar cliente HTTP e geocoding

- **Descrição:** Testar cliente HTTP e geocoding usando `vi.stubGlobal('fetch', ...)`, sem rede externa.
- **Critérios de aceite:** O mock de `fetch` registra URL, `name`, `count=10`, `language=pt` e `format=json`; expectativas cobrem sucesso, vazio, não-2xx, `429`, rede, timeout e JSON inválido com `kind` correspondente; `fetch` real não é chamado.
- **Dependências:** T-11, T-12, T-13.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF1, RF2, RF6, RF7, RNF8, RNF9.

### T-32 — Testar forecast e normalização de serviço

- **Descrição:** Testar parâmetros de forecast e respostas válidas ou inválidas.
- **Critérios de aceite:** Expectativas verificam coordenadas, `timezone=auto`, `forecast_days=5`, timezone inválido, menos de cinco datas e opcionais ausentes; payload inválido nunca satisfaz `WeatherReport` válido.
- **Dependências:** T-10, T-12, T-14.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`, `tests/fixtures/forecast.ts`.
- **Tipo:** Test
- **Requisitos:** RF3, RF4, RF6, RF7, RNF8, RNF9.

### T-33 — Testar reducer e busca do hook

- **Descrição:** Testar estados e fluxo de geocoding do hook com services simulados.
- **Critérios de aceite:** Há expectativa para cada status; busca inválida resulta em zero chamadas; resposta obsoleta de geocoding não altera sugestões da busca vigente.
- **Dependências:** T-15, T-16.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherSearch.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF1, RF2, RF6, RF7, RNF4, RNF8.

### T-34 — Testar forecast, retry e unidade do hook

- **Descrição:** Testar seleção, forecast, retry isolado e alternância local de unidade.
- **Critérios de aceite:** Expectativas verificam uma chamada por seleção, retry somente da operação falha, descarte de resposta obsoleta e zero chamadas ao alternar unidade.
- **Dependências:** T-17, T-33.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherSearch.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF3, RF4, RF5, RF6, RF7, RNF4, RNF8.

### T-35 — Testar busca e sugestões

- **Descrição:** Testar `SearchBox` e `LocationSuggestions` com Testing Library.
- **Critérios de aceite:** Simulações verificam Enter, ArrowUp/ArrowDown, Enter na sugestão, Escape e retry; asserções verificam nome acessível, roles de combobox/listbox/option e foco ativo.
- **Dependências:** T-20, T-21.
- **Arquivos prováveis:** `tests/unit/components/SearchBox.test.tsx`, `tests/unit/components/LocationSuggestions.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF1, RF2, RF7, RNF3, RNF8.

### T-36 — Testar estados e anúncios acessíveis

- **Descrição:** Testar `QueryState` com Testing Library nos estados loading, erro, vazio e sucesso.
- **Critérios de aceite:** Cada um dos quatro estados renderiza sua mensagem esperada; loading não mostra retry; erro recuperável mostra exatamente um retry; vazio mantém a busca disponível; a região possui `role="status"` ou `role="alert"`.
- **Dependências:** T-22.
- **Arquivos prováveis:** `tests/unit/components/QueryState.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF6, RF7, RNF3, RNF8.

### T-37 — Testar conteúdo meteorológico e unidade

- **Descrição:** Testar clima atual, previsão, composição e alternância de unidade.
- **Critérios de aceite:** Teste encontra `—` para ausentes, seção atual e exatamente 5 itens; alternar unidade altera valores renderizados e mantém inalterado o contador de requisições.
- **Dependências:** T-23, T-24, T-25, T-27.
- **Arquivos prováveis:** `tests/unit/components/WeatherView.test.tsx`, `tests/unit/components/UnitToggle.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF3, RF4, RF5, RNF2, RNF3, RNF8.

## Entrega 8 — E2E e hardening

### T-38 — Implementar E2E do fluxo principal

- **Descrição:** Cobrir busca, seleção e forecast com interceptação das APIs em desktop e viewport mobile.
- **Critérios de aceite:** O teste intercepta geocoding e forecast nos viewports `1280x800` e `320x568`, encontra clima atual e exatamente 5 itens em ambos; nenhuma chamada real à Open-Meteo ocorre.
- **Dependências:** T-27, T-37.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Requisitos:** RF1, RF2, RF3, RF4, RF5, RNF2, RNF8.

### T-39 — Implementar E2E de estados e recuperação

- **Descrição:** Cobrir vazio, erro, retry e alternância de unidade com mocks.
- **Critérios de aceite:** `results: []` exibe vazio e mantém campo habilitado; retry após erro produz exatamente uma nova chamada e sucesso; alternar unidade não altera o total de chamadas interceptadas.
- **Dependências:** T-22, T-25, T-38.
- **Arquivos prováveis:** `tests/e2e/weather-app-recovery.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RF5, RF6, RF7, RNF4, RNF8.

### T-40 — Validar responsividade e foco em E2E

- **Descrição:** Executar fluxos críticos em 320x568, 375x667 e 1280x800.
- **Critérios de aceite:** Nos três viewports, `scrollWidth <= viewport.width`; controles e retry ficam dentro da viewport; não há elemento essencial cortado; foco permanece visível e previsão contém 5 itens.
- **Dependências:** T-38, T-39.
- **Arquivos prováveis:** `tests/e2e/weather-app-responsive.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Requisitos:** RNF2, RNF3, RNF7, RNF8.

### T-41 — Executar validação de qualidade e performance

- **Descrição:** Executar lint, build, testes e medições no cenário de referência.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam; p95 do shell é <= 2 s; p95 do forecast é <= 3 s; alternância de unidade é <= 100 ms e faz zero chamadas de rede.
- **Dependências:** T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-40.
- **Arquivos prováveis:** `playwright.config.ts`, `package.json`.
- **Tipo:** Infra
- **Requisitos:** RNF1, RNF2, RNF3, RNF7, RNF8.

### T-42 — Registrar resultados da validação

- **Descrição:** Classificar falhas de comandos e medições.
- **Critérios de aceite:** Cada falha possui classificação, evidência reproduzível e encaminhamento registrados no README; nenhuma falha conhecida fica sem os três campos.
- **Dependências:** T-41.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra
- **Requisitos:** RNF1, RNF8, RNF9.

### T-43 — Revisar privacidade e escopo

- **Descrição:** Revisar o produto contra as restrições de privacidade e escopo da spec.
- **Critérios de aceite:** Bundle e requests não contêm credenciais ou dados pessoais; fluxo E2E não chama storage nem `navigator.geolocation`; não existem autenticação, favoritos, histórico ou previsão além de cinco dias.
- **Dependências:** T-42.
- **Arquivos prováveis:** `src/`, `tests/`.
- **Tipo:** Infra
- **Requisitos:** RNF5, RNF9.

### T-44 — Finalizar documentação de entrega

- **Descrição:** Documentar execução, testes, escopo e limitações da Open-Meteo.
- **Critérios de aceite:** README contém instalação, `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, escopo, limitações da fonte e ausência de chave de API; narrativa está em pt-BR.
- **Dependências:** T-43.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra
- **Requisitos:** RNF5, RNF6, RNF8, RNF9.