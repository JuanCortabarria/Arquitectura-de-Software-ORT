"""
Estrategia semántica (HIST-3.2) — sentence-transformers + pgvector.
Stub: pendiente Sprint 2. Se mantiene el contrato para que la factory
no falle al seleccionar la estrategia.
"""
from __future__ import annotations

from typing import Optional

from .base import BaseClassifier


class SemanticClassifier(BaseClassifier):
    def __init__(self) -> None:
        raise NotImplementedError(
            "SemanticClassifier llega en Sprint 2 (HIST-3.2). "
            "Usar CLASSIFICATION_STRATEGY=tfidf por ahora."
        )

    def classify(self, text: str) -> tuple[Optional[str], float]:
        raise NotImplementedError
