# Discovery — Weather App

## Resumo executivo

O produto será um aplicativo web mobile-first para consultar o clima de qualquer cidade.
O usuário poderá buscar localidades, visualizar as condições atuais e acompanhar a previsão dos próximos cinco dias.
A experiência priorizará rapidez, clareza, acessibilidade e suporte a Celsius e Fahrenheit.
Os dados virão da Open-Meteo, sem necessidade de cadastro ou chave de API.
A primeira versão tratará falhas de conexão, cidades ambíguas e ausência de resultados, deixando favoritos e geolocalização para o futuro.

## Contexto

Aplicação web de previsão do tempo voltada a consultas pessoais rápidas. O usuário busca uma cidade e visualiza o clima atual e a previsão de cinco dias, com possibilidade de alternar entre Celsius e Fahrenheit.

A experiência será mobile-first, com suporte a telas de 320px até desktop, idioma da interface em pt-BR e uso por pessoas sem necessidade de login. O produto será uma SPA com deploy estático.

## Objetivos

- Permitir que uma pessoa encontre uma cidade rapidamente.
- Exibir informações meteorológicas atuais de forma clara.
- Exibir a previsão de cinco dias para apoiar decisões do dia a dia e planejamento.
- Funcionar bem em dispositivos móveis e desktops.
- Comunicar claramente carregamento, ausência de resultados e falhas.

## Personas

### Viajante planejador

Quer consultar a previsão dos próximos dias para organizar uma viagem, compromissos e roupas. Pode utilizar desktop ou celular.

### Decisor do dia a dia

Quer saber rapidamente a condição atual para decidir o que vestir, se precisa de guarda-chuva ou como se preparar para sair. Usa principalmente o celular.

## Requisitos funcionais

- **RF1 — Buscar cidade:** permitir que o usuário informe o nome de uma cidade e receba sugestões de localidades correspondentes.
- **RF2 — Desambiguar cidade:** apresentar país e, quando disponível, estado ou região nas sugestões para diferenciar cidades homônimas.
- **RF3 — Exibir clima atual:** mostrar temperatura, condição meteorológica, umidade, vento, pressão e precipitação para a cidade selecionada.
- **RF4 — Exibir previsão:** mostrar exatamente cinco dias, correspondentes a hoje e aos quatro dias seguintes, com temperaturas mínima e máxima, condição e precipitação.
- **RF5 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar todas as temperaturas exibidas sem realizar uma nova requisição.
- **RF6 — Informar estados da interface:** tratar e comunicar os estados inicial, carregamento, sucesso, vazio e erro.
- **RF7 — Tentar novamente:** oferecer uma ação de nova tentativa quando uma requisição de dados meteorológicos falhar.

## Requisitos não funcionais

- **RNF1 — Performance:** a carga inicial deve ocorrer em menos de 2 segundos em uma conexão típica; a alternância de unidade deve ser imediata e não depender da rede.
- **RNF2 — Responsividade:** a interface deve ser mobile-first e funcional em larguras de 320px até desktop, sem perda de conteúdo ou sobreposição.
- **RNF3 — Acessibilidade:** oferecer navegação por teclado, foco visível, labels e roles semânticos, mensagens compreensíveis e contraste compatível com WCAG AA básico.
- **RNF4 — Resiliência:** falhas de rede, timeout, rate limiting e indisponibilidade da API não devem travar a interface; o usuário deve receber uma mensagem clara e uma opção de nova tentativa quando aplicável.
- **RNF5 — Deploy simples:** utilizar uma fonte pública sem chave de API, permitindo deploy estático.
- **RNF6 — Idioma:** a interface da primeira versão deve estar em pt-BR.
- **RNF7 — Compatibilidade:** suportar navegadores modernos evergreen.
- **RNF8 — Qualidade:** o produto deve ser validável por lint, build, testes unitários e testes E2E.

## Fluxo principal

1. O usuário acessa o aplicativo.
2. O aplicativo apresenta o estado inicial e orienta a busca.
3. O usuário informa o nome de uma cidade.
4. O aplicativo busca sugestões e exibe dados de desambiguação.
5. O usuário seleciona uma cidade.
6. O aplicativo consulta e exibe o clima atual e a previsão de cinco dias.
7. O usuário pode alternar entre Celsius e Fahrenheit sem nova consulta.
8. Em caso de falha, o aplicativo informa o problema e permite tentar novamente.

## Dados e integrações

- **Fonte:** Open-Meteo.
- **Serviços utilizados:** geocoding para busca de cidades e forecast para clima atual e previsão.
- **Autenticação:** nenhuma chave de API.
- **Dados de localização:** nome, país, estado ou região quando disponível, latitude e longitude.
- **Dados meteorológicos:** temperatura, condição, umidade, vento, pressão e precipitação no atual; mínima, máxima, condição e precipitação na previsão diária.
- **Regra de unidade:** Celsius é a unidade padrão; Fahrenheit é uma alternativa apresentada ao usuário. A conversão deve ocorrer localmente a partir dos dados já carregados.
- **Timezone:** usar o timezone retornado pela fonte de dados para interpretar “hoje” e os quatro dias seguintes.

## Estados esperados

- **Inicial:** nenhuma cidade selecionada; apresentar orientação para buscar uma cidade.
- **Carregando sugestões:** indicar que a busca está em andamento e evitar ações duplicadas desnecessárias.
- **Sem resultados:** informar que nenhuma cidade foi encontrada e orientar uma nova busca.
- **Carregando previsão:** preservar uma estrutura estável e indicar carregamento dos dados meteorológicos.
- **Sucesso:** exibir cidade selecionada, clima atual e exatamente cinco dias de previsão.
- **Erro de busca:** informar falha no geocoding sem quebrar a interface.
- **Erro de previsão:** informar falha no forecast e oferecer “Tentar novamente”.
- **Timeout ou rede indisponível:** apresentar erro compreensível e permitir nova tentativa.
- **Resposta parcial:** exibir “—” para campos ausentes, sem desmontar o layout.
- **Entrada vazia:** não disparar requisição e orientar o preenchimento do campo.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Rate limiting ou indisponibilidade da Open-Meteo | Média | Alto | Tratar códigos e falhas de rede, mostrar mensagem clara e permitir nova tentativa; avaliar cache leve se necessário. |
| Cidades homônimas ou localização incorreta | Alta | Médio | Exibir país e estado/região nas sugestões e exigir seleção explícita da localidade. |
| Latência ou timeout | Média | Médio | Usar estados de carregamento, timeout controlado e mensagens acionáveis. |
| Falha de rede do usuário | Média | Médio | Não travar a UI, informar a falha e oferecer nova tentativa. |
| Inconsistência entre dispositivos | Média | Médio | Adotar abordagem mobile-first e testar viewports móveis e desktop. |
| Conversão de unidade incorreta | Baixa | Alto | Isolar a conversão em função pura e cobri-la com testes unitários. |
| Campo ausente na resposta da API | Média | Médio | Validar dados, aplicar fallback visual “—” e evitar acesso inseguro a campos. |

## Perguntas em aberto

As decisões abaixo foram fechadas para a primeira versão. Elas permanecem registradas porque delimitam decisões que poderiam alterar arquitetura ou experiência.

1. **Qual fonte de dados será utilizada?** Impacto: define endpoints, custo, limites e necessidade de chave.
2. **“Cinco dias” inclui hoje?** Impacto: define a quantidade de itens e o cálculo das datas.
3. **Haverá geolocalização automática?** Impacto: introduz permissões, privacidade e um fluxo alternativo de entrada.
4. **Qual será a unidade padrão?** Impacto: altera a primeira renderização e a interpretação dos valores.
5. **Haverá suporte offline ou cache?** Impacto: adiciona persistência local, validade dos dados e regras para informação desatualizada.
6. **Quais idiomas serão suportados?** Impacto: influencia textos, formatação de datas e possível estrutura de internacionalização.
7. **Haverá histórico ou favoritos?** Impacto: exige persistência e amplia o escopo funcional.
8. **Como tratar campos meteorológicos ausentes?** Impacto: define o contrato de dados e a robustez dos componentes.
9. **Como medir a meta de performance?** Impacto: define ambiente, conexão e critério de aceite verificável.

## Decisões

- **Fonte de dados:** Open-Meteo, por oferecer geocoding e forecast públicos sem chave de API, simplificando o deploy estático.
- **Período da previsão:** cinco dias, sendo hoje e os quatro dias seguintes, para atender à consulta rápida sem ampliar a complexidade da primeira versão.
- **Unidade padrão:** Celsius, por ser a unidade esperada pelo público principal da interface em pt-BR.
- **Alternativa de unidade:** Fahrenheit, com conversão local e sem nova requisição.
- **Autenticação:** não haverá login, pois o objetivo é uma consulta pessoal rápida.
- **Persistência de servidor:** não haverá persistência de servidor na v1, pois não há contas nem dados pessoais a armazenar.
- **Idioma:** pt-BR na primeira versão, mantendo internacionalização fora do escopo imediato.
- **Geolocalização automática:** não será incluída na v1 para evitar permissões e complexidade de UX; poderá ser uma melhoria futura.
- **Favoritos e histórico:** fora do escopo da v1 para manter o foco no fluxo de busca e consulta.
- **Deploy:** a arquitetura deve permitir publicação estática, sem backend próprio obrigatório.

## Fora do escopo da v1

- Autenticação e contas de usuário.
- Favoritos e histórico persistente.
- Geolocalização automática.
- Internacionalização além de pt-BR.
- Notificações push e alertas meteorológicos.
- Histórico climático.
- Backend próprio para proxy ou persistência.

## Critérios de entrada para a especificação

Antes de produzir a especificação completa, devem estar definidos:

- requisitos funcionais e não funcionais identificados;
- personas e fluxo principal;
- fonte de dados e decisões de escopo;
- modelo mínimo dos dados meteorológicos e suas unidades;
- regra de timezone e datas da previsão;
- estados de loading, erro, vazio, sucesso e resposta parcial;
- riscos e mitigações principais;
- itens fora do escopo;
- critérios de aceite mensuráveis para cada requisito.
