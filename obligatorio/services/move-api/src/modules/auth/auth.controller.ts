import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('ping')
  ping() {
    return { module: 'auth', ready: false, sprint: 1 };
  }
}
