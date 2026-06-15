# Modelos salvos — NPS Swift

Esta pasta guarda os modelos em formato `.joblib` para a entrega técnica.

## Arquivos

- `modelo_sentimento.joblib`: modelo atualizado de análise de sentimento enviado para o projeto.
- `modelo_categorizacao.joblib`: modelo atualizado de categorização enviado para o projeto.
- `sentiment_model_original.joblib`: artefato original preservado do pacote inicial.
- `category_model_original.joblib`: artefato original preservado do pacote inicial.
- `model_metrics.json`: métricas registradas dos modelos originais.
- `model_manifest.json`: manifesto dos artefatos.

## Como carregar localmente

Instale as dependências de modelagem:

```powershell
pip install -r requirements-modelos.txt
```

Exemplo em Python:

```python
import joblib

modelo_sentimento = joblib.load("entrega/modelos_salvos/modelo_sentimento.joblib")
modelo_categoria = joblib.load("entrega/modelos_salvos/modelo_categorizacao.joblib")

comentarios = ["Atendimento excelente e loja organizada"]
print(modelo_sentimento.predict(comentarios))
print(modelo_categoria.predict(comentarios))
```

## Como a Vercel usa os modelos

A Vercel não usa os `.joblib` diretamente porque `scikit-learn`, `numpy` e `scipy` deixam a função serverless grande demais. Para produção, o projeto usa versões leves em:

```text
api/models/modelo_sentimento_lite.json.gz
api/models/modelo_categorizacao_lite.json.gz
```

Essas versões são lidas por `api/lightweight_models.py`, usando apenas biblioteca padrão do Python.

## Onde alterar no código

- Cálculo do NPS: `api/nps_engine.py`, função `summarize()`.
- Regra promotor/neutro/detrator: `api/nps_engine.py`, função `nps_class_from_score()`.
- Inferência de sentimento: `api/nps_engine.py`, função `predict_sentiment_with_model()`.
- Inferência de categoria: `api/nps_engine.py`, função `predict_category_with_model()`.
