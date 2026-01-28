import { Module } from '@nestjs/common';
import { CursorPaginationProvider } from './cursor-pagination/cursor-pagination';
import { OffsetPaginationProvider } from './offset-pagination/offset-pagination';

@Module({
  providers: [CursorPaginationProvider, OffsetPaginationProvider],
  exports: [CursorPaginationProvider, OffsetPaginationProvider],
})
export class PaginationModule {}
