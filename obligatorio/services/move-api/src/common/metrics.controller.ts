import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ prefix: 'move_api_' });

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}
