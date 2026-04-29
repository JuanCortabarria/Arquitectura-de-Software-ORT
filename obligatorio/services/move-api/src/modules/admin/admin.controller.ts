import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Get('ping')
  ping() {
    return { module: 'admin', ready: false, sprint: 1 };
  }
}
