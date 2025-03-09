/**
 * Common API response format
 */
export interface ApiResponse<T> {
    // success: boolean;
    data: T;
    message?: string;
  }
  
  /**
   * Paginated response format
   */
  export interface PaginatedResponse<T> extends ApiResponse<T> {
    meta?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }