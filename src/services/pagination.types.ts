export interface PaginationResult<T> {
    items: Array<T & { label: string; lineNumber: string }>;
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    pageLabel: string;
}
