# Projeto NPS Swift — Análises de Negócio e Front Interativo

Este pacote entrega um front em Streamlit com dashboards executivos, upload de CSV, inferência dos modelos e cálculo do NPS ajustado.

## 1. Resumo executivo

- Base inferida: **128,341 comentários**, **228 lojas**, período de **2025-01-01 a 2026-05-01**.
- NPS tradicional geral: **68.9**.
- Score textual de sentimento: **49.6**.
- NPS ajustado 70/30: **63.1**.
- Divergência entre nota e texto: **22.4%** dos comentários.

## 2. Germinare/Tocadora x Regular

| tipo_gestao        |   comentarios |   avaliacoes_ponderadas |   promotores_% |   neutros_% |   detratores_% |   nps_tradicional |   sentimento_positivo_% |   sentimento_negativo_% |   score_sentimento |   nps_ajustado |   divergencia_% |   baixa_conf_sent_% |   baixa_conf_cat_% |
|:-------------------|--------------:|------------------------:|---------------:|------------:|---------------:|------------------:|------------------------:|------------------------:|-------------------:|---------------:|----------------:|--------------------:|-------------------:|
| Sem flag           |         401.0 |                   402.0 |           85.6 |         6.2 |            8.2 |              77.4 |                    79.4 |                    12.7 |               66.7 |           74.2 |            15.0 |                22.2 |               29.9 |
| Regular            |       98597.0 |                 98673.0 |           79.2 |        12.1 |            8.7 |              70.5 |                    67.6 |                    16.2 |               51.5 |           64.8 |            22.0 |                33.2 |               30.8 |
| Tocadora/Germinare |       29343.0 |                 29375.0 |           74.9 |        13.7 |           11.4 |              63.5 |                    62.5 |                    19.3 |               43.2 |           57.4 |            23.8 |                34.9 |               30.2 |

## 3. Principais problemas gerais

| categoria_modelo          |   qtd |
|:--------------------------|------:|
| Qualidade do produto      | 22886 |
| Entrega / Pedido digital  |  9215 |
| Atendimento / Loja física |  4284 |
| Preço / Promoções         |  2531 |
| App / Site / Pagamento    |  2215 |
| Outros / Genéricos        |  1915 |

## 4. Principais elogios gerais

| categoria_modelo          |   qtd |
|:--------------------------|------:|
| Atendimento / Loja física | 23784 |
| Outros / Genéricos        | 23314 |
| Preço / Promoções         | 18217 |
| Qualidade do produto      | 15436 |
| Entrega / Pedido digital  |  3013 |
| App / Site / Pagamento    |  1531 |

## 5. Lojas com maior diferença entre NPS tradicional e ajustado

| centronv2                          | tipo_gestao        | regiao_im   |   comentarios |   nps_tradicional |   nps_ajustado |   gap_ajustado_vs_tradicional |   divergencia_% |
|:-----------------------------------|:-------------------|:------------|--------------:|------------------:|---------------:|------------------------------:|----------------:|
| L5129-REAL PARQUE                  | Tocadora/Germinare | Capital     |         388.0 |              74.0 |           64.7 |                          -9.3 |            24.7 |
| L5220-PLANALTO                     | Regular            | RMSP        |         456.0 |              61.8 |           52.6 |                          -9.2 |            27.9 |
| L5043-PORTUGAL (1239)              | Regular            | RMSP        |         453.0 |              60.5 |           51.5 |                          -8.9 |            32.9 |
| L5074-VOLUNTARIOS DA PATRIA (1335) | Tocadora/Germinare | Capital     |         423.0 |              55.8 |           46.9 |                          -8.9 |            29.8 |
| L5184-PRACA VARNHAGEM              | Regular            | RJ          |        1364.0 |              65.8 |           57.1 |                          -8.7 |            29.2 |
| L5002-ALPHAVILLE (0290)            | Regular            | RMSP        |         785.0 |              60.8 |           52.1 |                          -8.6 |            28.3 |
| L5273-MORRO GRANDE                 | Tocadora/Germinare | Capital     |         320.0 |              65.3 |           56.7 |                          -8.6 |            27.5 |
| L5097-JUNDIAI (1404)               | Regular            | Interior    |         636.0 |              61.0 |           52.6 |                          -8.4 |            28.0 |
| L5091-NOVA CANTAREIRA (1366)       | Tocadora/Germinare | Capital     |         458.0 |              66.2 |           57.8 |                          -8.4 |            26.4 |
| L5067-CHACARA ST. ANTONIO (1318)   | Tocadora/Germinare | Capital     |         416.0 |              57.3 |           49.0 |                          -8.3 |            28.8 |
| L5252-14 DE DEZEMBRO               | Regular            | Interior    |         620.0 |              66.0 |           57.6 |                          -8.3 |            27.4 |
| L5015-BARAO ITAPURA (0570)         | Tocadora/Germinare | Interior    |         341.0 |              63.0 |           54.9 |                          -8.2 |            26.4 |
| L5206-CACHOEIRINHA                 | Tocadora/Germinare | Capital     |         477.0 |              58.1 |           49.9 |                          -8.2 |            25.6 |
| L5100-INTERLAGOS (1431)            | Regular            | Capital     |         604.0 |              65.4 |           57.3 |                          -8.1 |            23.8 |
| L5178-PERIMETRAL                   | Regular            | RMSP        |         661.0 |              66.3 |           58.1 |                          -8.1 |            27.5 |

## 6. Limitações honestas

- O modelo de sentimento foi treinado com a classificação NPS como proxy inicial de sentimento. Por isso, o dashboard trata divergências como casos de revisão, não como verdade absoluta.
- O modelo de categorização foi treinado com rótulos pseudo-supervisionados derivados da taxonomia LDA/negócio. O ideal é refiná-lo quando houver uma base maior anotada manualmente.
- O NPS ajustado é complementar, não substitui o NPS tradicional. A fórmula adotada é conservadora: `0,7 × NPS tradicional + 0,3 × Score de Sentimento`.
