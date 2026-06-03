/**
 * ProtectedRoute — Bảo vệ route theo role
 * ─────────────────────────────────────────
 * Theo lo_trinh.txt mục 2.3 & 11:
 *
 *   RequireAuth          — chỉ cần đăng nhập
 *   RequireRole(roles[]) — phải có đúng role
 *
 * Nếu chưa login → redirect /login (lưu from để redirect lại sau)
 * Nếu sai role   → redirect /unauthorized
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FE_TO_BE_ROLE } from '../../utils/constants';

/* Chỉ cần đăng nhập */
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

/* Yêu cầu đúng role (BE role: ADMIN/DOCTOR/STAFF/PATIENT) */
export function RequireRole({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // So sánh BE role
  const beRole = user?.beRole || FE_TO_BE_ROLE[user?.role];
  if (roles && !roles.includes(beRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
