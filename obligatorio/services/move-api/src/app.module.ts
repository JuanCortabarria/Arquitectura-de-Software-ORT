import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './common/health.controller';
import { MetricsController } from './common/metrics.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { OperationsModule } from './modules/operations/operations.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'postgres',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER ?? 'move',
      password: process.env.POSTGRES_PASSWORD ?? 'move_local_dev',
      database: process.env.POSTGRES_DB ?? 'move',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    AdminModule,
    ReservationModule,
    OperationsModule,
    NotificationModule,
  ],
  controllers: [HealthController, MetricsController],
})
export class AppModule {}
