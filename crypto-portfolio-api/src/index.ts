import express from 'express';
import type { Request, Response } from 'express';
import type { Asset } from './types';

// --- Configuración inicial ---
const app = express();

// Las variables de entorno se cargan desde el archivo .env
// usando el flag --env-file que viene nativo en Node.js 20.6+
const PORT = process.env.PORT || 3000;
const CRYPTO_API_URL = process.env.CRYPTO_API_URL;

// --- Middlewares ---
// IMPORTANTE: los middlewares deben registrarse ANTES de definir las rutas.
// express.json() permite que Express lea el body de los requests en formato JSON.
// Sin esto, req.body siempre sería undefined en POST y PUT.
app.use(express.json());

// --- Base de datos en memoria ---
// Usamos un array simple para almacenar los activos temporalmente.
// Los datos se pierden al reiniciar el servidor (es intencional para este ejercicio).
let assets: Asset[] = [];

// =============================================================================
// RUTAS CRUD
// =============================================================================

// 1. LEER TODOS LOS ACTIVOS
// GET /assets → devuelve el array completo
app.get('/assets', (req: Request, res: Response) => {
  res.status(200).json(assets);
});

// 2. LEER UN ACTIVO POR SÍMBOLO
// GET /assets/:symbol → busca y devuelve un activo específico
// El :symbol en la URL es un parámetro dinámico. Ej: GET /assets/BTC
app.get('/assets/:symbol', (req: Request, res: Response) => {
  const symbol = String(req.params.symbol).toUpperCase();

  const asset = assets.find(a => a.symbol === symbol);

  if (!asset) {
    res.status(404).json({ message: 'Activo no encontrado' });
    return; // Terminamos la ejecución aquí para no continuar con el código de abajo
  }

  res.status(200).json(asset);
});

// 3. CREAR UN ACTIVO
// POST /assets → recibe los datos en el body y lo agrega al array
app.post('/assets', (req: Request, res: Response) => {
  const { symbol, name, quantity, purchasePrice } = req.body;

  // Validación: verificamos que vengan todos los campos obligatorios
  if (!symbol || !name || quantity === undefined || purchasePrice === undefined) {
    res.status(400).json({ message: 'Faltan datos obligatorios: symbol, name, quantity, purchasePrice' });
    return;
  }

  // Validación de tipos: symbol y name deben ser texto
  if (typeof symbol !== 'string' || typeof name !== 'string') {
    res.status(400).json({ message: 'symbol y name deben ser texto (string)' });
    return;
  }

  // Validación: quantity y purchasePrice deben ser números positivos
  if (typeof quantity !== 'number' || quantity <= 0) {
    res.status(400).json({ message: 'quantity debe ser un número mayor a 0' });
    return;
  }
  if (typeof purchasePrice !== 'number' || purchasePrice <= 0) {
    res.status(400).json({ message: 'purchasePrice debe ser un número mayor a 0' });
    return;
  }

  // Verificamos que no exista ya un activo con el mismo símbolo
  const alreadyExists = assets.some(a => a.symbol === symbol.toUpperCase());
  if (alreadyExists) {
    res.status(409).json({ message: 'Ya existe un activo con ese símbolo en el portafolio' });
    return;
  }

  // Creamos el nuevo activo. Guardamos el símbolo siempre en MAYÚSCULAS para consistencia.
  const newAsset: Asset = {
    symbol: symbol.toUpperCase(),
    name,
    quantity,
    purchasePrice,
  };

  assets.push(newAsset);
  res.status(201).json(newAsset); // 201 = Created
});

// 4. ACTUALIZAR UN ACTIVO (reemplaza los campos que se envíen)
// PUT /assets/:symbol → modifica name, quantity y/o purchasePrice de un activo existente
app.put('/assets/:symbol', (req: Request, res: Response) => {
  const symbol = String(req.params.symbol).toUpperCase();

  // Buscamos la posición del activo en el array (-1 si no existe)
  const index = assets.findIndex(a => a.symbol === symbol);

  if (index === -1) {
    res.status(404).json({ message: 'Activo no encontrado' });
    return;
  }

  // Validaciones opcionales: solo validamos los campos que el usuario envió
  const { quantity, purchasePrice, name } = req.body;

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
    res.status(400).json({ message: 'quantity debe ser un número mayor a 0' });
    return;
  }
  if (purchasePrice !== undefined && (typeof purchasePrice !== 'number' || purchasePrice <= 0)) {
    res.status(400).json({ message: 'purchasePrice debe ser un número mayor a 0' });
    return;
  }
  if (name !== undefined && typeof name !== 'string') {
    res.status(400).json({ message: 'name debe ser texto (string)' });
    return;
  }

  // Spread operator (...): combina el objeto existente con los nuevos valores.
  // Los campos del req.body sobrescriben los del asset original.
  // El symbol no se puede cambiar (lo forzamos al final).
  const updatedAsset: Asset = { ...assets[index]!, ...req.body, symbol };
  assets[index] = updatedAsset;

  res.status(200).json(updatedAsset);
});

// 5. ELIMINAR UN ACTIVO
// DELETE /assets/:symbol → elimina el activo del array
app.delete('/assets/:symbol', (req: Request, res: Response) => {
  const symbol = String(req.params.symbol).toUpperCase();
  const initialLength = assets.length;

  // filter() crea un nuevo array sin el elemento que queremos borrar
  assets = assets.filter(a => a.symbol !== symbol);

  if (assets.length === initialLength) {
    // Si el largo no cambió, es porque el activo no existía
    res.status(404).json({ message: 'Activo no encontrado' });
    return;
  }

  res.status(204).send(); // 204 = No Content (eliminado con éxito, sin body)
});

// =============================================================================
// INTEGRACIÓN CON SERVICIO EXTERNO DE PRECIOS (CryptoCompare)
// =============================================================================

// GET /assets/:symbol/price → consulta el precio actual de un activo en tiempo real
// Esta ruta llama a la API de CryptoCompare para obtener el precio de mercado.
app.get('/assets/:symbol/price', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol).toUpperCase();

  // Verificamos que el activo exista en nuestro portafolio
  const asset = assets.find(a => a.symbol === symbol);
  if (!asset) {
    res.status(404).json({ message: 'Activo no encontrado en tu portafolio' });
    return;
  }

  try {
    // Construimos la URL de CryptoCompare:
    // fsym = "From Symbol" (ej: BTC) → el activo que queremos consultar
    // tsyms = "To Symbols" (ej: USD) → la moneda en la que queremos el precio
    const url = `${CRYPTO_API_URL}?fsym=${symbol}&tsyms=USD`;

    // fetch es nativo en Node.js 18+, no necesitamos instalar ninguna librería
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`La API externa respondió con error: ${response.status}`);
    }

    // CryptoCompare devuelve: { "USD": 65000.50 }
    const data = await response.json() as { USD?: number };
    const currentPrice = data.USD;

    if (!currentPrice) {
      res.status(400).json({ message: `No se encontró precio para: ${symbol}` });
      return;
    }

    // Calculamos la ganancia o pérdida respecto al precio de compra
    const gainOrLoss = (currentPrice - asset.purchasePrice) * asset.quantity;

    res.status(200).json({
      symbol: asset.symbol,
      name: asset.name,
      purchasePrice: asset.purchasePrice,
      currentPrice,
      gainOrLoss: parseFloat(gainOrLoss.toFixed(2)), // Redondeamos a 2 decimales
      currency: 'USD',
    });

  } catch (error) {
    // 502 Bad Gateway: nuestro servidor no pudo comunicarse con el servicio externo
    console.error('Error al consultar precio externo:', error);
    res.status(502).json({ message: 'Error al comunicarse con el proveedor de precios' });
  }
});

// =============================================================================
// ARRANQUE DEL SERVIDOR
// =============================================================================

// app.listen() debe ir AL FINAL, después de registrar todos los middlewares y rutas.
// Si lo ponés antes, el servidor empieza a aceptar conexiones antes de estar listo.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API externa: ${CRYPTO_API_URL}`);
});
