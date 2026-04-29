"""
TF-IDF — estrategia línea base (HIST-3.1).

Vectorizador TF-IDF + cosine similarity sobre el corpus de ejemplos
de category_examples. En Sprint 1 el corpus se carga desde DB; aquí va el
bootstrap mínimo con los ejemplos del seed para poder responder /classify
desde el primer arranque.
"""
from __future__ import annotations

import os
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .base import BaseClassifier


# Corpus mínimo (mirrors db/seeds/categories.sql). HIST-3.1 carga el corpus
# completo desde category_examples al iniciar.
BOOTSTRAP_CORPUS: list[tuple[str, str]] = [
    ("Electrónicos", "monitor de computadora"),
    ("Electrónicos", "notebook lenovo"),
    ("Electrónicos", "televisor smart 55 pulgadas"),
    ("Electrónicos", "teclado mecánico"),
    ("Electrónicos", "celular samsung"),
    ("Muebles", "sillón de tres plazas"),
    ("Muebles", "mesa de comedor de madera"),
    ("Muebles", "cama king size"),
    ("Muebles", "escritorio de oficina"),
    ("Documentación", "documentación legal confidencial"),
    ("Documentación", "expediente notarial"),
    ("Documentación", "archivo de contratos"),
    ("Medicamentos", "medicamentos refrigerados"),
    ("Medicamentos", "vacunas en cadena de frío"),
    ("Medicamentos", "insumos farmacéuticos"),
    ("Repuestos", "repuesto motor de auto"),
    ("Repuestos", "kit de filtros"),
    ("Repuestos", "pastillas de freno"),
]


class TfidfClassifier(BaseClassifier):
    def __init__(self, threshold: Optional[float] = None) -> None:
        self.threshold = float(
            threshold
            if threshold is not None
            else os.environ.get("CLASSIFICATION_THRESHOLD", "0.35")
        )
        self.categories = [c for c, _ in BOOTSTRAP_CORPUS]
        texts = [t for _, t in BOOTSTRAP_CORPUS]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
        self.matrix = self.vectorizer.fit_transform(texts)

    def classify(self, text: str) -> tuple[Optional[str], float]:
        if not text or not text.strip():
            return None, 0.0

        query = self.vectorizer.transform([text])
        sims = cosine_similarity(query, self.matrix)[0]
        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])

        if best_score < self.threshold:
            return None, best_score

        return self.categories[best_idx], best_score
