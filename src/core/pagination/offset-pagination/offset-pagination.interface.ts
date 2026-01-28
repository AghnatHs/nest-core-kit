import { IPaginated } from '../paginated.interface';

export interface IOffsetPaginated<T> extends IPaginated<T> {
  meta: {
    itemsPerPage: number;
    totalPage: number;
    currentPage: number;
    totalPages: number;
  };
}
