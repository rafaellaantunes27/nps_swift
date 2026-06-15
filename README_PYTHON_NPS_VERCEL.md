# Python + Vercel — NPS Swift

O projeto mantém o front React/TanStack Start visualmente igual e concentra os cálculos em Python.

## Runtime da Vercel

A rota `/api/process_nps` recebe um CSV enviado pelo front e chama `api/nps_engine.py` para produzir o mesmo formato de dados usado pelo dashboard.

Para evitar o limite de tamanho da Lambda, o runtime Python da Vercel **não instala** `scikit-learn`, `numpy` nem `scipy`. Em produção, os modelos rodam em formato leve:

```text
api/models/modelo_sentimento_lite.json.gz
api/models/modelo_categorizacao_lite.json.gz
```

Os modelos `.joblib` ficam apenas na pasta acadêmica:

```text
entrega/modelos_salvos/
```

A `.vercelignore` impede que `entrega/`, notebooks, `.joblib`, `node_modules`, `dist` e outros artefatos pesados entrem no deploy.

## O que o Python calcula

- Classificação NPS: promotor, neutro e detrator.
- Sentimento do comentário: positivo, neutro e negativo.
- Categoria do comentário.
- Confiança e flag de baixa confiança.
- NPS tradicional.
- Score de sentimento.
- NPS ajustado.
- Matriz NPS × categoria.
- Ranking por loja, gestão, região e mês.
- Exemplos representativos e casos de divergência.

## Teste local

```powershell
npx vercel dev
```

## Regenerar outputs da entrega

```powershell
python scripts/gerar_outputs_entrega.py
```

## Regenerar base padrão do front

```powershell
python scripts/gerar_dados_nps.py
```
