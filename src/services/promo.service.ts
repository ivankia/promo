import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Promocode, PromocodeInput, PromocodeList } from '../types/promocode';
import { BusinessException } from 'src/common/business.exception';
import { ErrorCode } from 'src/enums/error-code.enum';

@Injectable()
export class PromoService {
  static DEFAULT_LIMIT = 50;
  private readonly logger = new Logger(PromoService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async get(id: string): Promise<Promocode> {
    this.logger.debug('Getting promo code', id);
    try {
      const promo = await this.prismaService.promocode.findUnique({
        where: { id },
      });
      if (!promo) {
        throw new BusinessException(
          ErrorCode.PROMO_CODE_NOT_FOUND,
          'Промокод не найден',
          HttpStatus.NOT_FOUND,
        );
      }
      return promo;
    } catch (error) {
      this.logger.error(
        'Failed to get promo code',
        id,
        JSON.stringify(error).slice(0, 1000),
      );
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Ошибка при получении промокода',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(
    limit: number = PromoService.DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<PromocodeList> {
    this.logger.debug('Getting list of promo codes', { limit, cursor });

    try {
      // Cursor-based пагинация для получения следующей пачки данных
      const items = await this.prismaService.promocode.findMany({
        take: limit + 1,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const hasNext = items.length > limit;
      const data = hasNext ? items.slice(0, limit) : items;

      return {
        data,
        info: {
          hasNext: hasNext,
          next: hasNext ? (data[data.length - 1]?.id ?? null) : null,
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to get promo codes',
        JSON.stringify(error).slice(0, 1000),
      );
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Ошибка при получении промокодов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: PromocodeInput): Promise<Promocode> {
    this.logger.debug('Creating promo code', data);
    try {
      return this.prismaService.promocode.create({ data });
    } catch (error) {
      this.logger.error(
        'Failed to create promo code',
        JSON.stringify(error).slice(0, 1000),
      );
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Ошибка при создании промокода',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: Partial<PromocodeInput>): Promise<Promocode> {
    this.logger.debug('Updating promo code', id, data);

    const promocode = await this.prismaService.promocode.findUnique({
      where: { id },
    });
    if (!promocode) {
      throw new BusinessException(
        ErrorCode.PROMO_CODE_NOT_FOUND,
        'Промокод не найден',
        HttpStatus.NOT_FOUND,
      );
    }

    if (promocode.activationsCount > promocode.activationsLimit) {
      throw new BusinessException(
        ErrorCode.BAD_REQUEST,
        'Количество активаций больше лимита',
        HttpStatus.BAD_REQUEST,
      );
    }

    data = { ...promocode, ...data };

    try {
      return this.prismaService.promocode.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(
        'Failed to update promo code',
        id,
        JSON.stringify(error).slice(0, 1000),
      );
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Ошибка при обновлении промокода',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Deleting promo code', id);
    try {
      await this.prismaService.promocode.delete({ where: { id } });
    } catch (error) {
      this.logger.error(
        'Failed to delete promo code',
        id,
        JSON.stringify(error).slice(0, 1000),
      );
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BusinessException(
          ErrorCode.PROMO_CODE_NOT_FOUND,
          'Промокод не найден',
          HttpStatus.NOT_FOUND,
        );
      }

      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Ошибка при удалении промокода',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
