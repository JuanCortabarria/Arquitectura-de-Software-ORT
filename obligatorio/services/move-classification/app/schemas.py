from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ClassifyRequest(BaseModel):
    descriptions: list[str] = Field(..., min_length=1, max_length=20)


class ClassifyResult(BaseModel):
    description: str
    category: Optional[str]
    confidence: float
    strategy_used: str


class ClassifyResponse(BaseModel):
    results: list[ClassifyResult]
