/**
 * usePagination — hook quản lý state phân trang
 * Spring Page: page bắt đầu từ 0
 */
import { useState } from 'react';

export function usePagination(initialSize = 10) {
  const [page, setPage] = useState(0);
  const [size] = useState(initialSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / size);
  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;

  const goNext = () => { if (!isLast) setPage(p => p + 1); };
  const goPrev = () => { if (!isFirst) setPage(p => p - 1); };
  const goTo   = (p) => setPage(p);
  const reset  = () => setPage(0);

  return { page, size, total, setTotal, totalPages, isFirst, isLast, goNext, goPrev, goTo, reset };
}
