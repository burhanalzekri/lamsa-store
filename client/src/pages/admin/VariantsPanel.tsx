import { useState, useEffect } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function VariantsPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [variants, setVariants] = useState<any[]>([]);
  const [form, setForm] = useState({ color: 'أحمر', size: 'S', price: '', stock: '' });
  const [loading, setLoading] = useState(true);

  // جلب المنتجات
  useEffect(() => {
    const token = localStorage.getItem('lamsa_token');
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('فشل الجلب');
        return r.json();
      })
      .then(d => {
        setProducts(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('فشل جلب المنتجات، تأكد من تسجيل الدخول');
        setLoading(false);
      });
  }, []);

  // جلب متغيرات المنتج المختار
  const fetchVariants = async (productId: string) => {
    if (!productId) return;
    const res = await fetch(`/api/products/${productId}/variants`);
    const data = await res.json();
    setVariants(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchVariants(selectedProduct);
  }, [selectedProduct]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('اختر منتجاً أولاً');
    const token = localStorage.getItem('lamsa_token');
    const res = await fetch(`/api/admin/products/${selectedProduct}/variants`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        color: form.color, size: form.size, 
        price: Number(form.price), stock: Number(form.stock) 
      })
    });
    if (res.ok) {
      toast.success('تم إضافة المتغير');
      setForm({ color: 'أحمر', size: 'S', price: '', stock: '' });
      fetchVariants(selectedProduct);
    } else {
      toast.error('فشل الإضافة');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('lamsa_token');
    const res = await fetch(`/api/admin/variants/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('تم الحذف');
      fetchVariants(selectedProduct);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#482d39]"><Layers size={22}/> إدارة المتغيرات</h2>
      
      {loading ? (
        <p className="text-center text-gray-500 py-4">جاري تحميل المنتجات...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-red-500 py-4">لا توجد منتجات. أضف منتجاً أولاً من تبويب المنتجات.</p>
      ) : (
        <>
          <select 
            value={selectedProduct} 
            onChange={e => setSelectedProduct(e.target.value)} 
            className="w-full border p-3 rounded-lg mb-4 bg-gray-50 font-bold"
          >
            <option value="">-- اختر منتجاً --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {selectedProduct && (
            <>
              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-gray-50 p-3 rounded-lg">
                <select value={form.color} onChange={e=>setForm({...form, color: e.target.value})} className="border p-2 rounded-lg text-sm bg-white">
                  <option value="أحمر">أحمر</option><option value="أسود">أسود</option><option value="أبيض">أبيض</option>
                  <option value="أزرق">أزرق</option><option value="أخضر">أخضر</option><option value="بيج">بيج</option>
                  <option value="رمادي">رمادي</option><option value="وردي">وردي</option>
                </select>
                <select value={form.size} onChange={e=>setForm({...form, size: e.target.value})} className="border p-2 rounded-lg text-sm bg-white">
                  <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                <input required type="number" placeholder="السعر" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-2 rounded-lg text-sm" />
                <input required type="number" placeholder="المخزون" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="border p-2 rounded-lg text-sm" />
                <button type="submit" className="bg-[#482d39] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1 hover:bg-[#654151]"><Plus size={16}/> إضافة</button>
              </form>

              <div className="space-y-2">
                {variants.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm py-2">لا توجد متغيرات لهذا المنتج.</p>
                ) : variants.map(v => (
                  <div key={v.id} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 text-sm">
                    <span className="font-bold text-[#482d39]">{v.color} - {v.size}</span>
                    <span className="font-bold">{v.price} ر.ي</span>
                    <span className="text-xs text-gray-500">مخزون: {v.stock}</span>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
