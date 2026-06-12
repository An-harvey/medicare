/**
 * DiseasesPage — Quản lý danh mục bệnh lý (ICD)
 * ─────────────────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET  /api/admin/diseases?keyword=&page=&size=&sortBy=code&direction=ASC
 *        → Page<DiseaseResponseDTO> { content:[{id,code,name,description}], totalElements, totalPages }
 *   POST /api/admin/diseases     → Disease (201)
 *        Body: { code, name, description }
 *   PUT  /api/admin/diseases/{id} → Disease
 *        Body: { code, name, description }
 */
import { useState, useCallback, useEffect } from 'react';
import { adminGetDiseases, adminCreateDisease, adminUpdateDisease } from '../../api/admin';

// BE chưa có DELETE — thêm khi BE hỗ trợ
// import { adminDeleteDisease } from '../../api/admin';

export default function DiseasesPage() {
  const [diseases,  setDiseases]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [keyword,   setKeyword]   = useState('');
  const [modal,     setModal]     = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const fetchList = useCallback(async (kw = keyword, pg = page) => {
    setLoading(true);
    try {
      const res = await adminGetDiseases({ keyword: kw || undefined, page: pg, size: 10, sortBy: 'code', direction: 'ASC' });
      setDiseases(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { setDiseases([]); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = e => { e.preventDefault(); setPage(0); fetchList(keyword, 0); };

  const handleDelete = async (d) => {
    if (!window.confirm(`Xóa bệnh lý "${d.name}"?`)) return;
    setDeleting(d.id);
    try {
      // await adminDeleteDisease(d.id); // Khi BE bổ sung
      alert('BE chưa hỗ trợ DELETE /admin/diseases/{id}. Vui lòng liên hệ backend team.');
    } finally { setDeleting(null); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh mục bệnh lý (ICD)</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} bệnh lý trong hệ thống</p>
        </div>
        <button onClick={() => setModal('add')}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          + Thêm bệnh lý
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm theo tên hoặc mã ICD..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>
        <button type="submit" className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          Tìm
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Mã ICD</th>
              <th className="px-5 py-3 text-left">Tên bệnh lý</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Mô tả</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : diseases.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : diseases.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-600">{d.code}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{d.name}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell line-clamp-1">{d.description || '—'}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setModal(d)}
                      className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-semibold">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => handleDelete(d)} disabled={deleting === d.id}
                      className="text-xs text-red-500 border border-red-200 px-2 py-1.5 rounded-lg hover:bg-red-50 font-semibold disabled:opacity-50">
                      {deleting === d.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {diseases.length} / {total}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchList(keyword, page - 1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg">{page + 1}</span>
            <button disabled={diseases.length < 10} onClick={() => { setPage(p => p + 1); fetchList(keyword, page + 1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <DiseaseModal
          disease={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchList(); }}
        />
      )}
    </div>
  );
}

function DiseaseModal({ disease, onClose, onSaved }) {
  const isEdit = Boolean(disease?.id);
  const [form,    setForm]    = useState({ code: disease?.code || '', name: disease?.name || '', description: disease?.description || '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Tên bệnh lý không được để trống.'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        // ── ADMIN: PUT /api/admin/diseases/{id} ──
        await adminUpdateDisease(disease.id, form);
      } else {
        // ── ADMIN: POST /api/admin/diseases ──
        await adminCreateDisease(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">{isEdit ? 'Cập nhật bệnh lý' : 'Thêm bệnh lý mới'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã ICD</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="VD: E11"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên bệnh lý *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Đái tháo đường type 2"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
            <textarea value={form.description} rows={3}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về bệnh lý..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
