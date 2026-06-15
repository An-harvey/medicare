/**
 * StatusBadge — Badge trạng thái lịch hẹn
 * BE enum: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 */
export default function StatusBadge({ status }) {
  const map = {
    PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700' },
    CHECK_IN:    { label: 'Đã check-in',  cls: 'bg-cyan-100 text-cyan-700' },
    IN_PROGRESS: { label: 'Đang khám',    cls: 'bg-green-100 text-green-700' },
    COMPLETED:   { label: 'Hoàn tất',     cls: 'bg-gray-100 text-gray-600' },
    CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || { label: status || '—', cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}
