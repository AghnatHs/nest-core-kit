import { IPaginated } from '../paginated.interface';

export interface ICursorPaginated<T> extends IPaginated<T> {
  meta: {
    itemsPerPage: number;
    totalPage: number;
    beforeCursor?: string | null;
    afterCursor?: string | null;
  };
}
