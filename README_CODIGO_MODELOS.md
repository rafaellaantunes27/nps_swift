# Código dos modelos — NPS Swift

Os scripts de treino ficam em `scripts/` e permitem reproduzir/atualizar os modelos de sentimento e categorização.

## Instalar dependências locais de treino

```powershell
pip install -r requirements-modelos.txt
```

## Treinar sentimento

```powershell
python scripts/treinar_modelo_sentimento.py --input "caminho/da/base.csv"
```

## Treinar categorização

```powershell
python scripts/treinar_modelo_categorizacao.py --input "caminho/da/base_anotada.csv"
```

## Testar os modelos `.joblib`

```powershell
python scripts/testar_modelos.py
```

## Onde ficam os modelos

Para a entrega acadêmica:

```text
entrega/modelos_salvos/*.joblib
```

Para o runtime da Vercel:

```text
api/models/*.json.gz
```

A Vercel usa os modelos leves para evitar dependências pesadas no servidor. Se os modelos forem treinados de novo, gere também uma versão leve antes do deploy.
