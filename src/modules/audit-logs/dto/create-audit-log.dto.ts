import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @MaxLength(100)
  action!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  entityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  actorId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
