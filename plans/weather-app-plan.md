# Weather App — Plano Técnico

Fonte da verdade: [specs/weather-app-spec.md](../specs/weather-app-spec.md).

## Architecture

A aplicação será uma SPA client-side, mobile-first, publicada como conteúdo estático. A arquitetura será dividida em três camadas pequenas:

1. **Apresentação (`src/components/`)**: formulário de busca, lista de sugestões, controles de unidade, estados da consulta, clima atual e previsão. Os componentes recebem dados e callbacks; não conhecem URLs nem o formato bruto da Open-Meteo.
2. **Orquestração (`src/hooks/`)**: um hook de consulta coordena input, sugestões, cidade selecionada, forecast, unidade, loading, erro, retry e descarte de respostas obsoletas.
3. **Domínio e infraestrutura (`src/services/` e `src/types/`)**: funções puras para validação, conversão, formatação, códigos meteorológicos e seleção dos cinco dias; serviços HTTP responsáveis somente por chamar e validar/normalizar a API.

O fluxo principal é geocoding -> seleção explícita de uma sugestão válida -> forecast. Não haverá backend, armazenamento persistente, autenticação, geolocalização ou cache na primeira versão. AbortController será usado para cancelar requisições substituídas quando possível; um identificador de operação continuará sendo obrigatório para impedir que respostas antigas alterem o estado atual.

## Tech Stack

- TypeScript em modo `strict`, com interfaces explícitas para dados brutos, dados normalizados e estado da interface.
- React 19 + React DOM para a SPA.
- Vite para desenvolvimento e build estático, respeitando `VITE_BASE` para publicação.
- Tailwind CSS para layout responsivo e tema visual existente.
- `fetch` nativo para HTTP, sem cliente adicional.
- `Intl.DateTimeFormat` para datas em pt-BR e no timezone retornado pela fonte.
- Vitest + Testing Library para testes unitários e de componentes; Playwright para fluxos E2E.
- Biome para lint e formatação.

## Project Structure

```text
src/
  components/
    SearchBox.tsx
    LocationSuggestions.tsx
    UnitToggle.tsx
    CurrentWeather.tsx
    ForecastList.tsx
    QueryState.tsx
  hooks/
    useWeatherSearch.ts
  services/
    openMeteo.ts
    weatherMapper.ts
    weatherRules.ts
  types/
    weather.ts
  App.tsx
  main.tsx

tests/
  setup.ts
  unit/
    services/
    hooks/
    components/
  e2e/
```

A estrutura é uma referência de responsabilidade, não uma exigência de criar um arquivo para cada função. O contrato público entre camadas deve permanecer em `src/types/weather.ts`; componentes não devem importar tipos da resposta bruta da API.

## Data Model

O domínio usará Celsius como unidade canônica. Valores ausentes serão representados como `null` internamente e exibidos como `—`; não se deve usar `0` para representar ausência.

```ts
type TemperatureUnit = 'celsius' | 'fahrenheit';

type QueryOperation = 'geocoding' | 'forecast';

type QueryStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error';

type WeatherErrorKind =
  | 'invalid-input'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'unavailable'
  | 'invalid-data';

interface LocationSuggestion {
  id: number | string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
}

interface CurrentWeather {
  temperatureC: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  surfacePressureHpa: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
}

interface DailyForecast {
  date: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  precipitationMm: number | null;
  weatherCode: number | null;
}

interface WeatherReport {
  location: LocationSuggestion;
  timezone: string;
  currentDate: string;
  current: CurrentWeather;
  daily: DailyForecast[]; // exatamente cinco itens após validação
}

interface QueryError {
  kind: WeatherErrorKind;
  operation: QueryOperation;
  message: string;
  retryable: boolean;
}
```

Os tipos brutos da Open-Meteo devem ser internos aos serviços. A normalização deve verificar latitude, longitude, timezone, data atual e as cinco datas diárias válidas antes de produzir `WeatherReport`. Campos meteorológicos opcionais podem ser `null`; metadados essenciais inválidos rejeitam a resposta.

## Data Flow

1. A pessoa digita o nome. O estado mantém o texto original; a validação usa uma cópia com `trim()`.
2. Busca com menos de 2 ou mais de 80 caracteres após trim retorna `invalid-input` sem rede. Caracteres, acentos, hífens e apóstrofos são preservados na query.
3. O serviço de geocoding solicita no máximo 10 resultados na ordem retornada. A resposta é normalizada em `LocationSuggestion`; sugestões sem coordenadas válidas não ficam selecionáveis.
4. A pessoa seleciona explicitamente uma sugestão. A seleção substitui sugestões anteriores e inicia exatamente uma consulta de forecast usando as coordenadas selecionadas.
5. O serviço de forecast recebe os dados requeridos pela Open-Meteo e transforma a resposta em `WeatherReport`, exigindo timezone válido, data atual e cinco datas locais válidas.
6. O hook publica o report em Celsius e os componentes derivam a exibição da unidade escolhida. A troca de unidade é síncrona/local e não chama nenhum serviço.
7. Uma operação recebe um request id. Ao concluir, só pode atualizar o estado se ainda for a operação vigente; isso descarta respostas atrasadas de buscas anteriores.
8. Retry reutiliza somente os parâmetros da operação que falhou e dispara uma única requisição por acionamento.

## External APIs

### Geocoding

- URL: `https://geocoding-api.open-meteo.com/v1/search`.
- Método: `GET`.
- Parâmetros relevantes:
  - `name=<texto preservado>`: nome informado pela pessoa, após validar o tamanho, sem remover acentos, hífens ou apóstrofos.
  - `count=10`: limita o resultado às dez sugestões exigidas pela spec.
  - `language=pt`: solicita nomes e metadados localizados quando disponíveis.
  - `format=json`: seleciona a resposta JSON.
- Exemplo resumido:

```json
{
  "results": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "latitude": -23.55,
      "longitude": -46.63,
      "country_code": "BR",
      "country": "Brasil",
      "admin1": "São Paulo"
    }
  ],
  "generationtime_ms": 0.2
}
```

- Mapeamento para `City`/`LocationSuggestion`:
  - `id` -> `id`.
  - `name` -> `name`.
  - `country` -> `country`.
  - `country_code` -> `countryCode` quando o modelo expuser esse campo.
  - `admin1` -> `region`.
  - `latitude` e `longitude` -> coordenadas numéricas.
- `results` ausente ou vazio produz `empty`, sem iniciar forecast. Cada resultado precisa ter latitude e longitude finitas para ser selecionável.

### Forecast

- URL: `https://api.open-meteo.com/v1/forecast`.
- Método: `GET`.
- Parâmetros relevantes:
  - `latitude=<latitude>` e `longitude=<longitude>`: coordenadas da sugestão selecionada, sem nova geocodificação.
  - `timezone=auto`: faz a fonte retornar datas locais e o timezone da localidade consultada.
  - `forecast_days=5`: solicita hoje e os quatro dias seguintes.
  - `current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code`: campos do clima atual exigidos pela spec.
  - `daily=time,temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code`: séries diárias necessárias para a previsão.
- Exemplo resumido:

```json
{
  "latitude": -23.55,
  "longitude": -46.63,
  "timezone": "America/Sao_Paulo",
  "current": {
    "time": "2026-09-16T12:00",
    "temperature_2m": 22.4,
    "relative_humidity_2m": 68,
    "wind_speed_10m": 11.2,
    "surface_pressure": 1015.7,
    "precipitation": 0.0,
    "weather_code": 2
  },
  "daily": {
    "time": ["2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"],
    "temperature_2m_min": [16.2, 17.1, 18.0, 17.8, 19.3],
    "temperature_2m_max": [25.1, 26.0, 27.4, 24.8, 28.2],
    "precipitation_sum": [0.0, 1.4, 3.2, 0.0, 0.0],
    "weather_code": [2, 61, 63, 1, 0]
  }
}
```

- Mapeamento para `WeatherData`/`WeatherReport`:
  - `timezone` -> `timezone`; deve ser uma string válida.
  - A cidade selecionada, mantida pelo estado da aplicação, -> `city`/`location`; latitude e longitude da resposta devem ser comparadas com a consulta quando a validação for implementada.
  - `current.temperature_2m` -> `current.temperatureC`.
  - `current.relative_humidity_2m` -> `current.relativeHumidity`.
  - `current.wind_speed_10m` -> `current.windSpeedKmh`.
  - `current.surface_pressure` -> `current.surfacePressureHpa`.
  - `current.precipitation` -> `current.precipitationMm`.
  - `current.weather_code` -> `current.weatherCode`.
  - Para cada índice `i` de `daily.time`, criar um item `DailyForecast` com `time[i]` -> `date`, `temperature_2m_min[i]` -> `temperatureMinC`, `temperature_2m_max[i]` -> `temperatureMaxC`, `precipitation_sum[i]` -> `precipitationMm` e `weather_code[i]` -> `weatherCode`.
- As séries diárias são arrays paralelos e devem ser validadas antes do mapeamento. `daily.time` precisa conter pelo menos cinco datas válidas; o normalizador seleciona exatamente os cinco primeiros itens correspondentes a hoje e aos quatro dias seguintes no timezone retornado. Campo meteorológico ausente pode virar `null`, mas timezone, coordenadas e datas essenciais inválidos produzem erro de dados.
- Respostas HTTP não-2xx, JSON inválido, timeout e indisponibilidade devem virar `QueryError`; detalhes da fonte não devem ser exibidos diretamente como mensagem principal.
- O cliente deve usar timeout controlado com `AbortController`. O limite exato deve ser definido nas tarefas/testes e ser compartilhado pelas duas operações.

Nenhuma chave de API, credencial ou dado pessoal será usado ou persistido.

## State Management

Um único hook de orquestração manterá o estado da tela, preferencialmente com `useReducer` para transições explícitas e previsíveis. O estado mínimo é:

```ts
interface WeatherScreenState {
  searchText: string;
  suggestions: LocationSuggestion[];
  selectedLocation: LocationSuggestion | null;
  forecast: WeatherReport | null;
  unit: TemperatureUnit;
  geocoding: { status: QueryStatus; error: QueryError | null };
  forecastQuery: { status: QueryStatus; error: QueryError | null };
}
```

Ações devem cobrir alteração do texto, início/sucesso/resultado vazio/erro de geocoding, seleção de localidade, início/sucesso/erro de forecast, retry e troca de unidade. O estado de unidade nunca altera o modelo canônico nem dispara efeito assíncrono. Enquanto uma operação estiver `loading`, a mesma operação não poderá ser iniciada novamente.

Acessibilidade faz parte do estado visível: combobox com `aria-expanded` e `aria-activedescendant`, lista navegável por teclado, Escape para fechar, regiões de anúncio para loading/empty/error e foco movido para forecast ou erro após a seleção.

## Error Handling

- **Entrada inválida**: bloqueia a rede e informa o limite ou a necessidade de ao menos dois caracteres.
- **Sem resultados**: mantém o campo utilizável, limpa sugestões antigas e orienta uma nova busca.
- **Rede/timeout**: encerra loading, preserva a cidade selecionada quando aplicável e oferece retry da operação que falhou.
- **Rate limit/indisponibilidade**: apresenta mensagem pt-BR compreensível e retry; não expõe stack trace ou payload bruto.
- **Coordenadas inválidas**: impede o forecast e informa que a localidade não pode ser consultada.
- **Dados inválidos**: rejeita forecast sem timezone, data atual, coordenadas válidas ou cinco datas válidas. Não apresenta uma previsão parcial como previsão de cinco dias.
- **Campos opcionais ausentes**: mantém o cartão/linha visível e renderiza `—`.
- **Código meteorológico desconhecido**: usa “Condição indisponível”.
- **Respostas obsoletas**: são ignoradas por request id e, quando suportado, canceladas com AbortController.

A conversão usada na apresentação será `F = C * 9 / 5 + 32`, aplicada apenas a valores disponíveis e arredondada a uma casa decimal na saída. Os demais valores também serão arredondados somente na apresentação.

## Testing Strategy

- **Serviços e funções puras**: testar validação de input, conversão C/F, arredondamento, mapeamento de códigos meteorológicos, formatação pt-BR, seleção de hoje + quatro dias no timezone retornado, `null` para opcionais e rejeição de metadados inválidos.
- **Cliente Open-Meteo**: mockar `fetch` para sucesso, lista vazia, HTTP não-2xx, JSON inválido, timeout, rede indisponível, rate limiting e respostas parciais. Verificar URLs/parâmetros e que retry equivale a uma única chamada.
- **Hook/componentes**: testar loading, sucesso, empty, erros, seleção explícita, bloqueio durante loading, descarte de resposta antiga, preservação da cidade no erro, retry separado e troca de unidade sem chamada de rede.
- **Acessibilidade e responsividade**: Testing Library para roles, labels, foco, teclado e anúncios; Playwright para viewport mínimo de 320px e desktop, sem sobreposição ou perda de ações.
- **E2E**: interceptar as duas APIs e cobrir busca -> seleção -> forecast, no results, erro/retry e alternância Celsius/Fahrenheit sem novas requisições.
- **Qualidade e performance**: executar `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`; medir o shell inicial e forecast em dispositivo/rede de referência definidos antes da entrega para verificar os p95 da spec.

## Risks & Trade-offs

- **Dependência pública da Open-Meteo**: sem backend ou chave, o deploy é simples, mas rate limiting e indisponibilidade ficam fora do controle. Mitigação: timeout, classificação de erros e retry manual; cache fica fora da v1.
- **Validação rigorosa do forecast**: pode rejeitar respostas parcialmente úteis, porém evita apresentar uma previsão de cinco dias enganosa e atende ao contrato da spec.
- **Sem biblioteca de estado ou HTTP**: reduz dependências e complexidade para uma única tela, mas exige disciplina no reducer e nos contratos dos serviços.
- **Timezone da fonte**: aumenta a correção da janela de cinco dias, mas requer testes com fusos diferentes e datas próximas da virada do dia.
- **Modelo canônico em Celsius**: evita perda por conversões sucessivas e garante retorno estável à unidade original, ao custo de uma pequena derivação de apresentação.
- **AbortController + request id**: o cancelamento reduz trabalho, enquanto o request id cobre respostas que já chegaram ou não puderam ser abortadas.
- **Sem persistência**: protege privacidade e mantém o cliente estático, mas a unidade e a cidade não sobrevivem à recarga, comportamento aceitável por não estar no escopo.
- **Performance de fonte externa**: o p95 de forecast depende da API e da rede; o produto deve medir o cenário definido, mas não prometer latência sob indisponibilidade.
