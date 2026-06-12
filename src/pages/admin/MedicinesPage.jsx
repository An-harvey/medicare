/**
 * MedicinesPage — Quản lý danh mục thuốc
 * ─────────────────────────────────────────
 * Role: ADMIN
 * API:
 *   GET    /admin/medicines?keyword=&page=&size=  → Page<MedicineResponseDTO>
 *   POST   /admin/medicines                       → Medicine (201)
 *   PUT    /admin/medicines/{id}                  → Medicine  ← BE cần bổ sung
 *   DELETE /admin/medicines/{id}                  → 204       ← BE cần bổ sung
 *
 * MedicineResponseDTO: { id, name, unit, usageInstructions }
 */
import { useState, useCallback } from 'react';
import { adminGetMedicines, adminCreateMedicine, adminUpdateMedicine, adminDeleteMedicine } from '../../api/admin';

const UNITS = ['Viên', 'Gói', 'Ống', 'Chai', 'Tuýp', 'Lọ', 'mg', 'ml'];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [keyword,   setKeyword]   = useState('');
  const [modal,     setModal]     = useState(null); // null | 'add' | { ...medicine }
  const [deleting,  setDeleting]  = useState(null);

  // ── Load danh sách thuốc ──
  const fetchList = useCallback(async (kw = keyword, pg = page) => {
    setLoading(true);
    try {
      const res = await adminGetMedicines({ keyword: kw || undefined, page: pg, size: 10, sortBy: 'name', direction: 'ASC' });
      setMedicines(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { setMedicines([]); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useState(() => { fetchList(); }, []);

  const handleSearch = e => { e.preventDefault(); setPage(0); fetchList(keyword, 0); };

  // ── Xóa thuốc ──
  const handleDelete = async (m) => {
    if (!window.confirm(`Xóa thuốc "${m.name}"?`)) return;
    setDeleting(m.id);
    try {
      await adminDeleteMedicine(m.id);
      fetchList();
    } catch (err) {
      alert(err.message || 'Không thể xóa. BE có thể chưa hỗ trợ endpoint này.');
    } finally { setDeleting(null); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh mục thuốc</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} loại thuốc trong hệ thống</p>
        </div>
        <button onClick={() => setModal('add')}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          + Thêm thuốc
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm tên thuốc..."
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
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : medicines.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{m.id}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{m.name}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{m.unit}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">{m.usageInstructions || '—'}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setModal(m)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 text-xs transition-colors" title="Sửa">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(m)} disabled={deleting === m.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs transition-colors disabled:opacity-50" title="Xóa">
                      {deleting === m.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
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

      {/* Modal thêm/sửa */}
      {modal && (
        <MedicineModal
          medicine={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchList(); }}
        />
      )}
    </div>
  );
}

function MedicineModal({ medicine, onClose, onSaved }) {
  const isEdit = Boolean(medicine?.id);
  const [form,    setForm]    = useState({
    name: medicine?.name || '',
    unit: medicine?.unit || 'Viên',
    usageInstructions: medicine?.usageInstructions || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Tên thuốc không được để trống.'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await adminUpdateMedicine(medicine.id, form);
      } else {
        await adminCreateMedicine(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message || (isEdit ? 'Cập nhật thất bại. BE có thể chưa hỗ trợ.' : 'Thêm thuốc thất bại.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">{isEdit ? 'Sửa thuốc' : 'Thêm thuốc mới'}</h3>
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
              {UNITS.map(u => <option key={u}>{u}</option>)}
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
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm thuốc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
