/**
 * BookDoctorButton — Nút đặt lịch khám
 * ─────────────────────────────────────
 * - Nếu đã đăng nhập (PATIENT): redirect đến /booking/:doctorId
 * - Nếu chưa đăng nhập: redirect đến /login với state.from
 * - Nếu đăng nhập bằng role khác (ADMIN/DOCTOR/STAFF): hiện thông báo
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BookDoctorButton({
  doctorId,
  from,
  children = 'Đặt lịch khám',
  className = '',
  disabled = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      // Chưa đăng nhập → về login với from state
      navigate('/login', {
        state: { from: { pathname: from || `/booking/${doctorId}` } },
      });
      return;
    }

    const isPatient = user?.beRole === 'PATIENT' || user?.role === 'user';
    if (!isPatient) {
      alert('Chỉ tài khoản bệnh nhân mới được đặt lịch online.\nVui lòng đăng nhập bằng tài khoản bệnh nhân.');
      return;
    }

    navigate(`/booking/${doctorId}`, {
      state: { from: { pathname: location.pathname } },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
