import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PromoService } from '../services/promo.service';
import type {
  PromocodeInput,
  PromocodeListResponse,
  PromocodeResponse,
} from '../types/promocode';
import { CreatePromoDto } from '../dto/promo/create-promo.dto';
import { UpdatePromoDto } from '../dto/promo/update-promo.dto';
import { ListPromoDto } from '../dto/promo/list-promo.dto';

@ApiTags('Промокоды')
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить промокод по Id' })
  @ApiParam({ name: 'id', description: 'Id промокода' })
  @ApiResponse({
    status: 200,
    description: 'Промокод найден',
    type: Object,
  })
  @ApiResponse({ status: 404, description: 'Промокод не найден' })
  get(@Param('id') id: string): Promise<PromocodeResponse> {
    return this.promoService.get(id);
  }

  @Get('list')
  @ApiOperation({ summary: 'Получить список промокодов с пагинацией' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов (1-50)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Курсор для пагинации',
  })
  @ApiResponse({
    status: 200,
    description: 'Список промокодов',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        info: {
          type: 'object',
          properties: {
            hasNext: { type: 'boolean' },
            next: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  list(
    @Query(new ValidationPipe({ transform: true })) query: ListPromoDto,
  ): Promise<PromocodeListResponse> {
    const { limit = PromoService.DEFAULT_LIMIT, cursor } = query;
    return this.promoService.list(limit, cursor);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создать новый промокод' })
  @ApiBody({ type: CreatePromoDto })
  @ApiResponse({
    status: 201,
    description: 'Промокод создан',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({
    status: 409,
    description: 'Промокод с таким кодом уже существует',
  })
  create(
    @Body(ValidationPipe) data: CreatePromoDto,
  ): Promise<PromocodeResponse> {
    const parseDate = (value: string) =>
      new Date(value.includes(' ') ? value.replace(' ', 'T') : value);

    return this.promoService.create({
      ...data,
      expirationDate: parseDate(data.expirationDate),
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить промокод' })
  @ApiParam({ name: 'id', description: 'UUID промокода' })
  @ApiBody({ type: UpdatePromoDto })
  @ApiResponse({
    status: 200,
    description: 'Промокод обновлен',
    type: Object,
  })
  @ApiResponse({ status: 404, description: 'Промокод не найден' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) data: UpdatePromoDto,
  ): Promise<PromocodeResponse> {
    const parseDate = (value: string) =>
      new Date(value.includes(' ') ? value.replace(' ', 'T') : value);
    const payload = { ...data } as Partial<PromocodeInput>;

    if (data.expirationDate) {
      payload.expirationDate = parseDate(data.expirationDate);
    }

    return this.promoService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить промокод' })
  @ApiParam({ name: 'id', description: 'UUID промокода' })
  @ApiResponse({ status: 200, description: 'Промокод удален' })
  @ApiResponse({ status: 404, description: 'Промокод не найден' })
  delete(@Param('id') id: string): Promise<void> {
    return this.promoService.delete(id);
  }
}
