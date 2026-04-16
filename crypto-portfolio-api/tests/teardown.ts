import { sequelize } from '../src/config/database';
import mongoose from 'mongoose';

// Teardown global de tests: cierra las conexiones a MySQL y MongoDB
// para que Jest pueda terminar limpiamente.

export default async function teardown(): Promise<void> {
  await sequelize.close();
  await mongoose.disconnect();
}
