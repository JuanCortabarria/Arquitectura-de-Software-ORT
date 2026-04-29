"""
Contrato común de las 3 estrategias.
classify(text) → (category_name | None, confidence: float en [0,1])
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional


class BaseClassifier(ABC):
    @abstractmethod
    def classify(self, text: str) -> tuple[Optional[str], float]:
        ...
