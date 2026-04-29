import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

/**
 * Auth Module — registro de clientes (FR-1) y login OAuth2/OIDC (FR-2).
 * El Auth Guard JWT (HIST-1.4) llega en Sprint 1.
 */
@Module({
  controllers: [AuthController],
})
export class AuthModule {}
