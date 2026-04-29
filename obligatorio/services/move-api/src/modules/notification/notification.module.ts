import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';

/**
 * Notification Module — SSE al Operador (FR-19a), email transaccional (FR-19b).
 * Sprint 3-4.
 */
@Module({
  controllers: [NotificationController],
})
export class NotificationModule {}
