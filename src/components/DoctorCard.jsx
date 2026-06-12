import { Link } from 'react-router-dom';
import BookDoctorButton from './common/BookDoctorButton';

export default function DoctorCard({ doctor, layout = 'vertical' }) {
  const price = Number(doctor.price ?? doctor.consultationFee ?? 0);

  /* ── Layout ngang — trang Doctors ── */
  if (layout === 'horizontal') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden group">
        <Link to={`/doctors/${doctor.id}`} className="relative w-36 shrink-0 overflow-hidden">
          <img src={doctor.avatar} alt={doctor.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        </Link>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {doctor.specialty}
              </span>
              <Link to={`/doctors/${doctor.id}`}>
                <h3 className="font-bold text-gray-800 text-sm mt-1.5 leading-tight hover:text-blue-600 transition-colors">{doctor.name}</h3>
              </Link>
              <p className="text-xs text-gray-400">{doctor.degree}</p>
            </div>
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span className="shrink-0 mt-0.5">🏥</span>
              <span className="line-clamp-2">{doctor.hospital}</span>
            </p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-bold text-gray-700">{doctor.rating ?? 0}</span>
                <span className="text-gray-400">({doctor.reviewCount ?? 0})</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{doctor.experience ?? 0} năm KN</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(doctor.tags ?? []).slice(0, 2).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400">Phí khám từ</p>
              <p className="text-blue-600 font-bold text-sm">{price.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/doctors/${doctor.id}`}
                className="border border-blue-200 text-blue-600 text-xs px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors font-semibold">
                Xem hồ sơ
              </Link>
              <BookDoctorButton
                doctorId={doctor.id}
                from={`/doctors/${doctor.id}`}
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
              >
                Đặt lịch
              </BookDoctorButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Layout dọc — Home ── */
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      <Link to={`/doctors/${doctor.id}`} className="block relative overflow-hidden h-52">
        <img src={doctor.avatar} alt={doctor.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 via-blue-900/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {doctor.specialty}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-sm leading-tight drop-shadow">{doctor.name}</h3>
          <p className="text-blue-200 text-xs mt-0.5">{doctor.degree}</p>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <span className="shrink-0">🏥</span>
          <span className="line-clamp-1">{doctor.hospital}</span>
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">🎓 {doctor.experience ?? 0} năm KN</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold text-gray-700">{doctor.rating ?? 0}</span>
            <span className="text-gray-400">({doctor.reviewCount ?? 0})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {(doctor.tags ?? []).slice(0, 2).map(tag => (
            <span key={tag} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400">Phí khám từ</p>
            <p className="text-blue-600 font-bold text-sm">{price.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/doctors/${doctor.id}`}
              className="border border-blue-200 text-blue-600 text-xs px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors font-semibold">
              Xem
            </Link>
            <BookDoctorButton
              doctorId={doctor.id}
              from={`/doctors/${doctor.id}`}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Đặt lịch
            </BookDoctorButton>
          </div>
        </div>
      </div>
    </div>
  );
}
