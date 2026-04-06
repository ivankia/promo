import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../services/prisma.service';

@ApiTags('Работоспособность сервиса')
@Controller('healthcheck')
export class HealthcheckController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка рабтоспособности сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает нормально',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        database: { type: 'string', example: 'connected' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Серис неисправен',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'UNHEALTHY' },
        database: { type: 'string', example: 'disconnected' },
        error: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async healthcheck() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'OK',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'UNHEALTHY',
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
