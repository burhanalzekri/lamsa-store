import { useState, useEffect } from 'react';
import { Package, Trash2, Plus, Search, Edit, Printer, Download, Percent, X } from "lucide-react";
import { toast } from 'sonner';
import { useSettings } from '../../hooks/useSettings';
import ConfirmModal from '../../components/ConfirmModal';

export default function ProductsPanel() {
  const { currency } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', compareAtPrice: '', costPrice: '', category: 'فساتين', imageUrl: '', images: '', badge: '', material: '', description: '', stock: '10' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [discountModal, setDiscountModal] = useState<{isOpen: boolean, product: any}>({isOpen: false, product: null});
  const [discountForm, setDiscountForm] = useState({percent: '', endsAt: ''});
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, id: string, message: string, onConfirm: () => void}>({isOpen: false, id: '', message: '', onConfirm: () => {}});

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/all-products?t=' + Date.now(), { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } });
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : (data.rows || [])).map((p: any) => ({
        ...p, price: p.priceHalalas || p.price || 0,
        compareAtPrice: p.compareAtHalalas || 0,
        image: p.imageUrl || p.image || '', stock: p.stock || 0
      }));
      setProducts(mapped);
    } catch (e) { toast.error("فشل جلب المنتجات"); }
  };

  useEffect(() => { 
    fetchProducts(); 
    fetch('/api/categories', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const filteredAll = products.filter(p => {
    const matchSearch = p.name?.includes(search);
    if (!matchSearch) return false;
    if (dateFilter !== 'all' && p.createdAt) {
      const created = new Date(p.createdAt);
      const now = new Date();
      if (dateFilter === 'today') return created.toDateString() === now.toDateString();
      if (dateFilter === 'week') { const w = new Date(now.getTime() - 7*24*60*60*1000); return created >= w; }
      if (dateFilter === 'month') return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }
    return true;
  });
  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage) || 1;
  const filtered = filteredAll.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('lamsa_token');
      const isEditing = !!editingId;
      const url = isEditing ? `/api/admin/products/${editingId}/update` : '/api/admin/products/new';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        name: form.name, category: form.category, description: form.description, imageUrl: form.imageUrl,
        images: form.images, price: Number(form.price), compareAtPrice: Number(form.compareAtPrice || 0),
        costPrice: Number(form.costPrice || 0), stock: Number(form.stock || 0), badge: form.badge, material: form.material
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(isEditing ? "تم تعديل المنتج" : "تمت إضافة المنتج");
        setIsAdding(false); setEditingId(null);
        setForm({ name: '', price: '', compareAtPrice: '', costPrice: '', category: 'فساتين', imageUrl: '', images: '', badge: '', material: '', description: '', stock: '10' });
        await fetchProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("فشل الحفظ: " + (err.error || "خطأ"));
      }
    } catch (e) { toast.error("خطأ في الاتصال"); }
  };

  const handleDiscountClick = (product: any) => {
    setDiscountModal({ isOpen: true, product });
    setDiscountForm({ percent: '', endsAt: '' });
  };

  const handleApplyDiscount = async (e: any) => {
    e.preventDefault();
    if (!discountForm.percent) return;
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch(`/api/admin/products/${discountModal.product.id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ discountPercent: Number(discountForm.percent), endsAt: discountForm.endsAt || null })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`تم تطبيق خصم ${data.discountPercent}%`);
        setDiscountModal({ isOpen: false, product: null });
        await fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'فشل تطبيق الخصم');
      }
    } catch { toast.error('خطأ في الاتصال'); }
  };

  const handleRemoveDiscount = async () => {
    if (!discountModal.product) return;
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch(`/api/admin/products/${discountModal.product.id}/discount`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { toast.success('تم إزالة الخصم'); setDiscountModal({ isOpen: false, product: null }); await fetchProducts(); }
      else { toast.error('فشل الإزالة'); }
    } catch { toast.error('خطأ'); }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name, price: String(product.price), compareAtPrice: String(product.compareAtPrice || ''),
      costPrice: String(product.costPrice || ''), category: product.category, imageUrl: product.image || product.imageUrl || '',
      images: product.images || '', badge: product.badge || '', material: product.material || '',
      description: product.description || '', stock: String(product.stock || '0')
    });
    setEditingId(product.id); setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setConfirmState({
      isOpen: true, id,
      message: 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: async () => {
        setProducts(prev => prev.filter(p => p.id !== id));
        try {
          const token = localStorage.getItem('lamsa_token');
          const res = await fetch(`/api/admin/products/${id}/delete`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) { toast.success("تم الحذف"); }
          else { toast.error("فشل الحذف"); fetchProducts(); }
        } catch (e) { toast.error("خطأ"); fetchProducts(); }
      }
    });
  };

  const exportCSV = () => {
    let csv = "الاسم,الفئة,السعر,المخزون\n";
    filteredAll.forEach(p => { csv += `"${p.name}","${p.category}",${p.price},${p.stock}\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "products.csv"; link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#6b174d]">إدارة المنتجات ({products.length})</h2>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setForm({ name: '', price: '', compareAtPrice: '', costPrice: '', category: 'فساتين', imageUrl: '', images: '', badge: '', material: '', description: '', stock: '10' }); }} className="bg-[#6b174d] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={16}/> إضافة منتج
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="اسم المنتج" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="border p-2 rounded" />
          <div className="flex gap-2">
            <input required type="number" placeholder="السعر الحالي" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-2 rounded flex-1" />
            <input type="number" placeholder="سعر قبل الخصم" value={form.compareAtPrice} onChange={e=>setForm({...form, compareAtPrice: e.target.value})} className="border p-2 rounded flex-1" />
          </div>
          <input placeholder="التكلفة" type="number" value={form.costPrice} onChange={e=>setForm({...form, costPrice: e.target.value})} className="border p-2 rounded" />
          <input placeholder="المخزون" type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="border p-2 rounded" />
          <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="border p-2 rounded">
            {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={form.badge} onChange={e=>setForm({...form, badge: e.target.value})} className="border p-2 rounded">
            <option value="">بدون شارة</option><option value="جديد">جديد</option><option value="الأكثر مبيعاً">الأكثر مبيعاً</option><option value="خصم خاص">خصم خاص</option><option value="مميز">مميز</option>
          </select>
          <input placeholder="نوع القماش (اختياري)" value={form.material} onChange={e=>setForm({...form, material: e.target.value})} className="border p-2 rounded" />
          <div className="flex flex-col gap-2 col-span-full">
            <input placeholder="رابط الصورة الرئيسية" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl: e.target.value})} className="border p-2 rounded" dir="ltr" />
            <input placeholder="روابط صور إضافية (مفصولة بفاصلة ,)" value={form.images} onChange={e=>setForm({...form, images: e.target.value})} className="border p-2 rounded" dir="ltr" />
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" id="product-image-upload" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const formData = new FormData(); formData.append("image", file);
                try {
                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                  if (!res.ok) throw new Error("فشل رفع الصورة");
                  const data = await res.json();
                  if (!form.imageUrl) setForm({...form, imageUrl: data.url});
                  else {
                    const current = form.images ? form.images.split(",").map((s: string) => s.trim()) : [];
                    current.push(data.url);
                    setForm({...form, images: current.join(", ")});
                  }
                  toast.success("تم رفع الصورة بنجاح");
                } catch (err) { toast.error("فشل رفع الصورة"); }
              }} />
              <label htmlFor="product-image-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex-1 text-center font-bold">📸 رفع صورة</label>
              {form.imageUrl && <img src={form.imageUrl} alt="معاينة" className="w-12 h-12 object-cover rounded border" />}
            </div>
          </div>
          <textarea placeholder="الوصف" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="border p-2 rounded col-span-full" rows={3} />
          <div className="col-span-full flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded font-bold">{editingId ? "حفظ التعديلات" : "حفظ"}</button>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 bg-gray-300 rounded">إلغاء</button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-full md:w-1/2">
        <input placeholder="ابحث..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="flex-1 border p-2 rounded" />
        <select value={dateFilter} onChange={e=>{setDateFilter(e.target.value); setPage(1);}} className="border p-2 rounded text-sm">
          <option value="all">كل الإضافات</option>
          <option value="today">اليوم</option>
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
        </select>
      </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Printer size={14}/> طباعة</button>
          <button onClick={exportCSV} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Download size={14}/> Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto border rounded-lg">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
            <tr><th className="p-2">المنتج</th><th className="p-2">السعر</th><th className="p-2">الشارة</th><th className="p-2">المخزون</th><th className="p-2">إجراء</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 flex items-center gap-2">
                  {p.image ? <img src={p.image} className="w-8 h-10 object-cover rounded"/> : <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center"><Package size={16}/></div>}
                  {p.name}
                </td>
                <td className="p-2 font-bold">{p.price} {currency}
                  {p.compareAtPrice > 0 && <span className="text-xs text-gray-400 line-through block">{p.compareAtPrice} {currency}</span>}
                </td>
                <td className="p-2">{p.badge && <span className="bg-[#C9A84C] text-white px-2 py-1 rounded text-xs font-bold">{p.badge}</span>}</td>
                <td className="p-2"><span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span></td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-500 p-1" title="تعديل"><Edit size={16}/></button>
                  <button onClick={() => handleDiscountClick(p)} className="text-[#C9A84C] p-1" title="خصم"><Percent size={16}/></button>
                  <button onClick={() => handleDeleteClick(p.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">لا توجد منتجات</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">عرض {filtered.length} من {filteredAll.length} منتج</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">السابق</button>
          <span className="px-3 py-1 bg-[#6b174d] text-white rounded text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">التالي</button>
        </div>
      </div>

      {/* نافذة التأكيد المخصصة */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}); }}
        onCancel={() => setConfirmState({...confirmState, isOpen: false})}
      />
    
      {discountModal.isOpen && discountModal.product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2a1a21]">تطبيق خصم</h3>
              <button onClick={() => setDiscountModal({ isOpen: false, product: null })} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="bg-[#fcf9f2] p-3 rounded-lg mb-4 flex items-center gap-3">
              <img src={discountModal.product.image} className="w-12 h-14 object-cover rounded" />
              <div>
                <p className="font-bold text-sm">{discountModal.product.name}</p>
                <p className="text-[#C9A84C] font-bold">{discountModal.product.price} {currency}</p>
              </div>
            </div>
            <form onSubmit={handleApplyDiscount} className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نسبة الخصم (%)</label>
                <input type="number" min="1" max="99" required value={discountForm.percent} onChange={e => setDiscountForm({...discountForm, percent: e.target.value})} placeholder="مثال: 20" className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الانتهاء (اختياري)</label>
                <input type="datetime-local" value={discountForm.endsAt} onChange={e => setDiscountForm({...discountForm, endsAt: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-[#C9A84C] text-white py-2 rounded-lg font-bold">تطبيق</button>
                <button type="button" onClick={handleRemoveDiscount} className="px-4 bg-red-100 text-red-600 rounded-lg font-bold">إزالة</button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
}
