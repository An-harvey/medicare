import { Link } from 'react-router-dom';
import { specialties, doctors, articles, stats, testimonials } from '../data/mockData';
import DoctorCard from '../components/DoctorCard';
import ArticleCard from '../components/ArticleCard';

/* ── Ảnh dùng trong trang ── */
const IMGS = {
  // Hero: hành lang bệnh viện hiện đại, ánh sáng xanh trắng
  hero:      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&h=900&fit=crop',
  // Giới thiệu: phòng khám sạch sẽ + bác sĩ tư vấn bệnh nhân
  about1:    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=560&fit=crop',
  about2:    'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=560&fit=crop',
  // Cơ sở vật chất
  equipment: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=700&h=480&fit=crop',
  reception: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=700&h=480&fit=crop',
  // Bác sĩ Á Đông đang tư vấn bệnh nhân
  consult:   'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=700&h=480&fit=crop',
  lab:       'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=700&h=480&fit=crop',
  // CTA: phòng mổ / bệnh viện hiện đại
  ctaBg:     'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&h=600&fit=crop',
  // Floating card hero: bác sĩ nam Á Đông, áo blouse trắng
  doctorHero: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=faces',
};

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      <img
        src={IMGS.hero}
        alt="Phòng khám MedCare"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/70 to-blue-700/30" />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm text-white">
            🏥 Phòng khám đa khoa uy tín hàng đầu Hà Nội
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Chăm sóc sức khỏe<br />
            <span className="text-yellow-300">toàn diện</span> cho<br />
            cả gia đình bạn
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
            Đội ngũ hơn 50 bác sĩ chuyên khoa đầu ngành, trang thiết bị hiện đại,
            quy trình khám nhanh gọn – không chờ đợi.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/doctors"
              className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-xl text-sm">
              Đặt lịch ngay
            </Link>
            <a href="#about"
              className="border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm backdrop-blur-sm">
              Tìm hiểu thêm ↓
            </a>
          </div>
          <div className="flex flex-wrap gap-5 pt-2">
            {['✅ Bác sĩ đầu ngành', '⚡ Đặt lịch 24/7', '🔒 Bảo mật tuyệt đối'].map((b) => (
              <span key={b} className="text-sm text-blue-100 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards – bottom right */}
      <div className="hidden lg:flex flex-col gap-3 absolute bottom-12 right-10 z-10">
        {/* Card bác sĩ */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 w-64">
          <img
            src={IMGS.doctorHero}
            alt="Bác sĩ MedCare"
            className="w-14 h-14 rounded-xl object-cover object-top shrink-0"
          />
          <div>
            <p className="font-bold text-gray-800 text-xs">PGS.TS. Nguyễn Văn An</p>
            <p className="text-blue-600 text-[11px]">Chuyên khoa Tim mạch</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">★★★★★</span>
              <span className="text-[10px] text-gray-400">4.9 (248 đánh giá)</span>
            </div>
            <div className="mt-1.5 bg-green-50 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block">
              ● Còn lịch hôm nay
            </div>
          </div>
        </div>
        {/* Stat cards */}
        <div className="flex gap-3">
          <div className="bg-yellow-400 text-yellow-900 rounded-2xl shadow-xl px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-extrabold">98%</p>
            <p className="text-[10px] font-semibold mt-0.5">Hài lòng</p>
          </div>
          <div className="bg-green-500 text-white rounded-2xl shadow-xl px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-extrabold">30K+</p>
            <p className="text-[10px] font-semibold mt-0.5">Lượt khám</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Quick Booking Bar ─── */
function BookingBar() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto -mt-8 relative z-20 border border-gray-100">
      <h3 className="text-center text-gray-700 font-semibold mb-4 text-sm tracking-wide uppercase">
        🗓️ Đặt lịch khám nhanh
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
          <option value="">🩺 Chọn chuyên khoa</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
          <option value="">👨‍⚕️ Chọn bác sĩ</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <input type="date"
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
      </div>
      <div className="mt-4 flex justify-center">
        <Link to="/doctors"
          className="bg-blue-600 text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto text-center">
          Tìm lịch khám phù hợp →
        </Link>
      </div>
    </div>
  );
}

/* ─── Stats ─── */
function StatsSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-4xl font-extrabold text-blue-600">{s.value}</div>
          <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── About Section ─── */
function AboutSection() {
  const features = [
    { icon: '🏆', title: 'Bác sĩ đầu ngành', desc: 'Đội ngũ PGS, TS từ các bệnh viện lớn với hàng chục năm kinh nghiệm.' },
    { icon: '🔬', title: 'Thiết bị hiện đại', desc: 'Máy móc nhập khẩu từ Đức, Nhật Bản đạt chuẩn quốc tế.' },
    { icon: '⚡', title: 'Quy trình nhanh gọn', desc: 'Đặt lịch online, không chờ đợi, kết quả xét nghiệm trong ngày.' },
    { icon: '🛡️', title: 'Bảo mật thông tin', desc: 'Hồ sơ bệnh nhân được bảo mật tuyệt đối theo tiêu chuẩn HIPAA.' },
  ];

  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: image collage */}
          <div className="relative h-[480px]">
            {/* Main large image */}
            <img src={IMGS.about1} alt="Phòng khám MedCare"
              className="absolute top-0 left-0 w-3/4 h-72 object-cover rounded-3xl shadow-xl" />
            {/* Second image */}
            <img src={IMGS.about2} alt="Bác sĩ tư vấn"
              className="absolute bottom-0 right-0 w-2/3 h-60 object-cover rounded-3xl shadow-xl border-4 border-white" />
            {/* Badge overlay */}
            <div className="absolute top-52 right-4 bg-blue-600 text-white rounded-2xl px-5 py-4 shadow-2xl text-center z-10">
              <p className="text-3xl font-extrabold">15+</p>
              <p className="text-xs font-medium mt-0.5">Năm kinh nghiệm</p>
            </div>
            {/* Decorative dot grid */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)', backgroundSize: '10px 10px' }} />
          </div>

          {/* Right: text */}
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Về chúng tôi</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-5 leading-tight">
              Phòng khám đa khoa<br />
              <span className="text-blue-600">MedCare</span> – Tin cậy & Chuyên nghiệp
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Được thành lập từ năm 2010, MedCare là một trong những phòng khám tư nhân uy tín hàng đầu tại Hà Nội.
              Chúng tôi cung cấp dịch vụ khám và điều trị đa chuyên khoa với đội ngũ hơn 50 bác sĩ chuyên khoa
              từng công tác tại các bệnh viện lớn như Bạch Mai, Việt Đức, 108.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Với triết lý <em className="text-blue-600 not-italic font-medium">"Bệnh nhân là trung tâm"</em>,
              mỗi ca khám tại MedCare đều được thực hiện tỉ mỉ, tận tâm – từ tiếp đón đến tư vấn sau điều trị.
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {['✅ Giấy phép BYT số 123/GP', '✅ Chứng nhận ISO 9001:2015', '✅ Top 10 PK uy tín 2025'].map((b) => (
                <span key={b} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.title} className="flex gap-3 bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors">
                  <span className="text-2xl shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Facilities (ảnh cơ sở vật chất) ─── */
function FacilitiesSection() {
  const items = [
    { img: IMGS.reception, label: 'Khu tiếp đón hiện đại', sub: 'Không gian rộng rãi, thân thiện' },
    { img: IMGS.equipment, label: 'Thiết bị chẩn đoán', sub: 'Nhập khẩu từ Đức & Nhật Bản' },
    { img: IMGS.consult,   label: 'Phòng khám riêng tư', sub: 'Đảm bảo bảo mật thông tin' },
    { img: IMGS.lab,       label: 'Phòng xét nghiệm', sub: 'Kết quả trong ngày' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Cơ sở vật chất</span>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">Không gian khám chữa bệnh đẳng cấp</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
            Đầu tư toàn diện về cơ sở hạ tầng để mang lại trải nghiệm tốt nhất cho bệnh nhân
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.label} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <img src={item.img} alt={item.label}
                className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-xs text-blue-200 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Specialties ─── */
function SpecialtiesSection() {
  return (
    <section id="specialties" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Dịch vụ</span>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">Chuyên khoa điều trị</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
            Đội ngũ chuyên gia đầu ngành sẵn sàng tư vấn và điều trị toàn diện cho bạn và gia đình
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {specialties.map((s) => (
            <Link key={s.id} to="/doctors"
              className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-100 transition-colors shadow-sm">
                {s.icon}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Doctors ─── */
function DoctorsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Đội ngũ</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">Bác sĩ chuyên khoa</h2>
            <p className="text-gray-500 mt-1 text-sm">Hơn 50 bác sĩ đầu ngành với kinh nghiệm từ 8–25 năm</p>
          </div>
          <Link to="/doctors" className="hidden md:flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link to="/doctors" className="text-blue-600 text-sm font-semibold hover:underline">Xem tất cả bác sĩ →</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Process ─── */
function ProcessSection() {
  const steps = [
    { num: '01', icon: '🔍', title: 'Chọn chuyên khoa & bác sĩ', desc: 'Tìm kiếm theo chuyên khoa, xem hồ sơ và đánh giá của bác sĩ.' },
    { num: '02', icon: '📅', title: 'Đặt lịch trực tuyến', desc: 'Chọn ngày giờ phù hợp, điền thông tin và xác nhận lịch hẹn.' },
    { num: '03', icon: '📲', title: 'Nhận xác nhận', desc: 'Nhận SMS/Email xác nhận lịch hẹn và nhắc nhở trước 24 giờ.' },
    { num: '04', icon: '🏥', title: 'Đến khám đúng giờ', desc: 'Đến phòng khám, check-in nhanh và được khám theo đúng lịch hẹn.' },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=600&fit=crop"
        alt="background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-blue-900/88" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <span className="text-blue-300 text-sm font-semibold uppercase tracking-wider">Quy trình</span>
          <h2 className="text-3xl font-bold text-white mt-2">Đặt lịch chỉ trong 4 bước</h2>
          <p className="text-blue-200 mt-2 text-sm">Nhanh chóng, tiện lợi – không cần chờ đợi</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-blue-500/50 z-0 -translate-x-1/2" />
              )}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center relative z-10 hover:bg-white/20 transition-colors">
                <div className="w-16 h-16 bg-white text-blue-700 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-[10px] font-bold text-blue-400">{step.num}</span>
                </div>
                <h4 className="font-bold text-white mb-2 text-sm">{step.title}</h4>
                <p className="text-blue-200 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Đánh giá</span>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">Bệnh nhân nói gì về chúng tôi</h2>
          <p className="text-gray-500 mt-2 text-sm">Hơn 30.000 bệnh nhân đã tin tưởng lựa chọn MedCare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-5xl text-blue-100 font-serif absolute top-4 right-5 leading-none select-none">"</div>
              <div className="flex text-yellow-400 mb-3 text-lg">{'★'.repeat(t.rating)}</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic relative z-10">"{t.content}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.specialty} • {t.age} tuổi</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── News ─── */
function NewsSection() {
  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Kiến thức</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">Tin tức sức khỏe</h2>
            <p className="text-gray-500 mt-1 text-sm">Cập nhật kiến thức y tế từ đội ngũ bác sĩ MedCare</p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline">
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─── */
function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <img src={IMGS.ctaBg} alt="CTA background"
        className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-blue-900/80" />
      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <span className="inline-block bg-white/15 border border-white/20 text-sm px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
          🏥 Đặt lịch ngay hôm nay
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Sẵn sàng chăm sóc<br />sức khỏe của bạn?
        </h2>
        <p className="text-blue-200 mb-10 max-w-xl mx-auto text-lg">
          Đội ngũ bác sĩ MedCare luôn sẵn sàng đồng hành cùng bạn và gia đình.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/doctors"
            className="bg-white text-blue-700 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-xl text-sm">
            Đặt lịch khám ngay
          </Link>
          <a href="tel:1800599920"
            className="border-2 border-white/60 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-colors text-sm backdrop-blur-sm">
            📞 Gọi 1800 599 920
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4">
        <BookingBar />
      </div>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <StatsSection />
        </div>
      </section>
      <AboutSection />
      <FacilitiesSection />
      <SpecialtiesSection />
      <DoctorsSection />
      <ProcessSection />
      <TestimonialsSection />
      <NewsSection />
      <CTASection />
    </div>
  );
}
