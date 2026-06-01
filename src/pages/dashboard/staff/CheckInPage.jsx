import { useState } from 'react';

const QUEUE = [
  { id:1, ticket:'A001', name:'Đỗ Minh Khoa',   phone:'0912 111 222', time:'08:00', doctor:'PGS.TS. Nguyễn Văn An', specialty:'Tim mạch',   status:'checkin',  room:'P101', type:'Lần đầu' },
  { id:2, ticket:'A002', name:'Phan Thị Linh',   phone:'0923 333 444', time:'08:30', doctor:'TS.BS. Trần Thị Bình',  specialty:'Thần kinh',  status:'waiting',  room:'P102', type:'Tái khám' },
  { id:3, ticket:'A003', name:'Hoàng Văn Quân',  phone:'0934 555 666', time:'09:00', doctor:'GS.TS. Lê Minh Châu',   specialty:'Xương khớp', status:'waiting',  room:'P103', type:'Lần đầu' },
  { id:4, ticket:'A004', name:'Nguyễn Thị Hoa',  phone:'0945 777 888', time:'09:30', doctor:'ThS.BS. Phạm Thị Dung', specialty:'Nhi khoa',   status:'pending',  room:'P104', type:'Tái khám' },
  { id:5, ticket:'A005', name:'Trần Văn Bình',   phone:'0956 999 000', time:'10:00', doctor:'TS.BS. Vũ Thị Phương',  specialty:'Mắt',        status:'pending',  room:'P105', type:'Lần đầu' },
  { id:6, ticket:'A006', name:'Lê Thị Thanh',    phone:'0967 000 111', time:'10:30', doctor:'BS.CKI. Hoàng Văn Em',  specialty:'Da liễu',    status:'pending',  room:'P106', type:'Lần đầu' },
];

const STATUS = {
  checkin: { label:'Đã check-in', cls:'bg-green-100 text-green-700',  dot:'bg-green-500',  action:null },
  waiting: { label:'Đang chờ',    cls:'bg-blue-100 text-blue-700',    dot:'bg-blue-500',   action:'Gọi vào' },
  pending: { label:'Chưa đến',    cls:'bg-gray-100 text-gray-500',    dot:'bg-gray-400',   action:'Check-in' },
  called:  { label:'Đã gọi',      cls:'bg-yellow-100 text-yellow-700',dot:'bg-yellow-500', action:null },
};

export default function CheckInPage() {
  const [queue, setQueue] = useState(QUEUE);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name:'', phone:'', specialty:'Tim mạch', doctor:'', type:'first' });

  const handleAction = (id, action) => {
    setQueue(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (action === 'Check-in') return { ...p, status: 'checkin' };
      if (action === 'Gọi vào')  return { ...p, status: 'called' };
      return p;
    }));
  };

  const filtered = queue.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.ticket.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const stats = [
    { label:'Tổng hôm nay',  value: queue.length,                                    color:'text-gray-700',   bg:'bg-gray-100' },
    { label:'Đã check-in',   value: queue.filter(p=>p.status==='checkin').length,    color:'text-green-700',  bg:'bg-green-100' },
    { label:'Đang chờ',      value: queue.filter(p=>p.status==='waiting').length,    color:'text-blue-700',   bg:'bg-blue-100' },
    { label:'Chưa đến',      value: queue.filter(p=>p.status==='pending').length,    color:'text-gray-500',   bg:'bg-gray-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Check-in bệnh nhân</h1>
          <p className="text-sm text-gray-400 mt-0.5">Thứ 3, 27/05/2026</p>
        </div>
        <button onClick={() => setShowNewForm(true)}
          className="bg-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
          + Đặt lịch nhanh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên, số thứ tự, số điện thoại..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Queue list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="col-span-1">STT</span>
            <span className="col-span-4">Bệnh nhân</span>
            <span className="col-span-3 hidden sm:block">Bác sĩ</span>
            <span className="col-span-2">Giờ</span>
            <span className="col-span-2 text-right">Thao tác</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`grid grid-cols-12 items-center px-5 py-3.5 cursor-pointer transition-colors ${selected?.id === p.id ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                <div className="col-span-1">
                  <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-extrabold">
                    {p.ticket}
                  </span>
                </div>
                <div className="col-span-4 min-w-0 pl-2">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.specialty} · {p.type}</p>
                </div>
                <div className="col-span-3 hidden sm:block">
                  <p className="text-xs text-gray-500 truncate">{p.doctor.split('. ').pop()}</p>
                  <p className="text-[10px] text-gray-400">{p.room}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-700">{p.time}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS[p.status].cls}`}>
                    {STATUS[p.status].label}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  {STATUS[p.status].action && (
                    <button onClick={e => { e.stopPropagation(); handleAction(p.id, STATUS[p.status].action); }}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                        STATUS[p.status].action === 'Check-in'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                      {STATUS[p.status].action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Chi tiết</h3>
                <span className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-extrabold text-sm">
                  {selected.ticket}
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Họ tên', selected.name],
                  ['Điện thoại', selected.phone],
                  ['Giờ hẹn', selected.time],
                  ['Bác sĩ', selected.doctor],
                  ['Chuyên khoa', selected.specialty],
                  ['Phòng khám', selected.room],
                  ['Loại khám', selected.type],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-50 text-xs">
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${STATUS[selected.status].cls}`}>
                <span className={`w-2 h-2 rounded-full ${STATUS[selected.status].dot}`}></span>
                {STATUS[selected.status].label}
              </span>
              <div className="flex gap-2 pt-1">
                {STATUS[selected.status].action && (
                  <button onClick={() => handleAction(selected.id, STATUS[selected.status].action)}
                    className="flex-1 bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
                    {STATUS[selected.status].action}
                  </button>
                )}
                <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  🖨️ In phiếu
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm">Chọn bệnh nhân để xem chi tiết</p>
            </div>
          )}

          {/* Quick booking form */}
          {showNewForm && (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">Đặt lịch nhanh</h3>
                <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {[
                { label:'Họ tên', name:'name', type:'text', placeholder:'Nguyễn Văn A' },
                { label:'Điện thoại', name:'phone', type:'text', placeholder:'0912 345 678' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} value={newPatient[f.name]}
                    onChange={e => setNewPatient(p=>({...p,[f.name]:e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Chuyên khoa</label>
                <select value={newPatient.specialty} onChange={e => setNewPatient(p=>({...p,specialty:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50">
                  {['Tim mạch','Thần kinh','Xương khớp','Nhi khoa','Da liễu','Mắt'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => setShowNewForm(false)}
                className="w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
                ✓ Xác nhận đặt lịch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
