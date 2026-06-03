/**
 * PaymentsPage — Xem danh sách thanh toán
 * ──────────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET /api/admin/payments → PaymentResponseDTO[]
 *   { appointmentId, patientName, doctorName, transactionDate,
 *     serviceName, amount, status }
 *
 * Chỉ có chức năng xem (read-only theo lo_trinh.txt)
 */
import { useState, useEffect } from 'react';
import { adminGetPayments } from '../../api/admin';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');

  // ── ADMIN: load danh sách thanh toán ──
  useEffect(() => {
    setLoading(true);
    adminGetPayments()
      .then(res => setPayments(Array.isArray(res) ? res : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    !search ||
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments
    .filter(p => p.status === 'ĐÃ THANH TOÁN')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh sách thanh toán</h1>
          <p className="text-sm text-gray-400 mt-0.5">{payments.length} giao dịch</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-center">
          <p className="text-xs text-gray-400">Tổng doanh thu</p>
          <p className="text-lg font-extrabold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên bệnh nhân, bác sĩ..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Bệnh nhân</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Bác sĩ</th>
              <th className="px-5 py-3 text-left hidden sm:table-cell">Ngày GD</th>
              <th className="px-5 py-3 text-left hidden lg:table-cell">Dịch vụ</th>
              <th className="px-5 py-3 text-right">Số tiền</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p.appointmentId || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-gray-800">{p.patientName}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{p.doctorName}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                  {formatDate(p.transactionDate)}
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">{p.serviceName}</td>
                <td className="px-5 py-3.5 text-right font-bold text-blue-600">
                  {formatCurrency(p.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.status === 'ĐÃ THANH TOÁN'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Tổng footer */}
          {filtered.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-5 py-3 text-xs text-gray-400">
                  Hiển thị {filtered.length} / {payments.length} giao dịch
                </td>
                <td className="px-5 py-3 text-right font-extrabold text-blue-700">
                  {formatCurrency(filtered.reduce((s, p) => s + (p.amount || 0), 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
