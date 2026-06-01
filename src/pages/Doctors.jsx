import { useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { doctors, specialties } from '../data/mockData';

const SORT_OPTIONS = [
  { value: 'rating',     label: 'Đánh giá cao nhất' },
  { value: 'experience', label: 'Kinh nghiệm nhiều nhất' },
  { value: 'price_asc',  label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
];

export default function Doctors() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [search, setSearch]                       = useState('');
  const [sort, setSort]                           = useState('rating');
  const [view, setView]                           = useState('horizontal'); // 'horizontal' | 'grid'

  const filtered = doctors
    .filter((d) => {
      const matchSpec   = selectedSpecialty ? d.specialtyId === selectedSpecialty : true;
      const matchSearch = search
        ? d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialty.toLowerCase().includes(search.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
        : true;
      return matchSpec && matchSearch;
    })
    .sort((a, b) => {
      if (sort === 'rating')     return b.rating - a.rating;
      if (sort === 'experience') return b.experience - a.experience;
      if (sort === 'price_asc')  return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Page Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&fit=crop)', backgroundSize: 'cover' }} />
        <div className="container mx-auto px-4 py-14 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-blue-200 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white">Đội ngũ bác sĩ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Đội ngũ bác sĩ chuyên khoa</h1>
          <p className="text-blue-100 max-w-xl">
            Hơn 50 bác sĩ đầu ngành từ các bệnh viện lớn, sẵn sàng tư vấn và điều trị cho bạn
          </p>

          {/* Search bar trong hero */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm bác sĩ, chuyên khoa, bệnh lý..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Specialty chips ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-[57px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedSpecialty === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {specialties.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpecialty(s.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedSpecialty === s.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Sidebar ── */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-28 space-y-6">

              {/* Chuyên khoa */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Chuyên khoa</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSpecialty('')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedSpecialty === ''
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tất cả chuyên khoa</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      {doctors.length}
                    </span>
                  </button>
                  {specialties.map((s) => {
                    const count = doctors.filter((d) => d.specialtyId === s.id).length;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSpecialty(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                          selectedSpecialty === s.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </span>
                        {count > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mức phí */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Mức phí khám</h3>
                <div className="space-y-1 text-sm">
                  {[
                    { label: 'Dưới 250.000đ', value: 'lt250' },
                    { label: '250.000 – 350.000đ', value: '250to350' },
                    { label: 'Trên 350.000đ', value: 'gt350' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5" />
                      <span className="text-slate-600">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Đánh giá */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Đánh giá</h3>
                <div className="space-y-1 text-sm">
                  {[5, 4, 3].map((star) => (
                    <label key={star} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5" />
                      <span className="flex items-center gap-1 text-slate-600">
                        {'★'.repeat(star)}<span className="text-slate-300">{'★'.repeat(5 - star)}</span>
                        <span className="text-xs ml-1">trở lên</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full text-xs text-blue-600 hover:underline text-left px-3">
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>

          {/* ── Danh sách ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-slate-500">
                Hiển thị <strong className="text-slate-900">{filtered.length}</strong> bác sĩ
                {selectedSpecialty && (
                  <span className="ml-1 text-blue-600">
                    · {specialties.find((s) => s.id === selectedSpecialty)?.name}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {/* View toggle */}
                <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setView('horizontal')}
                    title="Danh sách"
                    className={`px-3 py-2 transition-colors ${view === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setView('grid')}
                    title="Lưới"
                    className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zm-8 8h6v6H3v-6zm8 0h6v6h-6v-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards */}
            {filtered.length > 0 ? (
              <div className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              }>
                {filtered.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    layout={view === 'grid' ? 'vertical' : 'horizontal'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="font-semibold text-slate-600">Không tìm thấy bác sĩ phù hợp</p>
                <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={() => { setSearch(''); setSelectedSpecialty(''); }}
                  className="mt-4 text-blue-600 text-sm hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
