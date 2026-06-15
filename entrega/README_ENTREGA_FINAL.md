# Entrega Final — Projeto NPS Swift

Este diretório organiza os artefatos finais pedidos para a entrega de Ciência de Dados.

## Resumo do projeto

A solução combina um dashboard executivo em React/TanStack Start com processamento em Python. O front mantém a visualização interativa para o negócio, enquanto a API Python processa CSVs, aplica modelos de sentimento/categorização, calcula o NPS tradicional e o NPS ajustado, gera comparativos por loja/gestão/região e produz os relatórios finais.

## Principais resultados da base inferida

Com a base inferida disponível em `outputs/base_inferida_completa.csv.gz`:

- Comentários analisados: **128.341**
- Avaliações ponderadas: **128.450**
- NPS tradicional geral: **68,92**
- Score textual de sentimento: **49,62**
- NPS ajustado: **63,13**
- Divergência nota × texto: **22,37%**

## Fórmula proposta para o NPS ajustado

A abordagem escolhida foi o **NPS híbrido com score de sentimento**, pois ela preserva o NPS tradicional como base da análise e incorpora o comentário como sinal complementar.

```text
NPS_ajustado = 0,7 × NPS_tradicional + 0,3 × Score_sentimento
```

Onde:

```text
NPS_tradicional = % promotores - % detratores
Score_sentimento = % positivos - % negativos
```

Justificativa: a nota continua sendo o principal sinal quantitativo, mas comentários negativos em notas altas e comentários positivos em notas baixas aparecem como divergência e reduzem/aumentam o indicador agregado de maneira conservadora.

## Estrutura da entrega

```text
entrega/
├─ README_ENTREGA_FINAL.md
├─ CHECKLIST_ENTREGA.md
├─ modelos_salvos/
│  ├─ modelo_sentimento.joblib
│  ├─ modelo_categorizacao.joblib
│  ├─ sentiment_model_original.joblib
│  ├─ category_model_original.joblib
│  ├─ model_metrics.json
│  └─ README_MODELOS.md
├─ notebooks/
│  ├─ 00_ENTREGA_FINAL_REPRODUTIVEL.ipynb
│  └─ originais_entrega1/
├─ outputs/
│  ├─ base_inferida_completa.csv.gz
│  ├─ resumo_geral.csv
│  ├─ comparativo_gestao.csv
│  ├─ problemas_gerais.csv
│  ├─ elogios_gerais.csv
│  ├─ lojas_resumo.csv
│  ├─ impacto_nps_ajustado_lojas.csv
│  ├─ casos_extremos_divergencia.csv
│  └─ ANALISES_NEGOCIO.md
└─ documentos_base/
```

## Como reproduzir a geração dos outputs

Na raiz do projeto:

```powershell
python scripts/gerar_outputs_entrega.py
```

Para treinar os modelos novamente, instale as dependências locais de modelagem:

```powershell
pip install -r requirements-modelos.txt
python scripts/treinar_modelo_sentimento.py --input "caminho/da/base.csv"
python scripts/treinar_modelo_categorizacao.py --input "caminho/da/base_anotada.csv"
```

## Observações metodológicas

- O modelo de sentimento usa classificação ternária: positivo, neutro e negativo.
- A categorização segue as categorias: Atendimento/Loja física, Preço/Promoções, Qualidade do produto, App/Site/Pagamento, Entrega/Pedido digital e Outros/Genéricos.
- A base final possui colunas de sentimento, categoria, confiança, baixa confiança e divergência nota × texto.
- Os modelos leves em `api/models/*.json.gz` são usados na Vercel para evitar o estouro de tamanho da função serverless.
- Os modelos `.joblib` permanecem em `entrega/modelos_salvos/` para avaliação técnica e reprodução local.
