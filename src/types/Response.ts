export interface PaginationState {
  totalData: number;
  dataPerpage: number;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  paginationState: PaginationState;
  data: T[];
  additionalInfo?: Record<string, any>;
}
