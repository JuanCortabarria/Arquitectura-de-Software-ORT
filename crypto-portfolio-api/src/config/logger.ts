import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Logger centralizado con Winston.
//
// Reemplaza a console.log/console.error en todo el proyecto.
// Tiene dos "transports" (destinos donde escribe los logs):
//   1) Console: para verlos durante el desarrollo.
//   2) File:    para guardarlos en logs/app.log y poder revisarlos
//               después o enviárselos a un sistema de monitoreo.

// Aseguramos que la carpeta logs/ exista antes de que Winston intente
// escribir en ella (si no existe, Winston tira error en runtime).
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export const logger = winston.createLogger({
  level: 'info', // Nivel mínimo: info, warn, error (descarta debug)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // Consola: formato simple y con colores para que sea fácil de leer.
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // Archivo: formato JSON para que sea fácil de parsear más adelante.
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
    }),
  ],
});
