import 'dotenv/config';
import { sequelize } from '../src/config/database';
import { connectMongo } from '../src/config/mongodb';

// Setup global de tests: conecta a MySQL y MongoDB antes de ejecutar
// cualquier test. Usa { force: true } para recrear las tablas desde cero.

export default async function setup(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await connectMongo();
}
