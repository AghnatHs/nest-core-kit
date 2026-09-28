import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './domain/entity/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  async create(
    @Body() dto: CreateAuditLogDto,
  ): Promise<DataResponse<AuditLog>> {
    const auditLog = await this.auditLogsService.create(dto);

    return new DataResponse(
      HttpStatus.CREATED,
      'Audit log created successfully',
      auditLog,
    );
  }

  @Get()
  async findAll(
    @Query() query: QueryAuditLogDto,
  ): Promise<DataResponse<AuditLog[]>> {
    const auditLogs = await this.auditLogsService.findAll(query);

    return new DataResponse(
      HttpStatus.OK,
      'Audit logs retrieved successfully',
      auditLogs,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DataResponse<AuditLog>> {
    const auditLog = await this.auditLogsService.findOne(id);

    return new DataResponse(
      HttpStatus.OK,
      'Audit log retrieved successfully',
      auditLog,
    );
  }
}
