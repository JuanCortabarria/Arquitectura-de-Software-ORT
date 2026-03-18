// Una "interface" en TypeScript es como un molde o contrato.
// Le dice a TypeScript: "todo objeto de tipo Asset DEBE tener exactamente estos campos".
// Si intentás crear un Asset sin alguno de estos campos, TypeScript te avisa con un error.
export interface Asset {
  symbol: string;        // Símbolo del activo. Ej: "BTC", "ETH"
  name: string;          // Nombre completo. Ej: "Bitcoin", "Ethereum"
  quantity: number;      // Cantidad de unidades que el usuario posee
  purchasePrice: number; // Precio en USD al momento de la compra
}
