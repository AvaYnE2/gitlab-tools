interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add pages around current
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if it exists and is different from first
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className="px-3 py-1 rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => (typeof page === "number" ? onPageChange(page) : null)}
          disabled={page === currentPage || page === "..." || disabled}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          } ${
            page === "..." ? "cursor-default" : ""
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className="px-3 py-1 rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
}
