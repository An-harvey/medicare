/**
 * apiHelpers.js — Các hàm tiện ích xử lý response từ BE
 * ────────────────────────────────────────────────────────
 * BE có thể trả về:
 *   - Array thẳng:      [...]
 *   - Page object:      { content: [...], totalElements, ... }
 *   - Wrapped object:   { data: [...] }
 */

/**
 * unwrapList — Trích xuất mảng từ mọi dạng response của BE
 * @param {any} res - response từ api call
 * @returns {Array}
 */
export function unwrapList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content;  // Spring Page<T>
  if (Array.isArray(res?.data)) return res.data;         // wrapped { data: [] }
  if (Array.isArray(res?.items)) return res.items;       // alternative wrapper
  return [];
}

/**
 * unwrapPage — Trích xuất Page object từ BE (Spring Pageable)
 * @param {any} res
 * @returns {{ list: Array, total: number, page: number, size: number }}
 */
export function unwrapPage(res) {
  if (!res) return { list: [], total: 0, page: 0, size: 10 };
  if (Array.isArray(res)) {
    return { list: res, total: res.length, page: 0, size: res.length };
  }
  return {
    list:  Array.isArray(res.content) ? res.content : [],
    total: res.totalElements ?? 0,
    page:  res.number ?? 0,
    size:  res.size ?? 10,
  };
}
