import { useState } from 'react';
import { toast } from 'sonner';

export default function Register({ onLogin, goToLogin }: { onLogin: (user: any, token: string) => void, goToLogin: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إنشاء الحساب بنجاح! مرحباً بك");
        // بعد التسجيل، نسجل الدخول تلقائياً (الكود يفترض أن الخادم يعيد توكن)
        onLogin({ name: form.name, email: form.email, role: 'user' }, 'dummy-token');
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (e) { toast.error('خطأ في الاتصال بالخادم'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-[#482d39] text-center mb-6">حساب جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="الاسم الكامل" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#482d39]" />
          <input required type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#482d39]" dir="ltr" />
          <input required type="password" placeholder="كلمة المرور" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#482d39]" dir="ltr" />
          <button disabled={loading} type="submit" className="w-full bg-[#482d39] text-white py-3 rounded-lg font-bold hover:bg-[#654151] transition disabled:opacity-50">
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">لديك حساب بالفعل؟ <button onClick={goToLogin} className="text-[#482d39] font-bold hover:underline">تسجيل الدخول</button></p>
      </div>
    </div>
  );
}
