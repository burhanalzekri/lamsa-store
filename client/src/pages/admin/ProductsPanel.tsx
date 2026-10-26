import { useState, useEffect } from 'react';
import { Package, Trash2, Plus, Search, Edit, Printer, Download } from "lucide-react";
import { toast } from 'sonner';
import { useSettings } from '../../hooks/useSettings';

export default function ProductsPanel() {
  const { currency } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ 
    name: '', price: '', compareAtPrice: '', costPrice: '', category: 'فساتين', 
    imageUrl: '', images: '', badge: '', material: '', description: '', stock: '10' 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/all-products?t=' + Date.now(), { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } });
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : (data.rows || [])).map((p: any) => ({
        ...p,
        price: p.priceHalalas ? p.priceHalalas / 100 : (p.price || 0),
        compareAtPrice: p.compareAtHalalas ? p.compareAtHalalas / 100 : 0,
        image: p.imageUrl || p.image || '',
        stock: p.stock || 0
      }));
      setProducts(mapped);
    } catch (e) { toast.error("فشل جلب المنتجات"); }
  };

  useEffect(() => { 
    fetchProducts(); 
    fetch('/api/categories', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const filteredAll = products.filter(p => p.name?.includes(search));
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
        name: form.name, category: form.category, description: form.description,
        imageUrl: form.imageUrl, images: form.images, price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice || 0), costPrice: Number(form.costPrice || 0),
        stock: Number(form.stock || 0), badge: form.badge, material: form.material
      };
      const res = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
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

  const handleDelete = async (id: string) => {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}/delete`, { method: 'DELETE' });
      if (res.ok) { toast.success("تم الحذف"); }
      else { toast.error("فشل الحذف"); fetchProducts(); }
    } catch (e) { toast.error("خطأ"); fetchProducts(); }
  };

  const exportCSV = () => {
    let csv = "الاسم,الفئة,السعر,المخزون\n";
    filteredAll.forEach(p => { csv += `"${p.name}","${p.category}",${p.price},${p.stock}\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "products.csv"; link.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#482d39]">إدارة المنتجات ({products.length})</h2>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setForm({ name: '', price: '', compareAtPrice: '', costPrice: '', category: 'فساتين', imageUrl: '', images: '', badge: '', material: '', description: '', stock: '10' }); }} className="bg-[#482d39] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
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
            <option value="">بدون شارة</option>
            <option value="جديد">جديد</option>
            <option value="الأكثر مبيعاً">الأكثر مبيعاً</option>
            <option value="خصم خاص">خصم خاص</option>
            <option value="مميز">مميز</option>
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
        <input placeholder="ابحث..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="w-full md:w-1/3 border p-2 rounded" />
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Printer size={14}/> طباعة</button>
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
                  <button onClick={() => handleEdit(p)} className="text-blue-500 p-1"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">لا توجد منتجات</td></tr>}
          </tbody>
        </table>
      </div>

      {/* الترقيم */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">عرض {filtered.length} من {filteredAll.length} منتج</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">السابق</button>
          <span className="px-3 py-1 bg-[#482d39] text-white rounded text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">التالي</button>
        </div>
      </div>
    </div>
  );
}
