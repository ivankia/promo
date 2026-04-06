import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length } from 'class-validator';

export class ActivateDto {
  @ApiProperty({ example: 'SALES2026', minLength: 1 })
  @IsString({ message: 'Промокод должен быть строкой' })
  @Length(1, 20, { message: 'Промокод должен содержать от 1 до 20 символов' })
  promocode: string;

  @ApiProperty({ example: 'user@email.com' })
  @IsEmail({}, { message: 'Некорректный формат email адреса' })
  email: string;
}
