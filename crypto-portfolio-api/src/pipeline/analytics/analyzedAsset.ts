// Tipo extendido para el pipeline de análisis.
//
// El endpoint POST /assets/analyze recibe activos "crudos" y el
// pipeline les agrega campos (high_risk, analyzedAt) a medida que
// pasan por los filtros. Este tipo describe la forma final.

export interface AnalyzedAsset {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  high_risk?: boolean;   // Marcado por RiskAnalysisFilter
  analyzedAt?: string;   // Agregado por FormattingFilter
}
