/**
 * PaymentResultPage — Kết quả thanh toán VNPay (lo_trinh.txt §19)
 * Route: /payment/result
 *
 * Query params từ BE redirect:
 *   ?status=success&paymentId={uuid}   → thành công
 *   ?status=failed&message={msg}       → thất bại/hủy
 *   ?status=invalid&message={msg}      → chữ ký không hợp lệ
 *
 * ⚠️ IPN (cập nhật DB thực sự) có thể đến sau return
 * → FE cần polling check-status để xác nhận DB đã PAID
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkPaymentStatus } from '../api/payment';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status    = searchParams.get('status');     // "success" | "failed" | "invalid"
  const paymentId = searchParams.get('paymentId'); // UUID Payment (chỉ khi success)
  const message   = searchParams.get('message') || '';

  // Trạng thái đã xác nhận từ DB (sau polling)
  const [dbStatus,   setDbStatus]   = useState(null);   // "PAID" | "UNPAID" | ...
  const [polling,    setPolling]    = useState(false);
  const [pollDone,   setPollDone]   = useState(false);

  useEffect(() => {
    // Chỉ polling khi VNPay báo success và có paymentId
    if (status !== 'success' || !paymentId) {
      setPollDone(true);
      return;
    }

    setPolling(true);
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // poll tối đa 10 lần (10 giây)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const result = await checkPaymentStatus(paymentId);
        const dbStatusStr = typeof result === 'string' ? result : String(result);
        if (dbStatusStr === 'PAID') {
          setDbStatus('PAID');
          setPolling(false);
          setPollDone(true);
          clearInterval(interval);
        } else if (attempts >= MAX_ATTEMPTS) {
          setDbStatus(dbStatusStr); // UNPAID — IPN chưa đến
          setPolling(false);
          setPollDone(true);
          clearInterval(interval);
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          setPolling(false);
          setPollDone(true);
          clearInterval(interval);
        }
      }
    }, 1000); // poll mỗi 1 giây

    return () => clearInterval(interval);
  }, [status, paymentId]);

  const isSuccess = status === 'success' && dbStatus === 'PAID';
  const isPending = status === 'success' && (polling || (!pollDone));
  const isFailed  = status === 'failed' || status === 'invalid' || (pollDone && status === 'success' && dbStatus !== 'PAID');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">

        {/* Đang polling */}
        {isPending && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Đang xác nhận thanh toán...</h2>
            <p className="text-sm text-gray-500">Vui lòng chờ hệ thống xác nhận giao dịch</p>
          </>
        )}

        {/* Thành công */}
        {isSuccess && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-sm text-gray-500 mb-6">Lịch hẹn đã được xác nhận. Vui lòng đến đúng giờ.</p>
            <Link to="/dashboard/bookings" className="block bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700">
              📅 Xem lịch hẹn của tôi
            </Link>
          </>
        )}

        {/* Thất bại / chữ ký sai / IPN chưa đến */}
        {isFailed && !isPending && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              {status === 'invalid' ? 'Giao dịch không hợp lệ' : 'Thanh toán thất bại'}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {message
                ? decodeURIComponent(message)
                : dbStatus === 'UNPAID'
                  ? 'Hệ thống chưa nhận được xác nhận thanh toán. Vui lòng kiểm tra lại sau.'
                  : 'Giao dịch không thành công.'}
            </p>
            {dbStatus === 'UNPAID' && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-2 mb-4">
                ⚠️ Nếu tiền đã bị trừ, giao dịch sẽ được hoàn trong 3-5 ngày làm việc.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Link to="/dashboard/bookings" className="bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700">
                📅 Xem lịch hẹn
              </Link>
              <Link to="/doctors" className="border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50">
                ← Quay lại
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
