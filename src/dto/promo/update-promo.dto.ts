import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';

export class UpdatePromoDto {
  @ApiProperty({ example: 'SALES2026', minLength: 1 })
  @IsString({ message: 'Промокод должен быть строкой' })
  @Length(1, 20, { message: 'Длина промокода должна быть от 1 до 20 символов' })
  code?: string;

  @ApiProperty({ example: 20, minimum: 1, maximum: 100 })
  @IsInt({ message: 'Процент скидки должен быть целым числом' })
  @Min(1, { message: 'Скидка не может быть меньше 1%' })
  @Max(100, { message: 'Скидка не может быть больше 100%' })
  discountPercent?: number;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt({ message: 'Лимит активаций должен быть целым числом' })
  @Min(1, { message: 'Лимит активаций должен быть не менее 1' })
  activationsLimit?: number;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsInt({ message: 'Количество активаций должно быть целым числом' })
  @Min(0, { message: 'Количество активаций должно быть не менее 0' })
  activationsCount?: number;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Дата истечения срока действия промокода',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/, {
    message:
      'Некорректный формат даты. Используйте YYYY-MM-DD или YYYY-MM-DD HH:MM:SS',
  })
  expirationDate?: string;

  @ApiProperty({ example: true, description: 'Статус промокода' })
  @IsOptional()
  @IsBoolean({ message: 'Поле isActive должно быть булевым значением' })
  isActive?: boolean;
}
