export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export const paginate = <T>(data: T[], total: number, page: number, limit: number): Paginated<T> => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
