import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export class CursorPaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Max(100)
  @ApiProperty({
    description: 'Number of items to retrieve per page',
    example: 10,
    default: 10,
    maximum: 100,
  })
  limit?: number = 10;

  @IsOptional()
  @IsAlpha()
  @IsEnum(['ASC', 'DESC'])
  @ApiProperty({
    description: 'Order of the results',
    example: 'ASC',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Cursor for fetching the previous set of results',
    example: 'eyJpZCI6IjEwIn0=',
    nullable: true,
  })
  beforeCursor?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Cursor for fetching the next set of results',
    example: 'eyJpZCI6IjIwIn0=',
    nullable: true,
  })
  afterCursor?: string;

  @IsOptional()
  private readonly __brand: 'CursorPaginationQueryDto';
}
