import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">M</div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">MedCare</div>
                <div className="text-[10px] text-gray-500 leading-tight">Phòng khám đa khoa</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Phòng khám đa khoa MedCare – nơi chăm sóc sức khỏe toàn diện với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm, trang thiết bị hiện đại.
            </p>
            {/* Social */}
            <div className="flex gap-2 mb-5">
              {[
                { label:'Facebook', icon:'f', href:'#' },
                { label:'YouTube',  icon:'▶', href:'#' },
                { label:'Zalo',     icon:'Z', href:'#' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label}
                  className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-xs font-bold hover:bg-blue-600 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-800 border border-gray-700 px-2.5 py-1.5 rounded-lg">🏥 Giấy phép BYT 123/GP</span>
              <span className="text-[10px] bg-gray-800 border border-gray-700 px-2.5 py-1.5 rounded-lg">✅ ISO 9001:2015</span>
              <span className="text-[10px] bg-gray-800 border border-gray-700 px-2.5 py-1.5 rounded-lg">🔒 SSL Secured</span>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Dịch vụ</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/doctors" className="hover:text-white transition-colors flex items-center gap-1.5">→ Đặt lịch khám</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors flex items-center gap-1.5">→ Gói khám sức khỏe</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors flex items-center gap-1.5">→ Tìm bác sĩ</Link></li>
              <li><a href="#specialties" className="hover:text-white transition-colors flex items-center gap-1.5">→ Chuyên khoa</a></li>
              <li><Link to="/news" className="hover:text-white transition-colors flex items-center gap-1.5">→ Tin tức sức khỏe</Link></li>
            </ul>
          </div>

          {/* Chuyên khoa */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Chuyên khoa</h4>
            <ul className="space-y-2.5 text-sm">
              {['Tim mạch','Thần kinh','Cơ xương khớp','Nhi khoa','Da liễu','Tai Mũi Họng','Mắt'].map(s => (
                <li key={s}>
                  <Link to={`/search?specialty=${s.toLowerCase().replace(' ','-')}`}
                    className="hover:text-white transition-colors">→ {s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <span className="shrink-0 mt-0.5">📍</span>
                <span>123 Đường Láng, Đống Đa, Hà Nội</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0">📞</span>
                <div>
                  <a href="tel:1800599920" className="hover:text-white transition-colors font-medium">1800 599 920</a>
                  <p className="text-[10px] text-gray-500">Miễn phí · 7:00–20:00</p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0">✉️</span>
                <a href="mailto:info@medcare.vn" className="hover:text-white transition-colors">info@medcare.vn</a>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0">⏰</span>
                <span>T2–T7: 7:00–20:00<br />CN: 7:00–12:00</span>
              </li>
            </ul>

            {/* App download */}
            <div className="mt-5 space-y-2">
              <p className="text-xs text-gray-500 font-medium">Tải ứng dụng</p>
              <div className="flex gap-2">
                <a href="#" className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 hover:bg-gray-700 transition-colors">
                  <span className="text-base">🍎</span>
                  <div>
                    <p className="text-[9px] text-gray-400 leading-none">Download on</p>
                    <p className="text-[11px] text-white font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 hover:bg-gray-700 transition-colors">
                  <span className="text-base">▶</span>
                  <div>
                    <p className="text-[9px] text-gray-400 leading-none">Get it on</p>
                    <p className="text-[11px] text-white font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 MedCare Clinic. Giấy phép hoạt động số 123/BYT-GP. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
