/**
 * safeGoBack — Quay lại trang trước an toàn, tránh trang trắng khi không có history
 */
export function getRedirectPath(fromState) {
  const from = fromState?.from ?? fromState;
  if (!from) return null;
  if (typeof from === 'string') return from;
  if (typeof from.pathname === 'string') return from.pathname + (from.search || '');
  return null;
}

export function safeGoBack(navigate, fallback = '/', location) {
  const path = getRedirectPath(location?.state);
  if (path) {
    navigate(path, { replace: true });
    return;
  }
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}
