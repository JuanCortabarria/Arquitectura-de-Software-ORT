import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('operations')
@Controller('operations')
export class OperationsController {
  @Get('ping')
  ping() {
    return { module: 'operations', ready: false, sprint: 3 };
  }
}
