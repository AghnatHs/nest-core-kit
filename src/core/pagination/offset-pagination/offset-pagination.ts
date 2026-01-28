import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ObjectLiteral, Repository } from 'typeorm';
import { OffsetPaginationQueryDto } from './offset-pagination-query.dto';
import { IOffsetPaginated } from './offset-pagination.interface';

@Injectable()
export class OffsetPaginationProvider {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async paginate<T extends ObjectLiteral>(
    paginationQuery: OffsetPaginationQueryDto,
    repository: Repository<T>,
  ): Promise<IOffsetPaginated<T>> {
    if (!paginationQuery.limit || paginationQuery.limit > 100) {
      paginationQuery.limit = 10;
    }

    if (!paginationQuery.page || paginationQuery.page < 1) {
      paginationQuery.page = 1;
    }

    const results: [T[], number] = await repository.findAndCount({
      skip: (paginationQuery.page - 1) * paginationQuery.limit,
      take: paginationQuery.limit,
    });

    const baseURL: string =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl: URL = new URL(this.request.url, baseURL);

    // Calculate pages number
    const items: T[] = results[0];
    const totalItems: number = results[1];
    const totalPages: number = Math.ceil(totalItems / paginationQuery.limit);
    const nextPage: number =
      paginationQuery.page === totalPages
        ? paginationQuery.page
        : paginationQuery.page + 1;
    const previousPage: number =
      paginationQuery.page === 1
        ? paginationQuery.page
        : paginationQuery.page - 1;

    const paginatedResult: IOffsetPaginated<T> = {
      items: items,
      meta: {
        itemsPerPage: paginationQuery.limit,
        totalPage: totalItems,
        currentPage: paginationQuery.page,
        totalPages: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${paginationQuery.page}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${paginationQuery.limit}&page=${previousPage}`,
      },
    };

    return paginatedResult;
  }
}
