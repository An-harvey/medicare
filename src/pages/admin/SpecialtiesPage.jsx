/**
 * SpecialtiesPage — Quản lý chuyên khoa
 * ───────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET    /api/public/specialties           → Specialty[] [{id,name,description}]
 *   POST   /api/admin/specialties            → SpecialtyResponseDTO (201)
 *     Body : { name, description }
 *   DELETE /api/admin/specialties/{id}       → 204
 *
 * Không có PUT — chỉ tạo và xóa theo lo_trinh.txt mục 5.3
 */
import { useState, useEffect, useCallback } from 'react';
import { getSpecialties }       from '../../api/public';
import { adminCreateSpecialty, adminDeleteSpecialty } from '../../api/admin';

export default function SpecialtiesPage() {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showAdd,   setShowAdd]   = useState(false);
  const [deleting,  setDeleting]  = useState(null); // id đang xóa

  // ── ADMIN: load danh sách chuyên khoa ──
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSpecialties();
      setList(Array.isArray(res) ? res : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── ADMIN: xóa chuyên khoa ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa chuyên khoa "${name}"?`)) return;
    setDeleting(id);
    try {
      await adminDeleteSpecialty(id);
      await fetchList();
    } catch (err) {
      alert(err.message || 'Không thể xóa chuyên khoa này.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý chuyên khoa</h1>
          <p className="text-sm text-gray-400 mt-0.5">{list.length} chuyên khoa trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          + Thêm chuyên khoa
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(s => (
            <div key={s.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-3 hover:shadow-md transition-shadow">
              <div className="min-w-0">
                <p className="font-bold text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{s.description || 'Chưa có mô tả'}</p>
                <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                  ID: {s.id}
                </span>
              </div>
              <button
                disabled={deleting === s.id}
                onClick={() => handleDelete(s.id, s.name)}
                className="shrink-0 p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Xóa chuyên khoa">
                {deleting === s.id ? '...' : '🗑️'}
              </button>
            </div>
          ))}
          {list.length === 0 && !loading && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              Chưa có chuyên khoa nào
            </div>
          )}
        </div>
      )}

      {/* Modal thêm chuyên khoa */}
      {showAdd && <AddSpecialtyModal onClose={() => setShowAdd(false)} onCreated={fetchList} />}
    </div>
  );
}

function AddSpecialtyModal({ onClose, onCreated }) {
  const [form,    setForm]    = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Tên chuyên khoa không được để trống.'); return; }
    setLoading(true);
    try {
      await adminCreateSpecialty(form);
      await onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Tạo chuyên khoa thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Thêm chuyên khoa mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên chuyên khoa *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Tim mạch"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
            <textarea value={form.description} rows={3}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về chuyên khoa..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang tạo...' : 'Tạo chuyên khoa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
