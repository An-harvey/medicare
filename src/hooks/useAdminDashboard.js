import { useState, useEffect } from 'react';
import {
  adminGetDashboardKpi,
  adminGetDashboardRevenue,
  adminGetDashboardTopDoctors,
  adminGetDashboardSpecialtyStats,
  adminGetDashboardAlerts,
  adminGetDashboardActivities,
} from '../api/admin';

export function useAdminDashboard(year = new Date().getFullYear()) {
  const [kpi, setKpi] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [specialtyStats, setSpecialtyStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      adminGetDashboardKpi(),
      adminGetDashboardRevenue(year),
      adminGetDashboardTopDoctors(),
      adminGetDashboardSpecialtyStats(),
      adminGetDashboardAlerts(),
      adminGetDashboardActivities(),
    ])
      .then(([kpiR, revR, topR, specR, alertR, actR]) => {
        if (cancelled) return;
        if (kpiR.status === 'fulfilled') setKpi(kpiR.value);
        if (revR.status === 'fulfilled') setRevenue(revR.value);
        if (topR.status === 'fulfilled') setTopDoctors(Array.isArray(topR.value) ? topR.value : []);
        if (specR.status === 'fulfilled') setSpecialtyStats(Array.isArray(specR.value) ? specR.value : []);
        if (alertR.status === 'fulfilled') setAlerts(Array.isArray(alertR.value) ? alertR.value : []);
        if (actR.status === 'fulfilled') setActivities(Array.isArray(actR.value) ? actR.value : []);

        const allFailed = [kpiR, revR, topR, specR, alertR, actR].every(r => r.status === 'rejected');
        if (allFailed) setError('Không thể tải dữ liệu dashboard. Kiểm tra backend đang chạy.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [year]);

  return { kpi, revenue, topDoctors, specialtyStats, alerts, activities, loading, error };
}
