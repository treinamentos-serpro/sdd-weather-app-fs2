# Weather App — Especificação de Produto

## Overview

O Weather App é uma aplicação web single-page, mobile-first, para consultas rápidas de clima por cidade. Uma pessoa informa o nome de uma localidade, escolhe uma sugestão desambiguada e visualiza as condições atuais e a previsão dos próximos cinco dias.

A interface será em pt-BR, não exigirá cadastro ou chave de API e deverá funcionar em celulares e desktops. Os dados serão obtidos da Open-Meteo, usando o serviço de geocoding para localizar cidades e o serviço de forecast para obter o clima.

### Objetivos

- Permitir encontrar uma cidade rapidamente.
- Exibir o clima atual de forma clara para apoiar decisões imediatas.
- Exibir cinco dias de previsão para planejamento de compromissos e viagens.
- Oferecer alternância entre Celsius e Fahrenheit sem nova consulta.
- Comunicar claramente os estados inicial, carregamento, sucesso, vazio, erro e resposta parcial.

### Personas

- **Viajante planejador:** consulta os próximos dias para organizar viagem, compromissos e roupas, usando celular ou desktop.
- **Decisor do dia a dia:** consulta rapidamente a condição atual, principalmente no celular, para decidir como se preparar para sair.

### Contrato de dados e regras de apresentação

- O geocoding deve fornecer, no mínimo, nome da localidade, país, latitude e longitude. Estado ou região são opcionais.
- A consulta meteorológica deve fornecer timezone e dados diários para hoje e os quatro dias seguintes. Sem timezone ou datas diárias válidas, a resposta é inválida para a previsão.
- O clima atual usa temperatura a 2 m, umidade relativa, velocidade do vento a 10 m, pressão ao nível da superfície, precipitação e código meteorológico da fonte.
- A previsão diária usa data local, temperatura mínima e máxima, precipitação e código meteorológico diário.
- Temperatura é exibida em °C por padrão ou °F após conversão local. Vento é exibido em km/h, pressão em hPa e precipitação em mm.
- Temperaturas são exibidas com uma casa decimal; vento, pressão e precipitação são exibidos com uma casa decimal. O arredondamento ocorre somente para apresentação.
- Códigos meteorológicos da fonte devem ser convertidos para descrições em pt-BR; códigos desconhecidos usam “Condição indisponível”.
- Campos meteorológicos opcionais ausentes exibem `—`. Metadados essenciais ausentes ou inválidos geram erro de dados e não iniciam ou não concluem a exibição da previsão.

## Functional Requirements

### RF1 — Buscar cidade

O sistema deve permitir que a pessoa informe de 2 a 80 caracteres, após remover espaços nas extremidades, e solicite sugestões por meio do serviço de geocoding. A busca deve ser acionada pelo botão de busca ou pela tecla Enter. O valor deve preservar acentos, hífens e apóstrofos.

### RF2 — Desambiguar cidade

O sistema deve apresentar no máximo 10 sugestões, ordenadas pela relevância retornada pelo geocoding. Cada sugestão deve exibir nome da localidade e país e, quando disponíveis, estado ou região. A pessoa deve selecionar explicitamente uma sugestão antes do forecast. Sugestões sem latitude ou longitude válidas não podem ser selecionadas para consulta.

### RF3 — Exibir clima atual

Após a seleção de uma cidade, o sistema deve exibir, para a localidade escolhida, temperatura, condição meteorológica, umidade, vento, pressão e precipitação. A temperatura deve ser apresentada em Celsius por padrão.

### RF4 — Exibir previsão de cinco dias

Após a seleção de uma cidade, o sistema deve exibir exatamente cinco dias: hoje e os quatro dias seguintes, interpretados no timezone retornado pela fonte de dados. Para cada dia, deve apresentar data, temperaturas mínima e máxima, condição meteorológica e precipitação. Se faltar um campo opcional, o dia continua visível com `—`; se faltar uma data ou houver menos de cinco datas válidas, a previsão deve ser tratada como erro de dados.

### RF5 — Alternar unidade de temperatura

O sistema deve permitir alternar entre Celsius e Fahrenheit. A alteração deve atualizar todas as temperaturas atuais e da previsão usando os dados já carregados, sem nova requisição de rede. Celsius deve ser a unidade inicial.

### RF6 — Comunicar estados da interface

O sistema deve comunicar os estados inicial, carregamento de sugestões, sem resultados, carregamento da previsão, sucesso, erro de busca, erro de previsão, timeout, rede indisponível, resposta parcial, erro de dados e entrada inválida.

### RF7 — Tentar novamente

Quando a busca de cidade ou a consulta meteorológica falhar por erro de rede, timeout, rate limiting, indisponibilidade da fonte ou erro de dados, o sistema deve oferecer uma ação de nova tentativa para repetir somente a operação que falhou. O retry manual não deve exceder uma requisição por acionamento.

## User Stories

### US1 — Buscar uma localidade (RF1)

Como Decisor do dia a dia, quero informar o nome de uma cidade e receber sugestões para encontrar rapidamente o local sobre o qual preciso consultar o clima.

### US2 — Escolher a cidade correta (RF2)

Como Viajante planejador, quero distinguir cidades homônimas por país e estado ou região para evitar consultar a localidade errada.

### US3 — Consultar as condições atuais (RF3)

Como Decisor do dia a dia, quero ver as condições meteorológicas atuais para decidir como me preparar para sair.

### US4 — Planejar os próximos dias (RF4)

Como Viajante planejador, quero consultar cinco dias de previsão para organizar meus compromissos e minha viagem.

### US5 — Escolher a unidade de temperatura (RF5)

Como Decisor do dia a dia, quero alternar entre Celsius e Fahrenheit para ler as temperaturas na unidade com que estou familiarizado.

### US6 — Entender o estado da consulta (RF6)

Como Viajante planejador, quero receber mensagens claras durante carregamentos, resultados vazios ou falhas para saber o que está acontecendo e qual ação posso tomar.

### US7 — Recuperar uma falha (RF7)

Como Decisor do dia a dia, quero tentar novamente uma consulta que falhou para continuar usando o aplicativo sem reiniciar a experiência.

## Acceptance Criteria

Os critérios abaixo são verificáveis e estão vinculados aos requisitos funcionais correspondentes.

### CA-RF1 — Buscar cidade

- **Given** que a pessoa informa entre 2 e 80 caracteres após o trim, **When** aciona o botão de busca ou pressiona Enter, **Then** o sistema faz uma requisição de geocoding com o valor preservado e exibe no máximo 10 sugestões.
- **Given** que a busca de sugestões está em andamento, **When** a pessoa aciona novamente o botão ou pressiona Enter, **Then** nenhuma segunda requisição é iniciada e o estado de carregamento permanece visível.
- **Given** que o campo está vazio, contém apenas espaços ou tem menos de 2 caracteres após o trim, **When** a pessoa tenta buscar, **Then** nenhuma requisição é realizada e a interface informa a entrada inválida.
- **Given** que o campo tem mais de 80 caracteres após o trim, **When** a pessoa tenta buscar, **Then** nenhuma requisição é realizada e a interface informa o limite permitido.

### CA-RF2 — Desambiguar cidade

- **Given** que o geocoding retorna uma ou mais localidades, **When** as sugestões são exibidas, **Then** cada sugestão apresenta nome e país.
- **Given** que o serviço retorna estado ou região, **When** a sugestão correspondente é exibida, **Then** o estado ou região também é apresentado.
- **Given** que o geocoding retorna mais de 10 localidades, **When** as sugestões são exibidas, **Then** somente as 10 mais relevantes são apresentadas na ordem retornada pela fonte.
- **Given** que há mais de uma sugestão, **When** a pessoa seleciona uma delas, **Then** somente a localidade selecionada é usada para a consulta meteorológica.
- **Given** que a pessoa seleciona uma sugestão sem latitude ou longitude válidas, **When** o sistema prepara a consulta meteorológica, **Then** o forecast não é solicitado e a interface informa que a localidade não pode ser consultada.
- **Given** que a pessoa seleciona uma sugestão com latitude e longitude válidas, **When** o sistema prepara a consulta meteorológica, **Then** a requisição usa exatamente essas coordenadas.

### CA-RF3 — Exibir clima atual

- **Given** que uma cidade válida foi selecionada e o forecast foi obtido, **When** a tela exibe o resultado, **Then** ela apresenta a cidade selecionada e os campos de temperatura, condição, umidade, vento, pressão e precipitação.
- **Given** que a primeira visualização do forecast foi concluída com sucesso, **When** a pessoa observa a temperatura atual, **Then** ela é exibida em Celsius.
- **Given** que um campo meteorológico opcional não é fornecido pela fonte, **When** a tela exibe o clima atual, **Then** o campo permanece visível com `—` e o layout não quebra.
- **Given** que timezone, data atual ou coordenadas da resposta são ausentes ou inválidos, **When** o forecast é processado, **Then** a interface exibe erro de dados e não apresenta a previsão como válida.

### CA-RF4 — Exibir previsão de cinco dias

- **Given** que uma cidade válida foi selecionada e o forecast foi obtido, **When** a tela exibe a previsão, **Then** ela apresenta exatamente cinco itens diários.
- **Given** que o forecast informa um timezone, **When** o período da previsão é calculado, **Then** os cinco itens correspondem a hoje e aos quatro dias seguintes nesse timezone.
- **Given** que um item diário está disponível, **When** ele é exibido, **Then** apresenta data, temperatura mínima, temperatura máxima, condição e precipitação, usando `—` somente para campos opcionais ausentes.
- **Given** que os dados necessários estão disponíveis, **When** a previsão é exibida, **Then** ela não adiciona um sexto dia nem omite o dia atual.
- **Given** que há menos de cinco datas válidas ou uma data diária está ausente, **When** a resposta é processada, **Then** a interface exibe erro de dados e não apresenta uma previsão parcial como previsão de cinco dias.

### CA-RF5 — Alternar unidade de temperatura

- **Given** que a pessoa acessa a interface pela primeira vez, **When** o controle de unidade é exibido, **Then** Celsius está selecionado.
- **Given** que há temperaturas atuais e diárias carregadas, **When** a pessoa alterna para Fahrenheit, **Then** todas as temperaturas visíveis são convertidas e atualizadas.
- **Given** que os dados meteorológicos já foram carregados, **When** a pessoa alterna entre Celsius e Fahrenheit, **Then** nenhuma nova requisição de geocoding ou forecast é disparada.
- **Given** que a pessoa visualiza valores convertidos em Fahrenheit, **When** retorna para Celsius, **Then** os valores correspondem aos valores originais em Celsius após arredondamento para uma casa decimal.

### CA-RF6 — Comunicar estados da interface

- **Given** que nenhuma cidade foi selecionada, **When** a pessoa acessa o aplicativo pela primeira vez, **Then** a interface orienta a iniciar uma busca.
- **Given** que uma busca de cidade ou forecast está em andamento, **When** a pessoa observa a interface, **Then** o sistema indica carregamento e não apresenta dados incompletos como definitivos.
- **Given** que o geocoding não retorna cidades correspondentes, **When** a busca termina, **Then** a interface informa que nenhum resultado foi encontrado e orienta uma nova busca.
- **Given** que ocorre uma falha no geocoding, **When** a busca termina, **Then** a interface informa que a busca não pôde ser concluída e permanece utilizável.
- **Given** que ocorre uma falha de forecast, timeout ou indisponibilidade de rede, **When** o erro é identificado, **Then** a interface informa o problema e apresenta uma ação de nova tentativa.
- **Given** que a resposta contém campos meteorológicos opcionais ausentes, **When** os dados são exibidos, **Then** a interface mantém a estrutura e apresenta `—` nos campos afetados.
- **Given** que a resposta contém metadados essenciais ausentes ou inválidos, **When** os dados são processados, **Then** a interface exibe erro de dados e não apresenta o forecast como válido.
- **Given** que uma nova busca foi iniciada antes da conclusão da anterior, **When** a resposta anterior chega depois da nova busca, **Then** a resposta anterior é descartada e não altera as sugestões exibidas.

### CA-RF7 — Tentar novamente

- **Given** que o geocoding falhou, **When** a interface exibe o estado de erro, **Then** apresenta uma ação identificável como “Tentar novamente” para repetir o geocoding.
- **Given** que o forecast falhou para uma cidade selecionada, **When** a interface exibe o estado de erro, **Then** apresenta uma ação identificável como “Tentar novamente” para repetir o forecast.
- **Given** que uma operação falhou, **When** a pessoa aciona “Tentar novamente” uma vez, **Then** o sistema realiza exatamente uma nova requisição para a mesma operação.
- **Given** que o geocoding falhou e a nova tentativa é bem-sucedida, **When** as sugestões são recebidas, **Then** a mensagem de erro é removida e as sugestões são exibidas.
- **Given** que o forecast falhou e a nova tentativa é bem-sucedida, **When** o forecast é recebido, **Then** a mensagem de erro é removida e o clima atual e a previsão são exibidos.
- **Given** que a nova tentativa falha, **When** o erro é recebido, **Then** a interface permanece utilizável e mantém uma mensagem compreensível com a possibilidade de tentar novamente.

## Traceability Matrix

| User Story | Acceptance Criteria | Requisitos não-funcionais relevantes |
| --- | --- | --- |
| US1 — Buscar uma localidade | CA-RF1 | RNF1, RNF2, RNF3, RNF4, RNF6, RNF7, RNF8, RNF9 |
| US2 — Escolher a cidade correta | CA-RF2 | RNF2, RNF3, RNF4, RNF6, RNF7, RNF8, RNF9 |
| US3 — Consultar as condições atuais | CA-RF3 | RNF1, RNF2, RNF3, RNF4, RNF6, RNF7, RNF8, RNF9 |
| US4 — Planejar os próximos dias | CA-RF4 | RNF1, RNF2, RNF3, RNF4, RNF6, RNF7, RNF8, RNF9 |
| US5 — Escolher a unidade de temperatura | CA-RF5 | RNF1, RNF2, RNF3, RNF6, RNF7, RNF8 |
| US6 — Entender o estado da consulta | CA-RF6 | RNF2, RNF3, RNF4, RNF6, RNF7, RNF8 |
| US7 — Recuperar uma falha | CA-RF7 | RNF1, RNF2, RNF3, RNF4, RNF7, RNF8, RNF9 |

## Non-Functional Requirements

### RNF1 — Performance

- O shell inicial deve estar interativo em até 2 segundos no percentil p95 em uma conexão 4G simulada e dispositivo móvel de referência definidos no plano de testes.
- Após a seleção de uma sugestão, o forecast deve ser exibido em até 3 segundos no p95 no mesmo cenário, salvo indisponibilidade ou timeout da fonte.
- A alternância de unidade deve atualizar os valores em até 100 ms e não pode depender de rede.
- Toda requisição deve exibir estado de carregamento até sucesso, erro ou timeout.

### RNF2 — Responsividade

- A experiência deve ser funcional em larguras de viewport de 320px até desktop.
- O conteúdo deve permanecer legível, sem sobreposição, corte ou perda de ações essenciais.
- O layout deve priorizar o uso com uma mão em telas pequenas e aproveitar o espaço disponível em telas maiores.

### RNF3 — Acessibilidade

- A interface deve atender WCAG 2.2 nível AA nos fluxos de busca, seleção, consulta e retry.
- Todas as ações e campos devem ser operáveis por teclado, incluindo navegação por setas, seleção por Enter e fechamento da lista por Escape.
- O foco deve permanecer visível e seguir uma ordem lógica; após a seleção, deve mover-se para o conteúdo do forecast ou para o erro correspondente.
- O campo de busca deve ter nome acessível e comportamento de combobox; sugestões, carregamento, resultados vazios e erros devem ser anunciados por tecnologia assistiva.
- Texto e controles devem atender ao contraste mínimo da WCAG 2.2 AA.

### RNF4 — Resiliência

- Falhas de rede, timeout, rate limiting e indisponibilidade da API não podem travar ou deixar a interface inutilizável.
- A interface deve manter a cidade selecionada quando isso for possível e oferecer recuperação para falhas de forecast.
- Respostas incompletas devem ser tratadas com fallback visual `—` nos campos ausentes.

### RNF5 — Deploy e integração

- O produto deve usar a Open-Meteo como fonte pública, sem exigir chave de API.
- A aplicação deve poder ser publicada como conteúdo estático, sem backend próprio obrigatório.

### RNF6 — Idioma e formatação

- Textos da interface, mensagens e ações da primeira versão devem estar em pt-BR.
- Datas devem usar formato local pt-BR e ser calculadas no timezone válido retornado pela fonte; timezone ausente ou inválido deve produzir erro de dados.
- Temperaturas, vento, pressão e precipitação devem respeitar as unidades e a precisão definidas no contrato de dados.

### RNF7 — Compatibilidade

- A aplicação deve funcionar nas duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari, em viewport de 320px até desktop.

### RNF8 — Qualidade verificável

- O produto deve poder ser validado por lint, build, testes unitários e testes E2E.
- Regras de conversão de unidade e tratamento de estados devem possuir cobertura de testes adequada ao comportamento definido nesta especificação.

### RNF9 — Segurança e privacidade

- Nenhuma chave, credencial ou dado pessoal deve ser incorporado ao cliente ou persistido pelo aplicativo.
- A aplicação não deve solicitar permissão de geolocalização na v1.
- Dados recebidos da fonte devem ser validados antes de serem exibidos ou usados em novas requisições.

## Edge Cases

- Cidade inexistente: tratar a consulta como sem resultados, informar que nenhuma cidade foi encontrada e permitir uma nova busca sem iniciar o forecast.
- Input vazio ou composto somente por espaços: não realizar requisição e orientar o preenchimento do campo.
- Caracteres especiais no input, incluindo acentos, hífens e apóstrofos: preservar o valor informado para a busca; se não houver correspondência, exibir o estado sem resultados sem quebrar ou limpar a interface de forma inesperada.
- Geocoding sem resultados: informar que nenhuma localidade correspondeu à busca, manter o campo disponível e permitir uma nova tentativa.
- Falha de API, incluindo erro de rede, rate limiting ou indisponibilidade da Open-Meteo: exibir uma mensagem compreensível, manter a interface utilizável e oferecer nova tentativa quando houver cidade selecionada.
- Timeout no geocoding ou forecast: encerrar o carregamento após o limite definido, informar que a consulta demorou além do esperado e oferecer nova tentativa quando aplicável.
- Resposta parcial do forecast, com campos atuais ou diários ausentes: manter o layout, exibir `—` nos campos afetados e preservar os dados válidos restantes.
- Várias cidades com o mesmo nome: mostrar dados de desambiguação e exigir seleção explícita.
- Cidade sem estado ou região retornado: exibir país e omitir o campo ausente sem inventar informação.
- Seleção de cidade sem coordenadas válidas: não iniciar o forecast e comunicar que a localidade não pode ser consultada.
- Usuário inicia nova busca enquanto outra está carregando: evitar resultados antigos sobrescreverem a seleção mais recente.
- Forecast com timezone diferente do dispositivo: usar o timezone retornado pela fonte para definir hoje e os quatro dias seguintes.
- Alternância de unidade durante carregamento ou após resposta parcial: manter o controle consistente e converter somente valores disponíveis.
- Usuário seleciona a mesma cidade novamente: a interface deve continuar estável e não exibir dados de outra localidade.
- Viewport mínimo de 320px: preservar leitura, controles e ações sem sobreposição ou rolagem horizontal desnecessária.

## Assumptions

- A Open-Meteo permanece acessível para geocoding e forecast durante o uso normal.
- Os serviços da Open-Meteo fornecem latitude, longitude e timezone para uma localidade selecionada.
- Celsius é a unidade padrão esperada pelo público principal da interface em pt-BR.
- A conversão para Fahrenheit pode ser feita a partir dos valores carregados, sem nova consulta.
- “Cinco dias” inclui hoje e os quatro dias seguintes.
- A pessoa seleciona uma localidade antes de consultar o forecast.
- Não há login, dados pessoais, persistência de servidor ou necessidade de conta.
- O dispositivo possui conexão com a internet para realizar as consultas; indisponibilidade é tratada como erro recuperável.
- `—` é uma representação aceitável para um campo meteorológico ausente.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Rate limiting ou indisponibilidade da Open-Meteo | Média | Alto | Tratar erros e códigos de resposta, comunicar a falha e permitir nova tentativa; avaliar cache leve em etapa futura. |
| Cidade homônima ou localização incorreta | Alta | Médio | Exibir país e estado/região quando disponíveis e exigir seleção explícita. |
| Latência ou timeout | Média | Médio | Exibir carregamento, usar timeout controlado e oferecer recuperação. |
| Falha de rede no dispositivo | Média | Médio | Manter a interface utilizável, mostrar mensagem clara e permitir nova tentativa. |
| Inconsistência entre dispositivos | Média | Médio | Adotar abordagem mobile-first e validar viewports móveis e desktop. |
| Conversão de unidade incorreta | Baixa | Alto | Manter a conversão como regra testável e validar valores nos testes unitários. |
| Campo ausente ou formato inesperado da resposta | Média | Médio | Validar dados, aplicar `—` e impedir que um campo ausente quebre a tela. |
| Dados exibidos para um timezone incorreto | Baixa | Alto | Usar o timezone retornado pela fonte para definir a janela dos cinco dias e cobrir a regra em testes. |

## Out of Scope

- Autenticação, contas e perfis de usuário.
- Favoritos, histórico de cidades ou persistência de preferências.
- Geolocalização automática e solicitação de permissão de localização.
- Internacionalização além de pt-BR.
- Notificações push, alertas meteorológicos ou recomendações personalizadas.
- Histórico climático, comparações históricas ou tendências de longo prazo.
- Backend próprio para proxy, persistência ou processamento meteorológico.
- Modo offline garantido ou sincronização posterior.
- Previsão além dos cinco dias definidos nesta versão.

## Open Questions

1. Quais dispositivo móvel de referência e ferramenta de simulação de rede serão usados para medir os p95 de performance?
2. O produto adotará cache de respostas em uma versão posterior? Se sim, qual validade e como indicar dados potencialmente desatualizados?
3. Qual ferramenta será usada para auditoria automatizada de acessibilidade no pipeline, além dos testes manuais de teclado?
