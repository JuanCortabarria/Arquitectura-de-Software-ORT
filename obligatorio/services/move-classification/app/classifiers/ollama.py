"""
Estrategia generativa local (HIST-3.3) — Ollama.
Stub: pendiente Sprint 3.
"""
from __future__ import annotations

from typing import Optional

from .base import BaseClassifier


class OllamaClassifier(BaseClassifier):
    def __init__(self) -> None:
        raise NotImplementedError(
            "OllamaClassifier llega en Sprint 3 (HIST-3.3). "
            "Usar CLASSIFICATION_STRATEGY=tfidf por ahora."
        )

    def classify(self, text: str) -> tuple[Optional[str], float]:
        raise NotImplementedError
