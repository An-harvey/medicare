/**
 * Unauthorized — 403 page
 * Khi user đăng nhập nhưng không có quyền truy cập route đó
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-red-100 mb-2 select-none">403</div>
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-500 text-sm mb-2">
          Tài khoản <strong>{user?.email}</strong> không có quyền truy cập trang này.
        </p>
        <p className="text-gray-400 text-xs mb-8">Role hiện tại: <span className="font-semibold">{user?.label}</span></p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
            📊 Về Dashboard
          </Link>
          <button onClick={() => navigate(-1)}
            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
