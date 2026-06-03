import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoctorById, getAvailableSlots } from '../api/public';
import { mapDoctorFromApi } from '../utils/doctorMapper';

const REVIEWS = [
  { id:1, name:'Chị Nguyễn Thị Lan', age:42, rating:5, date:'20/05/2026', content:'Bác sĩ rất tận tâm, giải thích rõ ràng từng bước điều trị. Phòng khám sạch sẽ, nhân viên thân thiện. Tôi rất hài lòng.', avatar:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&h=60&fit=crop' },
  { id:2, name:'Anh Trần Văn Hùng',  age:35, rating:5, date:'15/05/2026', content:'Đặt lịch online rất tiện, không phải chờ đợi. Bác sĩ khám kỹ và cho đơn thuốc hợp lý. Sẽ quay lại tái khám.', avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop' },
  { id:3, name:'Bà Lê Thị Mai',      age:58, rating:4, date:'10/05/2026', content:'Bác sĩ có chuyên môn cao, tư vấn chi tiết. Chỉ hơi đợi lâu một chút nhưng chất lượng khám rất tốt.', avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop' },
];

const TIME_SLOTS = {
  morning:   ['07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00'],
  afternoon: ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'],
};
const BOOKED = ['08:00','09:30','14:00'];

function getNext7Days() {
  const days = [];
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({ date: d.toISOString().split('T')[0], day: i===0?'Hôm nay':i===1?'Ngày mai':dayNames[d.getDay()], num: d.getDate(), month: d.getMonth()+1 });
  }
  return days;
}

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const days = getNext7Days();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selDate, setSelDate] = useState(days[0].date);
  const [selTime, setSelTime] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [availSlots, setAvailSlots] = useState([]);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getDoctorById(id)
      .then(res => setDoctor(mapDoctorFromApi(res)))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selDate) return;
    getAvailableSlots({ doctorId: id, date: selDate })
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setAvailSlots(list.filter(s => s.status === 'AVAILABLE' || s.currentPatients < s.maxPatients));
      })
      .catch(() => setAvailSlots([]));
  }, [id, selDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p className="font-semibold">Không tìm thấy bác sĩ</p>
        <Link to="/doctors" className="text-blue-600 text-sm hover:underline">← Danh sách bác sĩ</Link>
      </div>
    );
  }

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/booking/${doctor.id}` } } }); return; }
    navigate(`/booking/${doctor.id}`);
  };

  const ratingDist = [
    { star:5, pct:78 }, { star:4, pct:15 }, { star:3, pct:5 }, { star:2, pct:1 }, { star:1, pct:1 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/doctors" className="hover:text-blue-600">Bác sĩ</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{doctor.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Left: Doctor info ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-40 bg-gradient-to-r from-blue-700 to-blue-500">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage:`url(${doctor.avatar})`,backgroundSize:'cover',backgroundPosition:'center top'}} />
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-end gap-5 -mt-12 mb-4">
                  <img src={doctor.avatar} alt={doctor.name}
                    className="w-24 h-24 rounded-2xl object-cover object-top border-4 border-white shadow-lg shrink-0" />
                  <div className="pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-extrabold text-gray-800">{doctor.name}</h1>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{doctor.specialty}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{doctor.degree}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { icon:'⭐', label:'Đánh giá', value:`${doctor.rating}/5` },
                    { icon:'💬', label:'Lượt đánh giá', value:doctor.reviewCount },
                    { icon:'🎓', label:'Kinh nghiệm', value:`${doctor.experience} năm` },
                    { icon:'💰', label:'Phí khám', value:`${doctor.price.toLocaleString('vi-VN')}đ` },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <p className="font-extrabold text-gray-800 text-sm">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span>🏥</span><span>{doctor.hospital}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.tags.map(t => (
                    <span key={t} className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[['info','Thông tin'],['reviews','Đánh giá']].map(([k,l]) => (
                  <button key={k} onClick={() => setActiveTab(k)}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab===k ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Giới thiệu</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {doctor.name} là chuyên gia hàng đầu trong lĩnh vực {doctor.specialty} với hơn {doctor.experience} năm kinh nghiệm.
                        Từng công tác tại {doctor.hospital}, bác sĩ đã điều trị thành công hàng nghìn ca bệnh phức tạp.
                        Với phong cách làm việc tận tâm, tỉ mỉ và luôn đặt bệnh nhân làm trung tâm, bác sĩ được đánh giá cao bởi cả đồng nghiệp và bệnh nhân.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Chuyên môn</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {doctor.tags.concat(['Tư vấn sức khỏe định kỳ', 'Điều trị bệnh mãn tính']).map(t => (
                          <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>{t}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Học vấn & Kinh nghiệm</h3>
                      <div className="space-y-3">
                        {[
                          { year:'2000–2006', title:`Tốt nghiệp Đại học Y Hà Nội`, sub:'Chuyên ngành '+doctor.specialty },
                          { year:'2006–2010', title:'Nội trú tại '+doctor.hospital, sub:'Chuyên khoa '+doctor.specialty },
                          { year:'2010–nay',  title:'Bác sĩ chuyên khoa tại MedCare', sub:'Trưởng nhóm '+doctor.specialty },
                        ].map(e => (
                          <div key={e.year} className="flex gap-4">
                            <div className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{e.year}</div>
                            <div className="flex-1 border-l-2 border-blue-100 pl-4 pb-3">
                              <p className="font-semibold text-gray-800 text-sm">{e.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{e.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-5">
                    {/* Rating summary */}
                    <div className="flex items-center gap-8 p-4 bg-blue-50 rounded-2xl">
                      <div className="text-center shrink-0">
                        <p className="text-5xl font-extrabold text-blue-600">{doctor.rating}</p>
                        <div className="flex text-yellow-400 justify-center mt-1">{'★'.repeat(5)}</div>
                        <p className="text-xs text-gray-400 mt-1">{doctor.reviewCount} đánh giá</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingDist.map(r => (
                          <div key={r.star} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-4">{r.star}★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{width:`${r.pct}%`}} />
                            </div>
                            <span className="text-gray-400 w-8">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Review list */}
                    <div className="space-y-4">
                      {REVIEWS.map(r => (
                        <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
                          <div className="flex items-start gap-3">
                            <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                                  <p className="text-[10px] text-gray-400">{r.age} tuổi · {r.date}</p>
                                </div>
                                <div className="flex text-yellow-400 text-sm shrink-0">{'★'.repeat(r.rating)}</div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Booking widget ── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-5">
              <div>
                <h3 className="font-extrabold text-gray-800 text-lg">Đặt lịch khám</h3>
                <p className="text-xs text-gray-400 mt-0.5">Chọn ngày và giờ phù hợp</p>
              </div>

              {/* Date picker */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chọn ngày</p>
                <div className="grid grid-cols-7 gap-1">
                  {days.map(d => (
                    <button key={d.date} onClick={() => { setSelDate(d.date); setSelTime(''); }}
                      className={`flex flex-col items-center py-2 rounded-xl border-2 transition-all text-center ${selDate===d.date ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-200 hover:border-blue-300'}`}>
                      <span className={`text-[9px] font-medium ${selDate===d.date?'text-blue-200':'text-gray-400'}`}>{d.day}</span>
                      <span className="text-sm font-extrabold leading-tight">{d.num}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chọn giờ</p>
                {Object.entries({morning:'🌅 Buổi sáng', afternoon:'☀️ Buổi chiều'}).map(([k,l]) => (
                  <div key={k} className="mb-3">
                    <p className="text-[10px] text-gray-400 mb-1.5">{l}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_SLOTS[k].map(t => {
                        const booked = BOOKED.includes(t);
                        return (
                          <button key={t} disabled={booked} onClick={() => setSelTime(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                              booked ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                              : selTime===t ? 'border-blue-500 bg-blue-600 text-white'
                              : 'border-gray-200 hover:border-blue-300 text-gray-600'
                            }`}>{t}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fee */}
              <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Phí khám</span>
                <span className="font-extrabold text-blue-600 text-lg">{doctor.price.toLocaleString('vi-VN')}đ</span>
              </div>

              <button onClick={handleBook} disabled={!selTime}
                className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                {selTime ? `Đặt lịch ${selTime}` : 'Chọn giờ để đặt lịch'}
              </button>

              <div className="text-center">
                <a href="tel:1800599920" className="text-xs text-blue-600 hover:underline font-medium">
                  📞 Hoặc gọi 1800 599 920
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related doctors */}
        <div className="mt-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-5">Bác sĩ cùng chuyên khoa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {doctors.filter(d => d.specialtyId === doctor.specialtyId && d.id !== doctor.id).slice(0,3).concat(
              doctors.filter(d => d.id !== doctor.id).slice(0,3)
            ).slice(0,3).map(d => (
              <Link key={d.id} to={`/doctors/${d.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <img src={d.avatar} alt={d.name} className="w-14 h-14 rounded-xl object-cover object-top shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{d.name}</p>
                  <p className="text-xs text-blue-600">{d.specialty}</p>
                  <p className="text-xs text-gray-400 mt-0.5">★ {d.rating} · {d.experience} năm KN</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
