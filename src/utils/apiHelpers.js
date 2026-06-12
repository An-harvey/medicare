/** Chuẩn hóa response BE (array | Page | wrapper) → mảng */
export function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.value)) return res.value;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}
