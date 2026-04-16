import { Sequelize } from 'sequelize';

// Conexión a MySQL mediante Sequelize.
//
// Lee las credenciales de las variables de entorno. Los valores por
// defecto coinciden con el docker-compose.yml para que funcione
// "out of the box" al hacer docker compose up.

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'secret',
  database: process.env.MYSQL_DATABASE || 'crypto_portfolio',
  logging: false,
  // Deshabilita timestamps (createdAt/updatedAt) globalmente para todos los
  // modelos. Sin esto, si un modelo olvida declarar timestamps: false,
  // Sequelize intenta añadir esas columnas y rompe la tabla.
  define: {
    timestamps: false,
  },
});
