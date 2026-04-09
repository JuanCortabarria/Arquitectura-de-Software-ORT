// Modelo de un activo del portafolio.
// Reemplaza al viejo src/types.ts.
//
// IMPORTANTE: ahora la clave primaria es "id" (un UUID v4),
// no "symbol" como en la Parte 1. El symbol sigue siendo un dato del
// activo (y se sigue normalizando a mayúsculas), pero ya no se usa
// para buscar dentro del repositorio.
export interface Asset {
  id: string;            // UUID v4 generado al crear el activo
  symbol: string;        // Símbolo del activo. Ej: "BTC", "ETH"
  name: string;          // Nombre completo. Ej: "Bitcoin", "Ethereum"
  quantity: number;      // Cantidad de unidades que posee el usuario
  purchasePrice: number; // Precio en USD al momento de la compra
}
