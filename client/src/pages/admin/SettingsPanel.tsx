import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Phone, Mail, MapPin, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPanel() {
  const [form, setForm] = useState({
    storeName: '', logoUrl: '', phone: '', email: '', address: '', facebook: '', instagram: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setForm({
          storeName: data.storeName || '', logoUrl: data.logoUrl || '',
          phone: data.phone || '', email: data.email || '',
          address: data.address || '', facebook: data.facebook || '', instagram: data.instagram || ''
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("تم حفظ الإعدادات بنجاح!");
        // إعادة تحميل الصفحة لتحديث الاسم في الشريط
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("فشل الحفظ");
      }
    } catch (e) { toast.error("حدث خطأ"); }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl">
      <h2 className="text-2xl font-bold text-[#482d39] mb-6 border-b pb-4 flex items-center gap-2"><Store size={24}/> إعدادات المتجر</h2>
      
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">اسم المتجر</label>
          <input value={form.storeName} onChange={e=>setForm({...form, storeName: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1"><ImageIcon size={16} className="inline mr-1"/> رابط الشعار (Logo URL)</label>
          <div className="flex gap-2 mt-1">
                <input value={form.logoUrl} onChange={e=>setForm({...form, logoUrl: e.target.value})} className="flex-grow border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
                <label className="bg-[#482d39] text-white px-4 py-2 rounded cursor-pointer text-sm font-bold flex items-center">
                  📷 رفع
                  <input 
                    type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("image", file);
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.url) setForm({...form, logoUrl: data.url});
                      } catch (err) { alert('فشل الرفع'); }
                    }}
                  />
                </label>
              </div>
          {form.logoUrl && <img src={form.logoUrl} alt="Logo Preview" className="h-12 mt-2 rounded border" />}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1"><Phone size={16} className="inline mr-1"/> رقم الهاتف</label>
          <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1"><Mail size={16} className="inline mr-1"/> البريد الإلكتروني</label>
          <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1"><MapPin size={16} className="inline mr-1"/> العنوان</label>
          <input value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رابط فيسبوك</label>
          <input value={form.facebook} onChange={e=>setForm({...form, facebook: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رابط إنستغرام</label>
          <input value={form.instagram} onChange={e=>setForm({...form, instagram: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" className="bg-[#482d39] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#654151] transition">
            <Save size={20}/> حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  );
}
