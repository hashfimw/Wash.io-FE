// src/components//UsePagination.tsx
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function NotificationPagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            className="bg-birtu hover:bg-oren transition"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <div className="px-4 text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        </PaginationItem>
        <PaginationItem>
          <Button
            className="bg-birtu hover:bg-oren transition"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
