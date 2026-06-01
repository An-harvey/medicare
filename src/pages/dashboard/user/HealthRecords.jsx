import { useState } from 'react';

const records = [
  { id: 1, date: '10/04/2026', doctor: 'BS.CKI. Hoàng Văn Em', specialty: 'Da liễu', diagnosis: 'Viêm da cơ địa mức độ nhẹ', prescription: 'Cetirizine 10mg (1 viên/ngày), Hydrocortisone cream 1% (bôi 2 lần/ngày)', note: 'Tránh tiếp xúc với xà phòng mạnh, tái khám sau 2 tuần nếu không cải thiện.', files: ['ket-qua-xet-nghiem.pdf'] },
  { id: 2, date: '15/03/2026', doctor: 'TS.BS. Vũ Thị Phương',  specialty: 'Mắt',     diagnosis: 'Cận thị độ 2.5 (mắt phải), độ 2.0 (mắt trái)', prescription: 'Kính cận theo đơn, nhỏ mắt Systane Ultra 2 lần/ngày', note: 'Hạn chế nhìn màn hình liên tục quá 45 phút. Kiểm tra lại sau 6 tháng.', files: ['don-kinh.pdf', 'ket-qua-do-mat.pdf'] },
  { id: 3, date: '20/01/2026', doctor: 'PGS.TS. Nguyễn Văn An', specialty: 'Tim mạch', diagnosis: 'Huyết áp cao giai đoạn 1 (140/90 mmHg)', prescription: 'Amlodipine 5mg (1 viên/ngày buổi sáng), theo dõi huyết áp hàng ngày', note: 'Giảm muối trong khẩu phần ăn, tập thể dục nhẹ 30 phút/ngày. Tái khám sau 1 tháng.', files: ['dien-tam-do.pdf', 'sieu-am-tim.pdf'] },
];

export default function HealthRecords() {
  const [selected, setSelected] = useState(records[0]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Hồ sơ sức khỏe</h1>
        <p className="text-sm text-gray-400 mt-0.5">Lịch sử khám bệnh và đơn thuốc của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timeline */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Lịch sử khám</p>
          {records.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md ${selected?.id === r.id ? 'border-blue-400 shadow-sm' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selected?.id === r.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-xs text-gray-400">{r.date}</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{r.diagnosis}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.doctor}</p>
                  <span className="inline-block mt-1.5 text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{r.specialty}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">{selected.specialty}</span>
                <h2 className="text-lg font-extrabold text-gray-800 mt-2">{selected.diagnosis}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{selected.doctor} · {selected.date}</p>
              </div>
              <button className="shrink-0 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                🖨️ In hồ sơ
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">💊 Đơn thuốc</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selected.prescription}</p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">📝 Lời dặn của bác sĩ</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selected.note}</p>
            </div>

            {selected.files.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📎 Tài liệu đính kèm</p>
                <div className="flex flex-wrap gap-2">
                  {selected.files.map(f => (
                    <button key={f} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                      <span>📄</span>{f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
