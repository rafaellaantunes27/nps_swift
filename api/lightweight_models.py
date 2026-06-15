from __future__ import annotations

import gzip
import json
import math
import re
import unicodedata
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any

MODEL_DIR = Path(__file__).resolve().parent / 'models'
WORD_TOKEN_RE = re.compile(r'(?u)\b\w\w+\b')


def _strip_accents_unicode(text: str) -> str:
    return ''.join(
        ch for ch in unicodedata.normalize('NFKD', text)
        if not unicodedata.combining(ch)
    )


def _preprocess(text: str, vectorizer: dict[str, Any]) -> str:
    if vectorizer.get('lowercase', True):
        text = text.lower()
    if vectorizer.get('strip_accents') == 'unicode':
        text = _strip_accents_unicode(text)
    return text


def _word_ngrams(text: str, ngram_range: list[int]) -> list[str]:
    tokens = WORD_TOKEN_RE.findall(text)
    lo, hi = int(ngram_range[0]), int(ngram_range[1])
    result: list[str] = []
    for n in range(lo, hi + 1):
        if len(tokens) < n:
            continue
        result.extend(' '.join(tokens[i:i+n]) for i in range(0, len(tokens) - n + 1))
    return result


def _char_wb_ngrams(text: str, ngram_range: list[int]) -> list[str]:
    # Aproxima o analyzer='char_wb' do sklearn: gera n-gramas dentro dos limites de palavra.
    lo, hi = int(ngram_range[0]), int(ngram_range[1])
    result: list[str] = []
    for word in re.findall(r'\S+', text):
        padded = f' {word} '
        length = len(padded)
        for n in range(lo, hi + 1):
            if length < n:
                continue
            result.extend(padded[i:i+n] for i in range(0, length - n + 1))
    return result


def _features_for_vectorizer(text: str, vectorizer: dict[str, Any]) -> dict[int, float]:
    processed = _preprocess(text, vectorizer)
    analyzer = vectorizer.get('analyzer', 'word')
    ngram_range = vectorizer.get('ngram_range', [1, 1])
    if analyzer == 'char_wb':
        terms = _char_wb_ngrams(processed, ngram_range)
    else:
        terms = _word_ngrams(processed, ngram_range)

    if not terms:
        return {}

    vocab_terms = vectorizer.get('vocabulary', [])
    vocab = {term: idx for idx, term in enumerate(vocab_terms)}
    counts = Counter()
    for term in terms:
        idx = vocab.get(term)
        if idx is not None:
            counts[idx] += 1

    if not counts:
        return {}

    idf = vectorizer.get('idf', [])
    sublinear = bool(vectorizer.get('sublinear_tf', True))
    values: dict[int, float] = {}
    norm_sq = 0.0
    for idx, count in counts.items():
        tf = 1.0 + math.log(float(count)) if sublinear else float(count)
        value = tf * float(idf[idx])
        values[idx] = value
        norm_sq += value * value

    if vectorizer.get('norm', 'l2') == 'l2' and norm_sq > 0:
        norm = math.sqrt(norm_sq)
        values = {idx: value / norm for idx, value in values.items()}
    return values


@lru_cache(maxsize=4)
def _load_model(filename: str) -> dict[str, Any] | None:
    path = MODEL_DIR / filename
    if not path.exists():
        return None
    try:
        with gzip.open(path, 'rt', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def _softmax(scores: list[float]) -> list[float]:
    if not scores:
        return []
    m = max(scores)
    exps = [math.exp(max(-50.0, min(50.0, s - m))) for s in scores]
    denom = sum(exps) or 1.0
    return [v / denom for v in exps]


def predict_lite(filename: str, text: str) -> dict[str, Any] | None:
    model = _load_model(filename)
    if not model:
        return None
    text = str(text or '').strip()
    if not text:
        return None

    classes = [str(c) for c in model.get('classes', [])]
    scores = [float(x) for x in model.get('intercept', [0.0] * len(classes))]
    if len(scores) < len(classes):
        scores.extend([0.0] * (len(classes) - len(scores)))

    for vectorizer in model.get('vectorizers', []):
        features = _features_for_vectorizer(text, vectorizer)
        if not features:
            continue
        coefs = vectorizer.get('coef', [])
        for class_idx in range(min(len(classes), len(coefs))):
            row = coefs[class_idx]
            total = 0.0
            for feature_idx, value in features.items():
                if feature_idx < len(row):
                    total += float(row[feature_idx]) * value
            scores[class_idx] += total

    if not classes:
        return None
    best_idx = max(range(len(classes)), key=lambda i: scores[i])
    probs = _softmax(scores)
    confidence = probs[best_idx] if probs else 0.72
    return {
        'label': classes[best_idx],
        'confidence': float(max(0.0, min(1.0, confidence))),
        'scores': {cls: float(probs[i]) for i, cls in enumerate(classes)} if probs else {},
        'source': filename,
    }


def lite_model_status() -> dict[str, Any]:
    return {
        'sentimento': {
            'arquivo': 'modelo_sentimento_lite.json.gz',
            'carregado': _load_model('modelo_sentimento_lite.json.gz') is not None,
        },
        'categorizacao': {
            'arquivo': 'modelo_categorizacao_lite.json.gz',
            'carregado': _load_model('modelo_categorizacao_lite.json.gz') is not None,
        },
    }
