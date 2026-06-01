import { useParams, Link } from 'react-router-dom';

const ARTICLES = {
  1: {
    id: 1,
    title: '5 dấu hiệu cảnh báo bệnh tim mạch bạn không nên bỏ qua',
    category: 'Tim mạch',
    categoryColor: 'bg-red-100 text-red-600',
    date: '15/05/2026',
    readTime: '5 phút',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&h=500&fit=crop',
    author: 'PGS.TS. Nguyễn Văn An',
    authorImg: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=faces,top',
    authorTitle: 'Chuyên khoa Tim mạch · MedCare',
    content: [
      { type: 'intro', text: 'Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam, chiếm hơn 33% tổng số ca tử vong mỗi năm. Điều đáng lo ngại là nhiều người không nhận ra các dấu hiệu cảnh báo sớm cho đến khi bệnh đã tiến triển nặng.' },
      { type: 'h2', text: '1. Đau tức ngực' },
      { type: 'p', text: 'Đây là triệu chứng phổ biến nhất của bệnh tim. Cơn đau thường được mô tả như cảm giác bị ép chặt, đè nặng hoặc bóp nghẹt ở vùng ngực. Cơn đau có thể lan ra cánh tay trái, vai, cổ, hàm hoặc lưng.' },
      { type: 'warning', text: 'Nếu bạn cảm thấy đau ngực kéo dài hơn 15 phút, hãy gọi cấp cứu ngay lập tức. Đây có thể là dấu hiệu của nhồi máu cơ tim.' },
      { type: 'h2', text: '2. Khó thở bất thường' },
      { type: 'p', text: 'Khó thở khi leo cầu thang, đi bộ ngắn hoặc thậm chí khi nghỉ ngơi có thể là dấu hiệu tim không bơm máu hiệu quả. Tình trạng này thường đi kèm với mệt mỏi và sưng phù chân.' },
      { type: 'h2', text: '3. Tim đập nhanh hoặc không đều' },
      { type: 'p', text: 'Cảm giác tim đập mạnh, nhanh hoặc bỏ nhịp (hồi hộp) đôi khi là bình thường sau khi tập thể dục hoặc căng thẳng. Tuy nhiên, nếu xảy ra thường xuyên mà không có lý do rõ ràng, đây có thể là dấu hiệu của rối loạn nhịp tim.' },
      { type: 'h2', text: '4. Mệt mỏi bất thường' },
      { type: 'p', text: 'Cảm thấy kiệt sức dù không làm việc nặng, đặc biệt ở phụ nữ, có thể là dấu hiệu sớm của bệnh tim. Tim phải làm việc nhiều hơn để bơm máu, dẫn đến cơ thể thiếu năng lượng.' },
      { type: 'h2', text: '5. Chóng mặt và ngất xỉu' },
      { type: 'p', text: 'Chóng mặt đột ngột, cảm giác sắp ngất hoặc thực sự ngất xỉu có thể do tim không cung cấp đủ máu lên não. Đây là triệu chứng cần được đánh giá y tế ngay lập tức.' },
      { type: 'h2', text: 'Khi nào cần đi khám?' },
      { type: 'p', text: 'Nếu bạn có bất kỳ triệu chứng nào trên, đặc biệt khi kết hợp với các yếu tố nguy cơ như hút thuốc, tiểu đường, huyết áp cao, béo phì hoặc tiền sử gia đình mắc bệnh tim, hãy đến gặp bác sĩ tim mạch ngay.' },
      { type: 'tip', text: 'Khám tim mạch định kỳ mỗi năm một lần là cách tốt nhất để phát hiện sớm và phòng ngừa bệnh tim mạch, đặc biệt với người trên 40 tuổi.' },
    ],
    tags: ['Tim mạch', 'Sức khỏe tim', 'Phòng ngừa bệnh', 'Nhồi máu cơ tim'],
    relatedDoctorId: 1,
  },
};

export default function ArticleDetail() {
  const { id } = useParams();
  const article = ARTICLES[id] || ARTICLES[1];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-blue-600">Tin tức</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium line-clamp-1">{article.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

          {/* ── Main content ── */}
          <article className="flex-1 min-w-0">
            {/* Hero image */}
            <div className="rounded-3xl overflow-hidden mb-6 shadow-md">
              <img src={article.image} alt={article.title} className="w-full h-64 md:h-80 object-cover" />
            </div>

            {/* Meta */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${article.categoryColor}`}>{article.category}</span>
                  <span className="text-xs text-gray-400">{article.date}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">⏱ {article.readTime} đọc</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-tight">{article.title}</h1>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 pb-4 border-b border-gray-100">
                  <img src={article.authorImg} alt={article.author} className="w-11 h-11 rounded-xl object-cover object-top" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{article.author}</p>
                    <p className="text-xs text-gray-400">{article.authorTitle}</p>
                  </div>
                  <Link to={`/doctors/${article.relatedDoctorId}`}
                    className="ml-auto text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors font-semibold">
                    Đặt lịch khám
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 text-gray-700">
                {article.content.map((block, i) => {
                  if (block.type === 'intro') return (
                    <p key={i} className="text-base leading-relaxed font-medium text-gray-600 border-l-4 border-blue-400 pl-4 bg-blue-50 py-3 rounded-r-xl">{block.text}</p>
                  );
                  if (block.type === 'h2') return (
                    <h2 key={i} className="text-lg font-extrabold text-gray-800 mt-6 pt-2">{block.text}</h2>
                  );
                  if (block.type === 'p') return (
                    <p key={i} className="text-sm leading-relaxed">{block.text}</p>
                  );
                  if (block.type === 'warning') return (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                      <span className="text-xl shrink-0">⚠️</span>
                      <p className="text-sm text-red-700 font-medium leading-relaxed">{block.text}</p>
                    </div>
                  );
                  if (block.type === 'tip') return (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                      <span className="text-xl shrink-0">💡</span>
                      <p className="text-sm text-green-700 font-medium leading-relaxed">{block.text}</p>
                    </div>
                  );
                  return null;
                })}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(t => (
                    <Link key={t} to={`/news?q=${t}`}
                      className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      #{t}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <p className="text-xs font-bold text-gray-500">Chia sẻ:</p>
                {[
                  { label:'Facebook', color:'bg-blue-600', icon:'f' },
                  { label:'Zalo',     color:'bg-blue-400', icon:'Z' },
                  { label:'Copy link', color:'bg-gray-600', icon:'🔗' },
                ].map(s => (
                  <button key={s.label} className={`${s.color} text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity`}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="lg:w-72 shrink-0 space-y-5">
            {/* CTA khám */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-5 text-white">
              <p className="font-extrabold text-lg mb-1">Cần tư vấn?</p>
              <p className="text-blue-100 text-xs mb-4 leading-relaxed">Đặt lịch khám với chuyên gia Tim mạch ngay hôm nay</p>
              <Link to={`/doctors/${article.relatedDoctorId}`}
                className="block w-full bg-white text-blue-600 text-sm font-bold py-2.5 rounded-xl text-center hover:bg-blue-50 transition-colors">
                Đặt lịch khám ngay
              </Link>
              <a href="tel:1800599920" className="block text-center text-blue-200 text-xs mt-2 hover:text-white">
                📞 1800 599 920
              </a>
            </div>

            {/* Bài viết liên quan */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 text-sm">Bài viết liên quan</h3>
              <div className="space-y-4">
                {[
                  { id:4, title:'Tăng huyết áp – "Kẻ giết người thầm lặng"', img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&h=60&fit=crop', date:'01/05/2026' },
                  { id:2, title:'Chế độ dinh dưỡng cho trẻ dưới 3 tuổi', img:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=80&h=60&fit=crop', date:'10/05/2026' },
                  { id:3, title:'Đau lưng mãn tính: Nguyên nhân và điều trị', img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&h=60&fit=crop', date:'05/05/2026' },
                ].map(a => (
                  <Link key={a.id} to={`/news/${a.id}`} className="flex gap-3 group">
                    <img src={a.img} alt={a.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">{a.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{a.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Gói khám */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Gói khám tim mạch</h3>
              <div className="bg-blue-50 rounded-2xl p-4 mb-3">
                <p className="font-bold text-gray-800 text-sm">Gói Khám Toàn Diện</p>
                <p className="text-xs text-gray-500 mt-0.5">Bao gồm siêu âm tim, ECG, xét nghiệm máu</p>
                <p className="text-blue-600 font-extrabold mt-2">2.490.000đ</p>
                <p className="text-xs text-gray-400 line-through">3.200.000đ</p>
              </div>
              <Link to="/packages" className="block w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl text-center hover:bg-blue-700 transition-colors">
                Xem tất cả gói khám
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
