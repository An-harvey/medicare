/**
 * StatusBadge — Badge hiển thị trạng thái
 * Dùng chung cho AppointmentStatus, ScheduleStatus
 */
import { STATUS_BADGE, STATUS_DOT, SCHEDULE_STATUS } from '../../utils/constants';

export default function StatusBadge({ status, type = 'appointment' }) {
  if (type === 'schedule') {
    const s = SCHEDULE_STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
  }
  const cls = STATUS_BADGE[status] || 'bg-gray-100 text-gray-500';
  const dot = STATUS_DOT[status] || 'bg-gray-400';
  const labels = {
    PENDING:     'Chờ xác nhận',
    ARRIVED:     'Đã đến',
    IN_PROGRESS: 'Đang khám',
    COMPLETED:   'Hoàn tất',
    CANCELLED:   'Đã hủy',
    NO_SHOW:     'Vắng mặt',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {labels[status] || status}
    </span>
  );
}
