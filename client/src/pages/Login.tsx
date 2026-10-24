import { useState } from 'react';
import { toast } from 'sonner';

export default function Login({ onLogin, goToRegister }: { onLogin: (user: any, token: string) => void, goToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم تسجيل الدخول بنجاح!");
        onLogin(data.user, data.token);
      } else {
        toast.error(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (e) { toast.error('خطأ في الاتصال بالخادم'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-[#482d39] text-center mb-6">تسجيل الدخول</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#482d39]" dir="ltr" />
          <input required type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#482d39]" dir="ltr" />
          <button disabled={loading} type="submit" className="w-full bg-[#482d39] text-white py-3 rounded-lg font-bold hover:bg-[#654151] transition disabled:opacity-50">
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">ليس لديك حساب؟ <button onClick={goToRegister} className="text-[#482d39] font-bold hover:underline">أنشئ حساباً جديداً</button></p>
      </div>
    </div>
  );
}
