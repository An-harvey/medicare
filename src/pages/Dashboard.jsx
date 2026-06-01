import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

/* Role home dashboards */
import UserDashboard   from './dashboard/UserDashboard';
import DoctorDashboard from './dashboard/DoctorDashboard';
import AdminDashboard  from './dashboard/AdminDashboard';
import StaffDashboard  from './dashboard/StaffDashboard';

/* Shared */
import ProfilePage     from './dashboard/shared/ProfilePage';
import SettingsPage    from './dashboard/shared/SettingsPage';

/* User */
import MyBookings      from './dashboard/user/MyBookings';
import HealthRecords   from './dashboard/user/HealthRecords';

/* Doctor */
import DoctorSchedulePage from './dashboard/doctor/SchedulePage';
import PatientsPage       from './dashboard/doctor/PatientsPage';
import PrescriptionPage   from './dashboard/doctor/PrescriptionPage';

/* Admin */
import UsersPage       from './dashboard/admin/UsersPage';
import DoctorsPage     from './dashboard/admin/DoctorsPage';
import RevenuePage     from './dashboard/admin/RevenuePage';
import SchedulePage    from './dashboard/admin/SchedulePage';
import ReportsPage     from './dashboard/admin/ReportsPage';

/* Staff */
import CheckInPage     from './dashboard/staff/CheckInPage';

const Soon = ({ title }) => (
  <div className="p-8 text-center text-gray-400">
    <div className="text-5xl mb-4">🚧</div>
    <p className="font-bold text-gray-600 text-lg">{title}</p>
    <p className="text-sm mt-1">Tính năng đang được phát triển</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();

  const homeEl = {
    user:   <UserDashboard />,
    doctor: <DoctorDashboard />,
    admin:  <AdminDashboard />,
    staff:  <StaffDashboard />,
  }[user.role] || <UserDashboard />;

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={homeEl} />

        {/* ── User ── */}
        <Route path="bookings" element={<MyBookings />} />
        <Route path="records"  element={<HealthRecords />} />

        {/* ── Doctor ── */}
        <Route path="schedule"     element={user.role === 'admin' ? <SchedulePage /> : <DoctorSchedulePage />} />
        <Route path="patients"     element={<PatientsPage />} />
        <Route path="prescription" element={<PrescriptionPage />} />

        {/* ── Admin ── */}
        <Route path="users"    element={<UsersPage />} />
        <Route path="doctors"  element={<DoctorsPage />} />
        <Route path="revenue"  element={<RevenuePage />} />
        <Route path="reports"  element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* ── Staff ── */}
        <Route path="checkin"  element={<CheckInPage />} />
        <Route path="queue"    element={<CheckInPage />} />

        {/* ── Shared ── */}
        <Route path="profile"   element={<ProfilePage />} />
        <Route path="my-settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
