import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListPromoDto {
  @ApiProperty({ example: 20, minimum: 1, maximum: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Параметр limit должен быть целым числом' })
  @Min(1, { message: 'Параметр limit должен быть не менее 1' })
  @Max(50, { message: 'Параметр limit должен быть не более 50' })
  limit?: number;

  @ApiProperty({
    example: 'b04d2352-2db1-4281-9f24-7c565f360251',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Параметр cursor должен быть строкой' })
  cursor?: string;
}
