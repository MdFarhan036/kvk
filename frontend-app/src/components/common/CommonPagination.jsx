import React from "react";
import "./CommonPagination.css";

export const CommonPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = [];

  // =====================================================
  // PAGE RANGE
  // =====================================================

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const handlePageChange = (page) => {
    if (
      page === "..." ||
      page === currentPage ||
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    onPageChange(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="common-pagination">

      {/* PREVIOUS */}

      <button
        type="button"
        className="common-pagination-btn"
        disabled={currentPage === 1}
        onClick={() =>
          handlePageChange(
            currentPage - 1
          )
        }
      >
        ← Previous
      </button>

      {/* PAGE NUMBERS */}

      <div className="common-pagination-pages">

        {pages.map((page, index) =>
          page === "..." ? (

            <span
              key={`dots-${index}`}
              className="common-pagination-dots"
            >
              ...
            </span>

          ) : (

            <button
              key={page}
              type="button"
              className={`common-pagination-page ${
                currentPage === page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handlePageChange(page)
              }
            >
              {page}
            </button>

          )
        )}

      </div>

      {/* NEXT */}

      <button
        type="button"
        className="common-pagination-btn"
        disabled={
          currentPage === totalPages
        }
        onClick={() =>
          handlePageChange(
            currentPage + 1
          )
        }
      >
        Next →
      </button>

    </div>
  );
};

export default CommonPagination;