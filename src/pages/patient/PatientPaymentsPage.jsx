/**
 * PatientPaymentsPage — Lịch sử thanh toán (PATIENT)
 * ────────────────────────────────────────────────────
 * Route: /dashboard/payments
 * API: GET /patient/payments?status=&page=0&size=10
 *      → Page<PaymentResponseDTO>
 *
 * PaymentResponseDTO:
 *   { appointmentId, patientName, doctorName, transactionDate,
 *     serviceName, amount, status }
 *
 * status enum: UNPAID | PAID | REFUNDED | CANCELLED
 */
import { useState, useCallback, useEffect } from 'react';
import { PAYMENT_STATUS } from '../../utils/constants';
import { getMyPayments, createVnPayLink } from '../../api/payment';
import { formatDate, formatCurrency } from '../../utils/formatters';

const STATUS_TABS = [
  { key: '',          label: 'Tất cả' },
  { key: 'UNPAID',    label: 'Chưa thanh toán' },
  { key: 'PAID',      label: 'Đã thanh toán' },
  { key: 'REFUNDED',  label: 'Đã hoàn tiền' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export default function PatientPaymentsPage() {
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [statusTab, setStatusTab] = useState('');
  const [payingId,  setPayingId]  = useState(null);
  const [toast,     setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchPayments = useCallback(async (pg = page, status = statusTab) => {
    setLoading(true);
    try {
      const params = {
        page: pg,
        size: 10,
        sortBy: 'id',
        direction: 'DESC',
        ...(status ? { status } : {}),
      };
      const res = await getMyPayments(params);
      setPayments(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusTab]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleTabChange = (tab) => {
    setStatusTab(tab);
    setPage(0);
    fetchPayments(0, tab);
  };

  // Thanh toán VNPay cho lịch hẹn UNPAID
  const handlePayVnPay = async (appointmentId) => {
    setPayingId(appointmentId);
    try {
      const res = await createVnPayLink(appointmentId);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (e) {
      showToast('Lỗi tạo link thanh toán: ' + (e?.message || 'Thử lại sau'));
    } finally {
      setPayingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      UNPAID:    'bg-red-100 text-red-700',
      PAID:      'bg-green-100 text-green-700',
      REFUNDED:  'bg-orange-100 text-orange-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
    };
    return map[status] || 'bg-gray-100 text-gray-500';
  };

  const getStatusLabel = (status) =>
    PAYMENT_STATUS[status]?.label || status;

  // Tổng đã thanh toán
  const totalPaid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch sử thanh toán</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} giao dịch</p>
        </div>
        {totalPaid > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-center">
            <p className="text-xs text-gray-400">Đã thanh toán</p>
            <p className="text-lg font-extrabold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusTab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Dịch vụ / Bác sĩ</th>
              <th className="px-5 py-3 text-right hidden sm:table-cell">Số tiền</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Ngày GD</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                <div className="text-4xl mb-2">💳</div>
                <p className="font-medium">Chưa có giao dịch nào</p>
              </td></tr>
            ) : payments.map((p, i) => (
              <tr key={p.appointmentId || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-800 text-sm">{p.serviceName || 'Phí khám'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.doctorName}</p>
                </td>
                <td className="px-5 py-4 text-right hidden sm:table-cell">
                  <span className="font-bold text-blue-600">
                    {p.amount != null ? formatCurrency(p.amount) : '—'}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400 hidden md:table-cell">
                  {p.transactionDate ? formatDate(p.transactionDate) : '—'}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {p.status === 'UNPAID' && p.appointmentId && (
                    <button
                      disabled={payingId === p.appointmentId}
                      onClick={() => handlePayVnPay(p.appointmentId)}
                      className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5 ml-auto"
                    >
                      {payingId === p.appointmentId ? (
                        <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>...</>
                      ) : '💳 Thanh toán'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 10 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Hiển thị {payments.length} / {total}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchPayments(page - 1); }}
                className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
              <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">{page + 1}</span>
              <button disabled={payments.length < 10} onClick={() => { setPage(p => p + 1); fetchPayments(page + 1); }}
                className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
