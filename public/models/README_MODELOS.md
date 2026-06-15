# Artefatos públicos do dashboard

Esta pasta contém somente os arquivos que podem ir para o bundle público do front.

## Arquivos

- `base_inferida_swift.csv.gz`: base padrão já inferida usada para gerar `src/data/nps.ts`.
- `model_metrics.json`: métricas registradas dos modelos.
- `model_manifest.json`: manifesto dos artefatos.

Os modelos `.joblib` pesados foram movidos para `entrega/modelos_salvos/` e ignorados pela Vercel. O runtime da Vercel usa as versões leves em:

```text
api/models/modelo_sentimento_lite.json.gz
api/models/modelo_categorizacao_lite.json.gz
```
