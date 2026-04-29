"""
move-classification — Clasificación de bienes a categorías MOVE.

Expone /classify con tres estrategias intercambiables (R10, ADR-005)
seleccionadas por la env var CLASSIFICATION_STRATEGY.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from .factory import build_classifier
from .schemas import ClassifyRequest, ClassifyResponse, ClassifyResult


@asynccontextmanager
async def lifespan(app: FastAPI):
    strategy = os.environ.get("CLASSIFICATION_STRATEGY", "tfidf")
    app.state.classifier = build_classifier(strategy)
    app.state.strategy = strategy
    yield


app = FastAPI(
    title="MOVE Classification Service",
    version="0.1.0",
    description="Clasificación IA de bienes a categorías MOVE (R10).",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "move-classification",
        "strategy": app.state.strategy if hasattr(app.state, "strategy") else None,
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/metrics", response_class=PlainTextResponse)
def metrics():
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest) -> ClassifyResponse:
    classifier = getattr(app.state, "classifier", None)
    if classifier is None:
        raise HTTPException(status_code=503, detail="classifier not initialized")

    results: list[ClassifyResult] = []
    for description in request.descriptions:
        category, confidence = classifier.classify(description)
        results.append(
            ClassifyResult(
                description=description,
                category=category,
                confidence=confidence,
                strategy_used=app.state.strategy,
            )
        )

    return ClassifyResponse(results=results)
