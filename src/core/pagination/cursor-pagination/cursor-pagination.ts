import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  ObjectLiteral,
  ObjectType,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import Paginator from 'typeorm-cursor-pagination/lib/Paginator';
import { CursorPaginationQueryDto } from './cursor-pagination-query.dto';
import { ICursorPaginated } from './cursor-pagination.interface';

@Injectable()
export class CursorPaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async paginate<T extends ObjectLiteral>(
    dto: CursorPaginationQueryDto,
    repository: Repository<T>,
    options: {
      alias: string;
      paginationKeys: (keyof T)[];
      queryBuilder?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;
    },
  ): Promise<ICursorPaginated<T>> {
    dto.limit = Math.min(dto.limit ?? 10, 100);

    let qb: SelectQueryBuilder<T> = repository.createQueryBuilder(
      options.alias,
    );

    if (options.queryBuilder) {
      qb = options.queryBuilder(qb);
    }

    const paginator: Paginator<T> = buildPaginator({
      entity: repository.target as ObjectType<T>,
      paginationKeys: options.paginationKeys as Extract<keyof T, string>[],
      query: {
        limit: dto.limit,
        order: dto.order ?? 'ASC',
        afterCursor: dto.afterCursor || undefined,
        beforeCursor: dto.beforeCursor || undefined,
      },
    });

    const totalItems: number = await repository.count();
    const result = await paginator.paginate(qb);

    const baseURL =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseURL);
    const paginatedResult: ICursorPaginated<T> = {
      items: result.data,
      meta: {
        itemsPerPage: dto.limit,
        totalPage: Math.ceil(totalItems / dto.limit),
        beforeCursor: result.cursor.beforeCursor,
        afterCursor: result.cursor.afterCursor,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${dto.limit}`,
        previous:
          `${newUrl.origin}${newUrl.pathname}?limit=${dto.limit}` +
          (result.cursor.beforeCursor
            ? `&beforeCursor=${result.cursor.beforeCursor}`
            : ''),
        current: `${this.request.protocol}://${this.request.headers.host}${this.request.originalUrl}`,
        next:
          result.cursor.afterCursor &&
          `${newUrl.origin}${newUrl.pathname}?limit=${dto.limit}` +
            (result.cursor.afterCursor
              ? `&afterCursor=${result.cursor.afterCursor}`
              : ''),
        last: null, // Last page link is not typically available in cursor pagination
      },
    };

    return paginatedResult;
  }
}
