import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class OffsetPaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @ApiProperty({
    description: 'Number of items to retrieve per page',
    example: 10,
    default: 10,
  })
  limit?: number = 10;

  @IsOptional()
  @IsPositive()
  @ApiProperty({
    description: 'Page number to retrieve',
    example: 1,
    default: 1,
  })
  page?: number = 1;
}
