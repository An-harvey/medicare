import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const SECTIONS = [
  { id: 'notifications', label: 'Thông báo',    icon: '🔔' },
  { id: 'privacy',       label: 'Bảo mật',      icon: '🔒' },
  { id: 'appearance',    label: 'Giao diện',     icon: '🎨' },
  { id: 'language',      label: 'Ngôn ngữ',      icon: '🌐' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState('notifications');
  const [saved, setSaved] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    emailBooking:   true,
    emailReminder:  true,
    emailNews:      false,
    smsBooking:     true,
    smsReminder:    true,
    pushAll:        true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile:    true,
    showHistory:    false,
    twoFactor:      false,
    sessionTimeout: '30',
  });

  const toggle = (setter, key) => setter(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Cài đặt</h1>
        <p className="text-sm text-gray-400 mt-0.5">Quản lý tùy chọn tài khoản của bạn</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar */}
        <div className="sm:w-48 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active === s.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-1">
          {active === 'notifications' && (
            <>
              <h2 className="font-bold text-gray-800 mb-4">Cài đặt thông báo</h2>
              <div className="space-y-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2">Email</p>
                <Toggle checked={notifSettings.emailBooking}  onChange={() => toggle(setNotifSettings,'emailBooking')}  label="Xác nhận lịch hẹn"    desc="Nhận email khi lịch hẹn được xác nhận hoặc thay đổi" />
                <Toggle checked={notifSettings.emailReminder} onChange={() => toggle(setNotifSettings,'emailReminder')} label="Nhắc nhở lịch khám"   desc="Nhận email nhắc nhở trước 24 giờ" />
                <Toggle checked={notifSettings.emailNews}     onChange={() => toggle(setNotifSettings,'emailNews')}     label="Tin tức sức khỏe"     desc="Nhận bản tin sức khỏe hàng tuần" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2 mt-2">SMS</p>
                <Toggle checked={notifSettings.smsBooking}    onChange={() => toggle(setNotifSettings,'smsBooking')}    label="Xác nhận lịch hẹn"    desc="Nhận SMS khi lịch hẹn được xác nhận" />
                <Toggle checked={notifSettings.smsReminder}   onChange={() => toggle(setNotifSettings,'smsReminder')}   label="Nhắc nhở lịch khám"   desc="Nhận SMS nhắc nhở trước 2 giờ" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2 mt-2">Push notification</p>
                <Toggle checked={notifSettings.pushAll}       onChange={() => toggle(setNotifSettings,'pushAll')}       label="Tất cả thông báo"     desc="Bật/tắt toàn bộ push notification" />
              </div>
            </>
          )}

          {active === 'privacy' && (
            <>
              <h2 className="font-bold text-gray-800 mb-4">Bảo mật & Quyền riêng tư</h2>
              <Toggle checked={privacySettings.showProfile}  onChange={() => toggle(setPrivacySettings,'showProfile')}  label="Hiển thị hồ sơ công khai" desc="Cho phép bác sĩ xem thông tin cơ bản của bạn" />
              <Toggle checked={privacySettings.showHistory}  onChange={() => toggle(setPrivacySettings,'showHistory')}  label="Chia sẻ lịch sử khám"     desc="Cho phép bác sĩ mới xem lịch sử khám trước đây" />
              <Toggle checked={privacySettings.twoFactor}    onChange={() => toggle(setPrivacySettings,'twoFactor')}    label="Xác thực 2 bước"          desc="Tăng cường bảo mật tài khoản bằng OTP" />
              <div className="py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tự động đăng xuất sau</p>
                <select value={privacySettings.sessionTimeout}
                  onChange={e => setPrivacySettings(p => ({ ...p, sessionTimeout: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                  <option value="15">15 phút</option>
                  <option value="30">30 phút</option>
                  <option value="60">1 giờ</option>
                  <option value="0">Không tự động đăng xuất</option>
                </select>
              </div>
              <div className="pt-3">
                <button className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors font-semibold">
                  🗑️ Xóa tài khoản
                </button>
              </div>
            </>
          )}

          {active === 'appearance' && (
            <>
              <h2 className="font-bold text-gray-800 mb-4">Giao diện</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Chủ đề màu sắc</p>
                  <div className="flex gap-3">
                    {[
                      { label:'Sáng',  value:'light', bg:'bg-white border-2 border-gray-200' },
                      { label:'Tối',   value:'dark',  bg:'bg-gray-800' },
                      { label:'Hệ thống', value:'system', bg:'bg-gradient-to-r from-white to-gray-800' },
                    ].map(t => (
                      <button key={t.value} className={`${t.bg} w-16 h-10 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-colors`} title={t.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Cỡ chữ</p>
                  <div className="flex gap-2">
                    {['Nhỏ','Vừa','Lớn'].map(s => (
                      <button key={s} className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${s==='Vừa' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {active === 'language' && (
            <>
              <h2 className="font-bold text-gray-800 mb-4">Ngôn ngữ & Khu vực</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngôn ngữ hiển thị</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                    <option>🇻🇳 Tiếng Việt</option>
                    <option>🇺🇸 English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Múi giờ</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                    <option>GMT+7 (Hà Nội, TP.HCM)</option>
                    <option>GMT+0 (London)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Định dạng ngày</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-5 border-t border-gray-100 mt-4">
            <button onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Lưu thay đổi
            </button>
            {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1">✓ Đã lưu</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
