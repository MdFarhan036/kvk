import { useEffect, useMemo, useState } from "react";

export const usePagination = (
  data = [],
  itemsPerPage = 10
) => {
  const [currentPage, setCurrentPage] =
    useState(1);

  // =====================================================
  // TOTAL PAGES
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      data.length / itemsPerPage
    )
  );

  // =====================================================
  // RESET PAGE WHEN DATA CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPage]);

  // =====================================================
  // KEEP PAGE VALID
  // =====================================================

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // =====================================================
  // PAGINATED DATA
  // =====================================================

  const paginatedData =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        itemsPerPage;

      const endIndex =
        startIndex +
        itemsPerPage;

      return data.slice(
        startIndex,
        endIndex
      );

    }, [
      data,
      currentPage,
      itemsPerPage,
    ]);

  // =====================================================
  // RESULT RANGE
  // =====================================================

  const startIndex =
    data.length === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endIndex = Math.min(
    currentPage * itemsPerPage,
    data.length
  );

  return {
    currentPage,
    setCurrentPage,

    totalPages,

    paginatedData,

    startIndex,
    endIndex,

    totalItems: data.length,
  };
};

export default usePagination;