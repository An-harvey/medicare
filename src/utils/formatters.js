/**
 * formatters.js — Hàm format dữ liệu từ BE
 * ──────────────────────────────────────────
 * BE trả LocalDate dạng "yyyy-MM-dd" hoặc array [year, month, day]
 * BE trả LocalTime dạng "HH:mm:ss"  hoặc array [h, m, s]
 */

// ── Format LocalDate → "dd/MM/yyyy" ──
export function formatDate(d) {
  if (!d) return '---';
  if (Array.isArray(d)) {
    const [y, m, day] = d;
    return `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  }
  // "2026-06-10" → "10/06/2026"
  const parts = String(d).split('T')[0].split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return String(d);
}

// ── Format LocalTime → "HH:mm" ──
export function formatTime(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5); // "08:00:00" → "08:00"
}

// ── Format số tiền VND ──
export function formatCurrency(amount) {
  if (amount == null) return '---';
  return `${Number(amount).toLocaleString('vi-VN')}đ`;
}

// ── Ngày hôm nay dạng "yyyy-MM-dd" ──
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── "yyyy-MM-dd" → "dd/MM/yyyy" ──
export function isoToDisplay(iso) {
  if (!iso) return '---';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
