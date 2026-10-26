import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { toast.error("فشل جلب الفئات"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const url = editingId ? `/api/admin/categories/${editingId}/update` : '/api/admin/categories/new';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        toast.success(editingId ? "تم التعديل" : "تمت الإضافة");
        setName(''); setEditingId(null); fetchCategories();
      } else { toast.error("فشل الحفظ"); }
    } catch { toast.error("خطأ"); }
  };

  const handleEdit = (cat: any) => {
    setName(cat.name);
    setEditingId(cat.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف الفئة؟ (المنتجات المرتبطة لن تُحذف ولكن ستفقد الفئة)')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}/delete`, { method: 'DELETE' });
      if (res.ok) { toast.success("تم الحذف"); fetchCategories(); }
      else { toast.error("فشل الحذف"); }
    } catch { toast.error("خطأ"); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">إدارة الفئات ({categories.length})</h2>

      <form onSubmit={handleSave} className="flex gap-2 mb-6">
        <input 
          placeholder="اسم الفئة (مثل: فساتين)" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="border p-2 rounded flex-1" 
        />
        <button type="submit" className="bg-[#482d39] text-white px-4 py-2 rounded font-bold flex items-center gap-2">
          {editingId ? <Check size={16}/> : <Plus size={16}/>} 
          {editingId ? 'حفظ التعديل' : 'إضافة'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setName(''); setEditingId(null); }} className="bg-gray-300 px-4 py-2 rounded">
            <X size={16}/>
          </button>
        )}
      </form>

      {loading ? <div className="text-center py-10">جاري التحميل...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-3">الفئة</th><th className="p-3">إجراء</th></tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-blue-500 p-1"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-gray-500">لا توجد فئات</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
