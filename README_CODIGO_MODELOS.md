# Código dos modelos NPS Swift

Este patch adiciona os scripts Python para treinar novamente os modelos usados pela API do dashboard, sem alterar a aparência do front.

## Arquivos adicionados

```text
scripts/treinar_modelo_sentimento.py
scripts/treinar_modelo_categorizacao.py
scripts/testar_modelos.py
requirements-modelos.txt
README_CODIGO_MODELOS.md
```

## Onde ficam os modelos usados pelo dashboard

A API Python do dashboard carrega os modelos aqui:

```text
api/models/modelo_sentimento.joblib
api/models/modelo_categorizacao.joblib
```

Sempre que você treinar de novo, os scripts salvam nesses caminhos por padrão.

## Instalar dependências de treino

Essas dependências são para treinar os modelos localmente. A Vercel usa o `requirements.txt` do projeto para rodar a API.

```powershell
pip install -r requirements-modelos.txt
```

## Treinar sentimento

Padrão esperado do CSV:

- coluna de comentário: `comentario_limpo`, `comentario`, `texto`, `feedback` ou parecida;
- coluna de classificação NPS: `classificacao`, `classe_nps` etc.;
- ou coluna de nota: `nota`, `score`, `nps` etc.

Com o caminho padrão do notebook original:

```powershell
python scripts/treinar_modelo_sentimento.py
```

Ou apontando para outro CSV:

```powershell
python scripts/treinar_modelo_sentimento.py --input "caminho/da/base.csv"
```

Saída padrão:

```text
api/models/modelo_sentimento.joblib
models/relatorio_modelo_sentimento.json
```

## Treinar categorização

Padrão esperado do CSV:

- coluna de comentário: `comentario`, `comentario_limpo`, `texto` etc.;
- coluna de categoria: `categoria_anotador_1`, `categoria_final`, `categoria` etc.

Com o caminho padrão do notebook original:

```powershell
python scripts/treinar_modelo_categorizacao.py
```

Ou apontando para outro CSV:

```powershell
python scripts/treinar_modelo_categorizacao.py --input "caminho/da/amostra_anotada.csv"
```

Saída padrão:

```text
api/models/modelo_categorizacao.joblib
models/relatorio_modelo_categorizacao.json
```

## Testar os modelos

```powershell
python scripts/testar_modelos.py
```

## Depois de treinar

Faça commit dos modelos atualizados e dos relatórios, se quiser guardar histórico:

```powershell
git add api/models scripts requirements-modelos.txt README_CODIGO_MODELOS.md models
git commit -m "adiciona codigo de treino dos modelos"
git push
```

A Vercel redeploya automaticamente e continua usando a mesma tela do dashboard.
