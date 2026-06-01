import { useState } from 'react';
import { Link } from 'react-router-dom';

const PACKAGES = [
  {
    id: 1,
    name: 'Gói Khám Cơ Bản',
    tag: 'Phổ biến',
    tagColor: 'bg-blue-100 text-blue-700',
    price: 990000,
    originalPrice: 1200000,
    duration: '2–3 giờ',
    target: 'Người từ 18–40 tuổi',
    icon: '🩺',
    color: 'border-blue-200',
    headerBg: 'bg-blue-600',
    items: [
      'Khám lâm sàng tổng quát',
      'Xét nghiệm máu cơ bản (CBC, đường huyết)',
      'Xét nghiệm nước tiểu',
      'Đo huyết áp, nhịp tim',
      'Tư vấn kết quả với bác sĩ',
    ],
  },
  {
    id: 2,
    name: 'Gói Khám Toàn Diện',
    tag: 'Được chọn nhiều nhất',
    tagColor: 'bg-green-100 text-green-700',
    price: 2490000,
    originalPrice: 3200000,
    duration: '4–5 giờ',
    target: 'Người từ 30–55 tuổi',
    icon: '🏥',
    color: 'border-green-400',
    headerBg: 'bg-green-600',
    highlight: true,
    items: [
      'Tất cả dịch vụ gói Cơ Bản',
      'Siêu âm ổ bụng tổng quát',
      'Điện tâm đồ (ECG)',
      'Chụp X-quang ngực thẳng',
      'Xét nghiệm mỡ máu (Lipid profile)',
      'Xét nghiệm chức năng gan, thận',
      'Đo loãng xương (DEXA)',
      'Tư vấn dinh dưỡng',
    ],
  },
  {
    id: 3,
    name: 'Gói Khám Cao Cấp',
    tag: 'Premium',
    tagColor: 'bg-purple-100 text-purple-700',
    price: 4990000,
    originalPrice: 6500000,
    duration: '1 ngày',
    target: 'Người từ 40 tuổi trở lên',
    icon: '⭐',
    color: 'border-purple-200',
    headerBg: 'bg-purple-600',
    items: [
      'Tất cả dịch vụ gói Toàn Diện',
      'Chụp CT Scanner ngực/bụng',
      'Nội soi dạ dày',
      'Xét nghiệm ung thư marker (CEA, AFP, PSA)',
      'Siêu âm tim',
      'Đo thị lực, nhãn áp',
      'Khám tai mũi họng',
      'Tư vấn chuyên sâu với chuyên gia',
      'Báo cáo sức khỏe điện tử',
    ],
  },
  {
    id: 4,
    name: 'Gói Khám Phụ Nữ',
    tag: 'Dành cho nữ',
    tagColor: 'bg-pink-100 text-pink-700',
    price: 1990000,
    originalPrice: 2500000,
    duration: '3–4 giờ',
    target: 'Phụ nữ từ 25 tuổi',
    icon: '👩‍⚕️',
    color: 'border-pink-200',
    headerBg: 'bg-pink-500',
    items: [
      'Khám phụ khoa tổng quát',
      'Siêu âm tử cung – buồng trứng',
      'Xét nghiệm Pap smear',
      'Xét nghiệm HPV',
      'Xét nghiệm hormone sinh dục',
      'Đo mật độ xương',
      'Tư vấn sức khỏe sinh sản',
    ],
  },
];

const FAQS = [
  { q: 'Tôi cần chuẩn bị gì trước khi đến khám?', a: 'Nhịn ăn ít nhất 8 tiếng trước khi xét nghiệm máu. Mang theo CMND/CCCD và thẻ BHYT (nếu có). Mặc trang phục thoải mái, dễ thay.' },
  { q: 'Kết quả khám được trả trong bao lâu?', a: 'Kết quả xét nghiệm cơ bản có trong ngày. Kết quả nội soi, CT scan trong 24–48 giờ. Tất cả kết quả được gửi qua email và lưu trên hồ sơ điện tử.' },
  { q: 'Gói khám có bao gồm thuốc không?', a: 'Gói khám không bao gồm thuốc điều trị. Nếu cần điều trị, bác sĩ sẽ kê đơn và bạn thanh toán riêng.' },
  { q: 'Có thể đặt lịch cho người thân không?', a: 'Có, bạn có thể đặt lịch cho người thân. Vui lòng điền đầy đủ thông tin của người được khám khi đặt lịch.' },
];

export default function Packages() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block bg-white/15 border border-white/20 text-sm px-4 py-1.5 rounded-full mb-4">
            🏥 Gói khám sức khỏe định kỳ
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Chăm sóc sức khỏe toàn diện</h1>
          <p className="text-blue-100 max-w-xl mx-auto text-sm leading-relaxed">
            Phát hiện sớm bệnh lý, bảo vệ sức khỏe bản thân và gia đình với các gói khám được thiết kế bởi chuyên gia đầu ngành
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {PACKAGES.map(pkg => (
            <div key={pkg.id}
              className={`bg-white rounded-3xl border-2 ${pkg.color} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${pkg.highlight ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
              {/* Header */}
              <div className={`${pkg.headerBg} text-white p-5`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{pkg.icon}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20`}>{pkg.tag}</span>
                </div>
                <h3 className="font-extrabold text-lg leading-tight">{pkg.name}</h3>
                <p className="text-white/70 text-xs mt-1">{pkg.target}</p>
              </div>

              {/* Price */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-gray-800">
                    {pkg.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 line-through">{pkg.originalPrice.toLocaleString('vi-VN')}đ</span>
                  <span className="text-xs font-bold text-red-500">
                    -{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">⏱ Thời gian: {pkg.duration}</p>
              </div>

              {/* Items */}
              <div className="px-5 py-4 flex-1">
                <ul className="space-y-2">
                  {pkg.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <Link to="/login"
                  className={`block w-full text-center py-3 rounded-2xl text-sm font-bold transition-colors ${
                    pkg.highlight
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}>
                  Đặt lịch gói này
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Why choose */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-8">Tại sao chọn gói khám tại MedCare?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '👨‍⚕️', title: 'Bác sĩ đầu ngành', desc: 'PGS, TS từ các BV lớn với 10–25 năm kinh nghiệm' },
              { icon: '🔬', title: 'Thiết bị hiện đại', desc: 'Máy móc nhập khẩu từ Đức, Nhật đạt chuẩn quốc tế' },
              { icon: '📱', title: 'Kết quả điện tử', desc: 'Nhận kết quả qua app, lưu trữ vĩnh viễn trên hệ thống' },
              { icon: '🛡️', title: 'Bảo mật tuyệt đối', desc: 'Hồ sơ bệnh nhân được mã hóa và bảo mật theo chuẩn HIPAA' },
            ].map(f => (
              <div key={f.title} className="text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                  <span className={`text-gray-400 transition-transform shrink-0 ml-3 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
