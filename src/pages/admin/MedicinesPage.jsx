/**
 * MedicinesPage — Quản lý danh mục thuốc
 * ─────────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET  /api/admin/medicines?keyword=&page=&size=&sortBy=name&direction=ASC
 *        → Page<MedicineResponseDTO> { content:[{id,name,unit,usageInstructions}] }
 *   POST /api/admin/medicines
 *        Body: { name, unit, usageInstructions }
 *
 * Không có PUT trong controller — chỉ create + search
 */
import { useState, useCallback } from 'react';
import { adminGetMedicines, adminCreateMedicine } from '../../api/admin';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [keyword,   setKeyword]   = useState('');
  const [showAdd,   setShowAdd]   = useState(false);

  // ── ADMIN: load danh sách thuốc ──
  const fetchList = useCallback(async (kw = keyword, pg = page) => {
    setLoading(true);
    try {
      const res = await adminGetMedicines({
        keyword:   kw || undefined,
        page:      pg,
        size:      10,
        sortBy:    'name',
        direction: 'ASC',
      });
      setMedicines(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { setMedicines([]); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useState(() => { fetchList(); }, []);

  const handleSearch = e => {
    e.preventDefault();
    setPage(0);
    fetchList(keyword, 0);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh mục thuốc</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} loại thuốc trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          + Thêm thuốc
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="VD: paracetamol..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>
        <button type="submit" className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl">Tìm</button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Tên thuốc</th>
              <th className="px-5 py-3 text-left">Đơn vị</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Hướng dẫn sử dụng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : medicines.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{m.id}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{m.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{m.unit}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell line-clamp-1">{m.usageInstructions || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {medicines.length} / {total}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => { setPage(p => p-1); fetchList(keyword, page-1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg">{page + 1}</span>
            <button disabled={medicines.length < 10} onClick={() => { setPage(p => p+1); fetchList(keyword, page+1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      </div>

      {showAdd && <AddMedicineModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchList(); }} />}
    </div>
  );
}

function AddMedicineModal({ onClose, onCreated }) {
  const [form,    setForm]    = useState({ name: '', unit: 'Viên', usageInstructions: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Tên thuốc không được để trống.'); return; }
    setLoading(true);
    try {
      // ── ADMIN: POST /api/admin/medicines ──
      await adminCreateMedicine(form);
      onCreated();
    } catch (err) {
      setError(err.message || 'Thêm thuốc thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Thêm thuốc mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên thuốc *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Paracetamol 500mg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Đơn vị</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50">
              {['Viên','Gói','Ống','Chai','Tuýp','Lọ'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hướng dẫn sử dụng</label>
            <textarea value={form.usageInstructions} rows={3}
              onChange={e => setForm(f => ({ ...f, usageInstructions: e.target.value }))}
              placeholder="VD: Uống sau ăn, 1-2 viên/lần, cách nhau 4-6 giờ..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang thêm...' : 'Thêm thuốc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
