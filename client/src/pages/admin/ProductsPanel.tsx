import { useState, useEffect } from 'react';
import { Package, Trash2, Plus, Search, Edit } from "lucide-react";
import { toast } from 'sonner';

export default function ProductsPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', costPrice: '', category: 'فساتين', image: '', description: '', stock: '10' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?t=' + Date.now());
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { toast.error("فشل جلب المنتجات"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('lamsa_token');
      // نستخدم مسار إضافة منتج (يفترض وجوده في الخادم)
      const res = await fetch('/api/products', { 
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ ...form, price: Number(form.price), costPrice: Number(form.costPrice), stock: Number(form.stock) }) 
      });
      if (res.ok) {
        toast.success("تمت إضافة المنتج");
        setIsAdding(false); fetchProducts();
      } else { toast.error("فشل الحفظ"); }
    } catch (e) { toast.error("خطأ في الاتصال"); }
  };

  
  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      price: String(product.price),
      costPrice: String(product.costPrice || ''),
      category: product.category,
      image: product.image || '',
      description: product.description || '',
      stock: String(product.stock || '0')
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const handleDelete = async (id: string) => {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success("تم الحذف"); fetchProducts(); }
      else { toast.error("فشل الحذف"); }
    } catch (e) { toast.error("خطأ"); }
  };

  const filtered = products.filter(p => p.name?.includes(search));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#482d39]">إدارة المنتجات ({products.length})</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-[#482d39] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={16}/> إضافة منتج
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="اسم المنتج" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="border p-2 rounded" />
          <input required type="number" placeholder="السعر" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-2 rounded" />
          <input placeholder="التكلفة" type="number" value={form.costPrice} onChange={e=>setForm({...form, costPrice: e.target.value})} className="border p-2 rounded" />
          <input placeholder="المخزون" type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="border p-2 rounded" />
          <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="border p-2 rounded">
            <option value="فساتين">فساتين</option><option value="عبايات">عبايات</option><option value="حقائب">حقائب</option><option value="أحذية">أحذية</option>
          </select>
          <div className="flex flex-col gap-2 col-span-full">
  <input placeholder="رابط الصورة" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} className="border p-2 rounded" dir="ltr" />
  <div className="flex gap-2 items-center">
    <input
      type="file"
      accept="image/*"
      id="product-image-upload"
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) throw new Error("فشل رفع الصورة");
          const data = await res.json();
          setForm({...form, image: data.url});
          alert("✅ تم رفع الصورة بنجاح");
        } catch (err) {
          alert("❌ حدث خطأ أثناء رفع الصورة");
          console.error(err);
        }
      }}
    />
    <label htmlFor="product-image-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex-1 text-center font-bold">
      📸 رفع صورة من الجهاز
    </label>
    {form.image && (
      <img src={form.image} alt="معاينة" className="w-12 h-12 object-cover rounded border" />
    )}
  </div>
</div>
          <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold col-span-full">حفظ</button>
        </form>
      )}

      <input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full border p-2 rounded mb-4" />

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="p-2">المنتج</th><th className="p-2">السعر</th><th className="p-2">المخزون</th><th className="p-2">الفئة</th><th className="p-2">إجراء</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-2 flex items-center gap-2"><img src={p.image} className="w-8 h-10 object-cover rounded"/>{p.name}</td>
                <td className="p-2">{p.price} ر.ي</td>
                <td className="p-2">{p.stock || 0}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-500 p-1"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
