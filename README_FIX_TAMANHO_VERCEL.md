# Correção do limite de tamanho da Lambda na Vercel

O deploy falhava porque `requirements.txt` instalava `scikit-learn`, `numpy` e `scipy`. Essas dependências entram no bundle da função Python e estouram o limite da Vercel.

Este patch mantém o processamento em Python, mas troca o runtime dos modelos para arquivos leves:

- `api/models/modelo_sentimento_lite.json.gz`
- `api/models/modelo_categorizacao_lite.json.gz`
- `api/lightweight_models.py`

Assim a API Python usa somente biblioteca padrão do Python no deploy.

Os arquivos `.joblib` podem continuar no projeto para histórico/treino local, mas são ignorados no deploy pela `.vercelignore`.

## Aplicar

```powershell
npm run build
git add .
git commit -m "reduz tamanho da funcao python na vercel"
git push
```

Se o Git já estiver rastreando os `.joblib`, rode:

```powershell
git rm -r --cached --ignore-unmatch api/models/*.joblib
git add .
git commit -m "remove joblib pesado do deploy"
git push
```

## Treino local

Para treinar de novo, use os scripts e `requirements-modelos.txt` localmente. Depois exporte/substitua os modelos lite.
