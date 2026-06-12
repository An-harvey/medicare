/**
 * BookDoctorButton — Nút/link đặt lịch thống nhất toàn app
 * Chưa đăng nhập → /login (quay lại trang booking sau khi login)
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function bookingPath(doctorId) {
  if (doctorId == null || doctorId === '') return '/doctors';
  return `/booking/${doctorId}`;
}

export default function BookDoctorButton({
  doctorId,
  children = 'Đặt lịch',
  className = '',
  variant = 'button',
  from,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const path = bookingPath(doctorId);
  const backFrom = from || (doctorId ? `/doctors/${doctorId}` : '/doctors');

  const go = (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: path } } });
      return;
    }
    navigate(path, { state: { from: backFrom } });
  };

  if (variant === 'link') {
    if (!isAuthenticated) {
      return (
        <button type="button" onClick={go} className={className}>
          {children}
        </button>
      );
    }
    return (
      <Link to={path} state={{ from: backFrom }} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={go} className={className}>
      {children}
    </button>
  );
}
