import { useState } from 'react';

const MEDICINES = [
  'Amlodipine 5mg', 'Metformin 500mg', 'Atorvastatin 20mg', 'Omeprazole 20mg',
  'Cetirizine 10mg', 'Amoxicillin 500mg', 'Paracetamol 500mg', 'Ibuprofen 400mg',
  'Losartan 50mg', 'Aspirin 81mg', 'Vitamin D3 1000IU', 'Calcium 500mg',
];

const UNITS = ['viên', 'gói', 'ống', 'chai', 'tuýp'];
const FREQ  = ['1 lần/ngày', '2 lần/ngày', '3 lần/ngày', 'Khi cần', 'Trước ăn', 'Sau ăn'];

const recentRx = [
  { id:'RX001', patient:'Lê Văn Cường',   date:'27/05/2026', diagnosis:'Tăng huyết áp', drugs:2, status:'issued' },
  { id:'RX002', patient:'Phạm Thu Hà',    date:'27/05/2026', diagnosis:'Rối loạn nhịp tim', drugs:3, status:'draft' },
  { id:'RX003', patient:'Nguyễn Thị Mai', date:'20/05/2026', diagnosis:'Suy tim độ 1', drugs:4, status:'issued' },
];

export default function PrescriptionPage() {
  const [drugs, setDrugs] = useState([{ name:'', qty:'', unit:'viên', freq:'1 lần/ngày', days:'7', note:'' }]);
  const [form, setForm] = useState({ patient:'', dob:'', diagnosis:'', note:'' });
  const [saved, setSaved] = useState(false);

  const addDrug = () => setDrugs(d => [...d, { name:'', qty:'', unit:'viên', freq:'1 lần/ngày', days:'7', note:'' }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_,idx) => idx !== i));
  const updateDrug = (i, field, val) => setDrugs(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleSave = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Kê đơn thuốc</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tạo và quản lý đơn thuốc cho bệnh nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form kê đơn */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin bệnh nhân</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ tên bệnh nhân <span className="text-red-500">*</span></label>
                <input value={form.patient} onChange={e => setForm(f=>({...f,patient:e.target.value}))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày sinh</label>
                <input type="date" value={form.dob} onChange={e => setForm(f=>({...f,dob:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Chẩn đoán <span className="text-red-500">*</span></label>
                <input value={form.diagnosis} onChange={e => setForm(f=>({...f,diagnosis:e.target.value}))}
                  placeholder="Tăng huyết áp giai đoạn 1..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Danh sách thuốc</h2>
                <button type="button" onClick={addDrug}
                  className="text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 font-semibold transition-colors">
                  + Thêm thuốc
                </button>
              </div>
              <div className="space-y-3">
                {drugs.map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Thuốc #{i+1}</span>
                      {drugs.length > 1 && (
                        <button type="button" onClick={() => removeDrug(i)} className="text-red-400 hover:text-red-600 text-xs">✕ Xóa</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tên thuốc</label>
                        <input list={`med-list-${i}`} value={d.name} onChange={e => updateDrug(i,'name',e.target.value)}
                          placeholder="Nhập hoặc chọn thuốc..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                        <datalist id={`med-list-${i}`}>
                          {MEDICINES.map(m => <option key={m} value={m} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Số lượng</label>
                        <div className="flex gap-1">
                          <input type="number" value={d.qty} onChange={e => updateDrug(i,'qty',e.target.value)}
                            placeholder="30" min="1"
                            className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                          <select value={d.unit} onChange={e => updateDrug(i,'unit',e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none bg-white">
                            {UNITS.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tần suất</label>
                        <select value={d.freq} onChange={e => updateDrug(i,'freq',e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none bg-white">
                          {FREQ.map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Số ngày</label>
                        <input type="number" value={d.days} onChange={e => updateDrug(i,'days',e.target.value)}
                          min="1" placeholder="7"
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Ghi chú</label>
                        <input value={d.note} onChange={e => updateDrug(i,'note',e.target.value)}
                          placeholder="Uống sau ăn..."
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lời dặn của bác sĩ</label>
              <textarea value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
                rows={3} placeholder="Tái khám sau 2 tuần, hạn chế muối, tập thể dục nhẹ..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50 resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                💾 Lưu đơn thuốc
              </button>
              <button type="button"
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                🖨️ In đơn
              </button>
              {saved && <span className="text-green-600 text-sm font-medium">✓ Đã lưu thành công</span>}
            </div>
          </form>
        </div>

        {/* Đơn thuốc gần đây */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Đơn thuốc gần đây</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRx.map(rx => (
              <div key={rx.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{rx.patient}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{rx.diagnosis}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{rx.date} · {rx.drugs} loại thuốc</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${rx.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {rx.status === 'issued' ? 'Đã phát' : 'Nháp'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
