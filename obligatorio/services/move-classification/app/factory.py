"""
ClassifierFactory — selecciona la estrategia activa según
la env var CLASSIFICATION_STRATEGY (ADR-005).
"""
from __future__ import annotations

from .classifiers.base import BaseClassifier


def build_classifier(strategy: str) -> BaseClassifier:
    strategy = (strategy or "tfidf").lower()

    if strategy == "tfidf":
        from .classifiers.tfidf import TfidfClassifier
        return TfidfClassifier()

    if strategy == "semantic":
        # HIST-3.2 — pendiente Sprint 2
        from .classifiers.semantic import SemanticClassifier
        return SemanticClassifier()

    if strategy == "ollama":
        # HIST-3.3 — pendiente Sprint 3
        from .classifiers.ollama import OllamaClassifier
        return OllamaClassifier()

    raise ValueError(f"Estrategia de clasificación desconocida: {strategy}")
