import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, X, Search, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ConfirmModal';

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [form, setForm] = useState({ code: '', discountPercent: '', active: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
  const itemsPerPage = 50;

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` };
      const [cRes, hRes] = await Promise.all([
        fetch('/api/admin/coupons', { headers }).then(r => r.json()),
        fetch('/api/admin/coupons/history', { headers }).then(r => r.json())
      ]);
      setCoupons(Array.isArray(cRes) ? cRes : []);
      setHistory(Array.isArray(hRes) ? hRes : []);
    } catch { toast.error("فشل جلب البيانات"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!form.code || !form.discountPercent) return toast.error("الكود ونسبة الخصم مطلوبان");
    try {
      const token = localStorage.getItem('lamsa_token');
      const url = editingId ? `/api/admin/coupons/${editingId}/update` : '/api/admin/coupons/new';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...form, discountPercent: Number(form.discountPercent) }) });
      if (res.ok) {
        toast.success(editingId ? "تم التعديل" : "تمت الإضافة");
        setForm({ code: '', discountPercent: '', active: true }); setEditingId(null); fetchData();
      } else { toast.error("فشل الحفظ"); }
    } catch { toast.error("خطأ"); }
  };

  const handleEdit = (c: any) => { setForm({ code: c.code, discountPercent: String(c.discountPercent), active: c.active === 1 }); setEditingId(c.id); };

  const handleDeleteClick = (id: number) => {
    setConfirmState({
      isOpen: true, message: 'هل أنت متأكد من حذف هذا الكوبون؟',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('lamsa_token');
          const res = await fetch(`/api/admin/coupons/${id}/delete`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) { toast.success("تم الحذف"); fetchData(); } else { toast.error("فشل الحذف"); }
        } catch { toast.error("خطأ"); }
      }
    });
  };

  const filteredAll = tab === 'active' 
    ? coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()))
    : history.filter(h => h.customerName?.includes(search) || h.id?.includes(search));
  
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage) || 1;
  const filtered = filteredAll.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    let csv = tab === 'active' ? "الكود,نسبة الخصم,الحالة\n" : "رقم الطلب,العميل,الإجمالي,التاريخ\n";
    filteredAll.forEach((item: any) => {
      if (tab === 'active') csv += `"${item.code}",${item.discountPercent},"${item.active ? 'نشط' : 'معطل'}"\n`;
      else csv += `"${item.orderNumber || item.id}","${item.customerName}",${item.totalAmount},"${new Date(item.createdAt).toLocaleDateString('ar')}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `coupons-${tab}.csv`; link.click();
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#482d39]">إدارة الكوبونات</h2>
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
          <button onClick={() => { setTab('active'); setPage(1); }} className={`px-4 py-1.5 rounded-md text-sm font-bold ${tab === 'active' ? 'bg-white shadow text-[#482d39]' : 'text-gray-500'}`}>الكوبونات ({coupons.length})</button>
          <button onClick={() => { setTab('history'); setPage(1); }} className={`px-4 py-1.5 rounded-md text-sm font-bold ${tab === 'history' ? 'bg-white shadow text-[#482d39]' : 'text-gray-500'}`}>السجل ({history.length})</button>
        </div>
      </div>

      {tab === 'active' && (
        <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div><label className="block text-sm font-bold text-gray-700 mb-1">كود الخصم</label><input required placeholder="SALE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full border p-2 rounded" dir="ltr" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">نسبة الخصم (%)</label><input required type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: e.target.value})} className="w-full border p-2 rounded" /></div>
          <div className="flex items-center gap-2 pb-2"><input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="w-4 h-4 accent-[#482d39]" /><label htmlFor="active" className="text-sm font-bold text-gray-700">نشط</label></div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#482d39] text-white px-4 py-2 rounded font-bold flex items-center justify-center gap-2 flex-1">{editingId ? <Check size={16}/> : <Plus size={16}/>} {editingId ? 'حفظ' : 'إضافة'}</button>
            {editingId && <button type="button" onClick={() => { setForm({ code: '', discountPercent: '', active: true }); setEditingId(null); }} className="bg-gray-300 px-3 rounded"><X size={16}/></button>}
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute right-3 top-2.5 text-gray-400"/>
          <input placeholder="ابحث..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="border p-2 pr-9 rounded w-full text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Printer size={14}/> طباعة</button>
          <button onClick={exportCSV} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Download size={14}/> Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto border rounded-lg">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
            {tab === 'active' ? (
              <tr><th className="p-3">الكود</th><th className="p-3">الخصم</th><th className="p-3">الحالة</th><th className="p-3">إجراء</th></tr>
            ) : (
              <tr><th className="p-3">رقم الطلب</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">التاريخ</th></tr>
            )}
          </thead>
          <tbody>
            {tab === 'active' ? filtered.map((c: any) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-[#482d39]">{c.code}</td>
                <td className="p-3 text-green-600 font-bold">{c.discountPercent}%</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.active ? 'نشط' : 'معطل'}</span></td>
                <td className="p-3 flex gap-2"><button onClick={() => handleEdit(c)} className="text-blue-500 p-1"><Edit size={16}/></button><button onClick={() => handleDeleteClick(c.id)} className="text-red-500 p-1"><Trash2 size={16}/></button></td>
              </tr>
            )) : filtered.map((h: any) => (
              <tr key={h.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{h.orderNumber || h.id.slice(0,8)}</td>
                <td className="p-3">{h.customerName}</td>
                <td className="p-3 font-bold">{Number(h.totalAmount).toLocaleString()} ر.ي</td>
                <td className="p-3 text-xs text-gray-500">{new Date(h.createdAt).toLocaleDateString('ar')}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">لا توجد بيانات</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">عرض {filtered.length} من {filteredAll.length}</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">السابق</button>
          <span className="px-3 py-1 bg-[#482d39] text-white rounded text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">التالي</button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}); }}
        onCancel={() => setConfirmState({...confirmState, isOpen: false})}
      />
    </div>
  );
}
