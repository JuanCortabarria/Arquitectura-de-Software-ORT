import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  @Get('ping')
  ping() {
    return { module: 'notification', ready: false, sprint: 3 };
  }
}
