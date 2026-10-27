import { useState, useEffect } from 'react';
import { Percent, Trash2, Plus, Search, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscountsPanel() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ productId: '', percent: '', endsAt: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('lamsa_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [dRes, pRes] = await Promise.all([
        fetch('/api/admin/discounts', { headers }).then(r => r.json()),
        fetch('/api/admin/all-products', { headers }).then(r => r.json())
      ]);
      setDiscounts(Array.isArray(dRes) ? dRes : []);
      setProducts(Array.isArray(pRes) ? pRes : []);
    } catch { toast.error('فشل جلب البيانات'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async (e: any) => {
    e.preventDefault();
    if (!form.productId || !form.percent) return toast.error('اختر المنتج وأدخل النسبة');
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch(`/api/admin/products/${form.productId}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ discountPercent: Number(form.percent), endsAt: form.endsAt || null })
      });
      if (res.ok) {
        toast.success('تم تطبيق الخصم');
        setForm({ productId: '', percent: '', endsAt: '' });
        setShowAdd(false);
        fetchData();
      } else { toast.error('فشل التطبيق'); }
    } catch { toast.error('خطأ'); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('هل أنت متأكد من إزالة الخصم؟')) return;
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch(`/api/admin/products/${id}/discount`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { toast.success('تم إزالة الخصم'); fetchData(); }
      else { toast.error('فشل الإزالة'); }
    } catch { toast.error('خطأ'); }
  };

  const filtered = discounts.filter(d => d.name?.includes(search));

  const isExpired = (date: string) => date && new Date(date) < new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#482d39]">إدارة الخصومات ({discounts.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-[#C9A84C] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#b8952f]">
          <Plus size={16}/> إضافة خصم
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleApply} className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">المنتج</label>
            <select value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} className="w-full border p-2 rounded-lg">
              <option value="">-- اختر منتجاً --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.priceHalalas} ر.ي</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">نسبة الخصم (%)</label>
            <input type="number" min="1" max="99" value={form.percent} onChange={e => setForm({...form, percent: e.target.value})} placeholder="20" className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ الانتهاء</label>
            <input type="datetime-local" value={form.endsAt} onChange={e => setForm({...form, endsAt: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded-lg font-bold">تطبيق الخصم</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 bg-gray-300 rounded-lg">إلغاء</button>
          </div>
        </form>
      )}

      <input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-64 border p-2 rounded mb-4" />

      {loading ? <div className="text-center py-10">جاري التحميل...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">السعر الأصلي</th>
                <th className="p-3">السعر بعد الخصم</th>
                <th className="p-3">نسبة الخصم</th>
                <th className="p-3">تاريخ الانتهاء</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const original = d.compareAtHalalas || 0;
                const current = d.priceHalalas || 0;
                const percent = Math.round(((original - current) / original) * 100);
                const expired = isExpired(d.discountEndsAt);
                return (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={d.imageUrl} className="w-10 h-12 object-cover rounded" />
                      <span className="font-bold">{d.name}</span>
                    </td>
                    <td className="p-3 text-gray-400 line-through">{original.toLocaleString()} ر.ي</td>
                    <td className="p-3 font-bold text-[#d93844]">{current.toLocaleString()} ر.ي</td>
                    <td className="p-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">-{percent}%</span></td>
                    <td className="p-3 text-xs text-gray-600">
                      {d.discountEndsAt ? new Date(d.discountEndsAt).toLocaleDateString('ar-EG') : 'دائم'}
                    </td>
                    <td className="p-3">
                      {expired ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1"><AlertTriangle size={12}/> منتهي</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">نشط</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleRemove(d.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="إزالة الخصم"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-500">لا توجد خصومات نشطة</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
