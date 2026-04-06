import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Activation, ActivationInput } from '../types/activation';
import { BusinessException } from 'src/common/business.exception';
import { ErrorCode } from 'src/enums/error-code.enum';

@Injectable()
export class ActivationService {
  private readonly logger = new Logger(ActivationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async activate(data: ActivationInput): Promise<Activation> {
    const { promocode, email } = data;
    this.logger.debug('Activating promo code', { promocode, email });

    try {
      const activation = await this.prismaService.$transaction(
        async (prisma) => {
          // Лок
          const rows = (await prisma.$queryRaw`
            SELECT * FROM promocodes WHERE code = ${promocode} FOR UPDATE
          `) as Array<any>;

          if (!rows || rows.length === 0) {
            throw new BusinessException(
              ErrorCode.PROMO_CODE_NOT_FOUND,
              'Промокод не найден',
              HttpStatus.NOT_FOUND,
            );
          }

          const code = rows[0];
          this.logger.debug('Promo code data', code);

          if (!code.is_active) {
            throw new BusinessException(
              ErrorCode.BAD_REQUEST,
              'Промокод неактивен',
              HttpStatus.BAD_REQUEST,
            );
          }

          if (new Date(code.expiration_date) <= new Date()) {
            throw new BusinessException(
              ErrorCode.PROMO_CODE_EXPIRED,
              'Промокод истек',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Проверяем общее количество активаций
          if (code.activations_count >= code.activations_limit) {
            throw new BusinessException(
              ErrorCode.ACTIVATION_LIMIT_REACHED,
              'Достигнут лимит активаций промокода',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Проверям активацию для конкретного email
          const isActivated = (await prisma.activation.findFirst({
            where: { promocodeId: code.id, email },
          }))
            ? true
            : false;

          if (isActivated) {
            throw new BusinessException(
              ErrorCode.ALREADY_ACTIVATED,
              'Промокод уже активирован для этого email',
              HttpStatus.CONFLICT,
            );
          }

          // Активирован успешно
          const activation = await prisma.activation.create({
            data: {
              promocodeId: code.id,
              email,
            },
          });

          // Проверяем, достигнут ли лимит активаций после этой активации
          if (code.activations_limit == code.activations_count + 1) {
            await prisma.promocode.update({
              where: { id: code.id },
              data: { isActive: false },
            });
          }

          return activation;
        },
      );

      this.logger.debug('Promo code activated successfully', {
        promocode,
        email,
      });

      return activation;
    } catch (error) {
      this.logger.error('Failed to activate promo code', {
        promocode,
        email,
        error: error instanceof Error ? error.message : error,
      });

      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Неожиданная ошибка при активации промокода',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
