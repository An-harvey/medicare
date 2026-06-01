import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Tất cả','Tim mạch','Nhi khoa','Cơ xương khớp','Da liễu','Dinh dưỡng','Sức khỏe tổng quát'];

const ARTICLES = [
  { id:1, title:'5 dấu hiệu cảnh báo bệnh tim mạch bạn không nên bỏ qua', category:'Tim mạch', date:'15/05/2026', readTime:'5 phút', image:'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=350&fit=crop', author:'PGS.TS. Nguyễn Văn An', authorImg:'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam. Nhận biết sớm các triệu chứng giúp tăng cơ hội điều trị thành công lên đến 90%.', featured:true },
  { id:2, title:'Chế độ dinh dưỡng cho trẻ dưới 3 tuổi: Những điều cha mẹ cần biết', category:'Nhi khoa', date:'10/05/2026', readTime:'7 phút', image:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=350&fit=crop', author:'ThS.BS. Phạm Thị Dung', authorImg:'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Giai đoạn 1000 ngày đầu đời là nền tảng quyết định sức khỏe và trí tuệ của trẻ. Chế độ dinh dưỡng đúng cách giúp trẻ phát triển toàn diện.', featured:false },
  { id:3, title:'Đau lưng mãn tính: Nguyên nhân và phương pháp điều trị hiệu quả', category:'Cơ xương khớp', date:'05/05/2026', readTime:'6 phút', image:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=350&fit=crop', author:'GS.TS. Lê Minh Châu', authorImg:'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Hơn 80% người trưởng thành từng bị đau lưng ít nhất một lần trong đời. Hiểu đúng nguyên nhân giúp lựa chọn phương pháp điều trị phù hợp.', featured:false },
  { id:4, title:'Tăng huyết áp – "Kẻ giết người thầm lặng" và cách phòng ngừa', category:'Tim mạch', date:'01/05/2026', readTime:'8 phút', image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=350&fit=crop', author:'PGS.TS. Nguyễn Văn An', authorImg:'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Tăng huyết áp ảnh hưởng đến hơn 25% dân số Việt Nam. Phần lớn không có triệu chứng rõ ràng cho đến khi xảy ra biến chứng nghiêm trọng.', featured:false },
  { id:5, title:'Mụn trứng cá ở người lớn: Nguyên nhân và giải pháp điều trị', category:'Da liễu', date:'28/04/2026', readTime:'5 phút', image:'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=350&fit=crop', author:'BS.CKI. Hoàng Văn Em', authorImg:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Mụn trứng cá không chỉ là vấn đề của tuổi dậy thì. Ngày càng nhiều người trưởng thành gặp phải tình trạng này do stress, hormone và chế độ ăn.', featured:false },
  { id:6, title:'Khám mắt định kỳ: Tại sao quan trọng và nên khám bao lâu một lần?', category:'Sức khỏe tổng quát', date:'25/04/2026', readTime:'4 phút', image:'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=350&fit=crop', author:'TS.BS. Vũ Thị Phương', authorImg:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=faces,top', excerpt:'Nhiều bệnh về mắt không có triệu chứng rõ ràng ở giai đoạn đầu. Khám mắt định kỳ giúp phát hiện sớm và điều trị kịp thời.', featured:false },
];

const CAT_COLOR = {
  'Tim mạch':'bg-red-100 text-red-700', 'Nhi khoa':'bg-yellow-100 text-yellow-700',
  'Cơ xương khớp':'bg-blue-100 text-blue-700', 'Da liễu':'bg-green-100 text-green-700',
  'Dinh dưỡng':'bg-orange-100 text-orange-700', 'Sức khỏe tổng quát':'bg-purple-100 text-purple-700',
};

export default function News() {
  const [cat, setCat] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const filtered = ARTICLES.filter(a => {
    const matchCat = cat === 'Tất cả' || a.category === cat;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = ARTICLES.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || cat !== 'Tất cả' || search);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-2">Tin tức & Kiến thức sức khỏe</h1>
          <p className="text-blue-100 text-sm">Cập nhật kiến thức y tế từ đội ngũ bác sĩ chuyên khoa MedCare</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${cat===c ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Featured article */}
        {featured && cat === 'Tất cả' && !search && (
          <Link to={`/news/${featured.id}`} className="block group">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img src={featured.image} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">🔥 Nổi bật</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3 ${CAT_COLOR[featured.category]}`}>{featured.category}</span>
                  <h2 className="text-2xl font-extrabold text-gray-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{featured.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <img src={featured.authorImg} alt={featured.author} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{featured.author}</p>
                      <p className="text-xs text-gray-400">{featured.date} · {featured.readTime} đọc</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(a => (
            <Link key={a.id} to={`/news/${a.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="h-44 overflow-hidden">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CAT_COLOR[a.category]}`}>{a.category}</span>
                  <span className="text-[10px] text-gray-400">{a.readTime} đọc</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{a.excerpt}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <img src={a.authorImg} alt={a.author} className="w-7 h-7 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{a.author}</p>
                    <p className="text-[10px] text-gray-400">{a.date}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold text-gray-600">Không tìm thấy bài viết nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
