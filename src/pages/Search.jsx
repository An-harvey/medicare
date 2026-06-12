import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDoctors } from '../hooks/useDoctors';
import { useSpecialties } from '../hooks/useCatalog';
import BookDoctorButton from '../components/common/BookDoctorButton';

const SORT_OPTS = [
  { value:'rating',     label:'Đánh giá cao nhất' },
  { value:'experience', label:'Kinh nghiệm nhiều nhất' },
  { value:'price_asc',  label:'Giá thấp → cao' },
  { value:'price_desc', label:'Giá cao → thấp' },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const { data: doctors, loading } = useDoctors();
  const { data: specialties } = useSpecialties();
  const [sort, setSort] = useState('rating');
  const [priceRange, setPriceRange] = useState('all');
  const [selSpec, setSelSpec] = useState(params.get('specialty') || '');
  const [query, setQuery] = useState(params.get('q') || '');

  useEffect(() => {
    setQuery(params.get('q') || '');
    setSelSpec(params.get('specialty') || '');
  }, [params]);

  const filtered = doctors
    .filter(d => {
      const specName = d.specialty || d.specialtyName || '';
      const matchQ    = !query || d.name?.toLowerCase().includes(query.toLowerCase()) || specName.toLowerCase().includes(query.toLowerCase()) || (d.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()));
      const matchSpec = !selSpec || String(d.specialtyId) === String(selSpec);
      const matchPrice = priceRange === 'all' ? true
        : priceRange === 'lt250' ? d.price < 250000
        : priceRange === '250to350' ? d.price >= 250000 && d.price <= 350000
        : d.price > 350000;
      return matchQ && matchSpec && matchPrice;
    })
    .sort((a,b) => {
      if (sort==='rating')     return b.rating - a.rating;
      if (sort==='experience') return b.experience - a.experience;
      if (sort==='price_asc')  return a.price - b.price;
      if (sort==='price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm py-5">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 max-w-3xl">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input value={query} onChange={e => { setQuery(e.target.value); setParams(p => { const n=new URLSearchParams(p); n.set('q',e.target.value); return n; }); }}
                placeholder="Tìm bác sĩ, chuyên khoa, bệnh lý..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
            </div>
            <select value={selSpec} onChange={e => { setSelSpec(e.target.value); setParams(p => { const n=new URLSearchParams(p); n.set('specialty',e.target.value); return n; }); }}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none bg-gray-50 min-w-[160px]">
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-7">
          {/* Sidebar filters */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Chuyên khoa</h3>
                <div className="space-y-1">
                  <button onClick={() => setSelSpec('')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${!selSpec ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>Tất cả</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{doctors.length}</span>
                  </button>
                  {specialties.map(s => {
                    const cnt = doctors.filter(d => d.specialtyId === s.id).length;
                    return (
                      <button key={s.id} onClick={() => setSelSpec(s.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${selSpec===s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-2"><span>{s.icon}</span><span>{s.name}</span></span>
                        {cnt > 0 && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cnt}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mức phí</h3>
                <div className="space-y-1">
                  {[['all','Tất cả'],['lt250','Dưới 250.000đ'],['250to350','250K – 350K'],['gt350','Trên 350.000đ']].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="price" checked={priceRange===v} onChange={() => setPriceRange(v)} className="accent-blue-600" />
                      <span className="text-sm text-gray-600">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Đánh giá</h3>
                <div className="space-y-1">
                  {[5,4,3].map(star => (
                    <label key={star} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="accent-blue-600" />
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="text-yellow-400">{'★'.repeat(star)}</span>
                        <span className="text-gray-300">{'★'.repeat(5-star)}</span>
                        <span className="text-xs ml-1">trở lên</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => { setSelSpec(''); setPriceRange('all'); setQuery(''); }}
                className="w-full text-xs text-blue-600 hover:underline text-left px-3">
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                Tìm thấy <strong className="text-gray-800">{filtered.length}</strong> bác sĩ
                {query && <span className="text-blue-600"> cho "{query}"</span>}
              </p>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 focus:outline-none bg-white">
                {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map(d => (
                  <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex">
                    <div className="w-32 shrink-0 overflow-hidden">
                      <img src={d.avatar} alt={d.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{d.specialty}</span>
                            <h3 className="font-extrabold text-gray-800 text-base mt-1">{d.name}</h3>
                            <p className="text-xs text-gray-400">{d.degree}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-400">Phí khám</p>
                            <p className="font-extrabold text-blue-600">{d.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">🏥 {d.hospital}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1"><span className="text-yellow-400">★</span><strong>{d.rating}</strong><span className="text-gray-400">({d.reviewCount})</span></span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">{d.experience} năm KN</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(d.tags ?? []).map(t => <span key={t} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Link to={`/doctors/${d.id}`}
                          className="border border-blue-200 text-blue-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                          Xem hồ sơ
                        </Link>
                        <BookDoctorButton
                          doctorId={d.id}
                          from={`/search?q=${encodeURIComponent(query)}`}
                          className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Đặt lịch
                        </BookDoctorButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="font-semibold text-gray-600">Không tìm thấy bác sĩ phù hợp</p>
                <p className="text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
