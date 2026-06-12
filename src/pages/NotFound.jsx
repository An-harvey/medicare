import { Link, useNavigate } from 'react-router-dom';
import { safeGoBack } from '../utils/navigation';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-blue-100 mb-2 select-none">404</div>
        <div className="text-5xl mb-4">🏥</div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Trang không tìm thấy</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Hãy quay lại trang chủ hoặc tìm kiếm dịch vụ bạn cần.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
            🏠 Về trang chủ
          </Link>
          <button onClick={() => safeGoBack(navigate, '/')}
            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
            ← Quay lại
          </button>
          <Link to="/doctors" className="border border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
            👨‍⚕️ Tìm bác sĩ
          </Link>
        </div>
      </div>
    </div>
  );
}
