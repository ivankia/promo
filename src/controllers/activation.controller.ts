import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ActivationService } from '../services/activation.service';
import type { ActivationResponse } from '../types/activation';
import { ActivateDto } from '../dto/activation/activate.dto';

@ApiTags('Активация')
@Controller('activate')
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @Post()
  @ApiOperation({ summary: 'Активировать промокод' })
  @ApiBody({ type: ActivateDto })
  @ApiResponse({
    status: 201,
    description: 'Промокод активирован',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или промокод истек',
  })
  @ApiResponse({ status: 404, description: 'Промокод не найден' })
  @ApiResponse({
    status: 409,
    description: 'Промокод уже активирован для этого email',
  })
  @ApiResponse({ status: 503, description: 'Сервис временно недоступен' })
  activation(
    @Body(new ValidationPipe({ transform: true })) data: ActivateDto,
  ): Promise<ActivationResponse> {
    return this.activationService.activate(data);
  }
}
