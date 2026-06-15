/**
 * navigation.js — Các hàm điều hướng tiện ích
 * ─────────────────────────────────────────────
 */

/**
 * safeGoBack — Navigate về trang trước, fallback về `fallbackPath` nếu không có history
 * @param {function} navigate - React Router navigate function
 * @param {string} fallbackPath - đường dẫn fallback (VD: '/doctors')
 * @param {object} location - React Router location object (optional)
 */
export function safeGoBack(navigate, fallbackPath = '/', location = null) {
  // Nếu có state.from → về trang đó
  if (location?.state?.from?.pathname) {
    navigate(location.state.from.pathname, { replace: true });
    return;
  }
  // Nếu có history (window.history.length > 1) → go back
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackPath, { replace: true });
  }
}

/**
 * getRedirectPath — Lấy đường dẫn redirect sau khi đăng nhập
 * Ưu tiên lấy từ location.state.from (đã bị redirect về /login)
 * @param {object} state - location.state
 * @returns {string|null}
 */
export function getRedirectPath(state) {
  const from = state?.from?.pathname;
  // Không redirect về /login hoặc /register
  if (from && from !== '/login' && from !== '/register') return from;
  return null;
}
