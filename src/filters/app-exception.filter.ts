import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../enums/error-code.enum';
import { BusinessException } from 'src/common/business.exception';
import e from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Внутренняя ошибка сервера';
    let errorCode = ErrorCode.INTERNAL_ERROR;

    console.log(exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2034':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Сервис временно недоступен';
          break;
        case 'P2002':
          status = HttpStatus.CONFLICT;
          errorCode = ErrorCode.PROMO_CODE_EXISTS;
          message = 'Промокод уже существует';
          break;
        case 'P2028':
          status = HttpStatus.REQUEST_TIMEOUT;
          message = 'Превышено время ожидания операции';
          break;
        default:
          message = 'Ошибка базы данных при активации промокода';
          break;
      }
    }

    const payload = {
      statusCode: status,
      errorCode,
      message,
    };

    response.status(status).send(payload);
  }
}
