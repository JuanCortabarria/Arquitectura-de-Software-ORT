import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

/**
 * Admin Module — categorías y reglas (FR-8), zonas (FR-9), vehículos (FR-10),
 * usuarios (FR-11). Implementación detallada en Sprint 1-2.
 */
@Module({
  controllers: [AdminController],
})
export class AdminModule {}
