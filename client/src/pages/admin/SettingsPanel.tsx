import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPanel() {
  const [form, setForm] = useState({ 
    storeName: 'متجر لمسة', 
    currency: 'ر.ي', // القيمة الافتراضية
    phone: '', 
    email: '', 
    address: '',
    facebook: '',
    instagram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d) setForm(prev => ({ ...prev, ...d }));
      })
      .catch(() => toast.error("فشل جلب الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) toast.success("تم حفظ الإعدادات");
      else toast.error("فشل الحفظ");
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">إعدادات المتجر</h2>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">اسم المتجر</label>
          <input value={form.storeName || ''} onChange={e => setForm({...form, storeName: e.target.value})} className="w-full border p-2 rounded" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رمز العملة (مثال: ر.ي، $، ر.س)</label>
          <input value={form.currency || ''} onChange={e => setForm({...form, currency: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف</label>
          <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-2 rounded" dir="ltr" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
          <input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-2 rounded" dir="ltr" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
          <input value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رابط فيسبوك</label>
          <input value={form.facebook || ''} onChange={e => setForm({...form, facebook: e.target.value})} className="w-full border p-2 rounded" dir="ltr" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رابط إنستغرام</label>
          <input value={form.instagram || ''} onChange={e => setForm({...form, instagram: e.target.value})} className="w-full border p-2 rounded" dir="ltr" />
        </div>
        
        <button type="submit" disabled={saving} className="bg-[#482d39] text-white px-6 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 mt-4">
          <Save size={18} /> {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
