import { IPaginated } from '../paginated.interface';

export interface IOffsetPaginated<T> extends IPaginated<T> {
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}
