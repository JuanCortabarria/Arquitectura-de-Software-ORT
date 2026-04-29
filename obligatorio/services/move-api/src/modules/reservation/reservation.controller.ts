import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationController {
  @Get('ping')
  ping() {
    return { module: 'reservation', ready: false, sprint: 2 };
  }
}
