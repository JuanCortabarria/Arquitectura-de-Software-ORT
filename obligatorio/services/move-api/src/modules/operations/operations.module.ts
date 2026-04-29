import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';

/**
 * Operations Module — asignación vehículo+conductor (FR-12), iniciar/finalizar
 * traslado (FR-13, FR-17), consultar activos (FR-18). Sprint 3-4.
 */
@Module({
  controllers: [OperationsController],
})
export class OperationsModule {}
