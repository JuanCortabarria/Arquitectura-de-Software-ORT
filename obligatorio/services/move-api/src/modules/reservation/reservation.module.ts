import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';

/**
 * Reservation Module — flujo de reservas particulares (FR-4.1) y empresa (FR-4.2),
 * cotización (FR-5), pagos (FR-6), consulta (FR-7).
 * Implementación en Sprint 2-3.
 */
@Module({
  controllers: [ReservationController],
})
export class ReservationModule {}
