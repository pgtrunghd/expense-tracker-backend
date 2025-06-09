export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export function createPaginationResult<T>(
  data: T[],
  page: number,
  total: number,
  take: number,
): PaginationResult<T> {
  const pageCount = Math.ceil(total / take);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  return {
    data,
    meta: {
      page,
      take,
      itemCount: total,
      pageCount,
      hasPreviousPage,
      hasNextPage,
    },
  };
}
