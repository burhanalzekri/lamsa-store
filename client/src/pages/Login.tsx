import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Login({ onLogin, goToRegister }: { onLogin: (user: any, token: string) => void, goToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

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
        toast.success("مرحباً بعودتك! 💕");
        onLogin(data.user, data.token);
      } else {
        toast.error(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (e) { toast.error('خطأ في الاتصال بالخادم'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] via-[#F5E6D8] to-[#FAF0E6] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      {/* زخارف خلفية */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#482d39]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#482d39] shadow-lg shadow-[#482d39]/30 mb-4 relative">
            <Sparkles className="text-white" size={32} />
            <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/40"></div>
          </div>
          <h1 className="text-3xl font-bold text-[#482d39] mb-2">مرحباً بعودتك</h1>
          <p className="text-[#777] text-sm">سجلي الدخول لمتابعة تسوقك في متجر لمسة</p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-[#C9A84C]/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* حقل البريد */}
            <div>
              <label className="block text-sm font-bold text-[#482d39] mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C]" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pr-12 pl-4 py-3.5 bg-[#FAF3E0]/50 border border-[#C9A84C]/30 rounded-xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:bg-white outline-none transition-all"
                  disabled={loading}
                  dir="ltr"
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-bold text-[#482d39] mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C]" size={18} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-12 py-3.5 bg-[#FAF3E0]/50 border border-[#C9A84C]/30 rounded-xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:bg-white outline-none transition-all"
                  disabled={loading}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#482d39] transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-[#482d39] to-[#6b4560] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#482d39]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* رابط إنشاء حساب */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#777]">
              ليس لديك حساب؟{' '}
              <button
                onClick={goToRegister}
                className="font-bold text-[#482d39] hover:text-[#C9A84C] transition underline underline-offset-4"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
        </div>

        {/* العودة للمتجر */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-sm text-[#777] hover:text-[#482d39] transition inline-flex items-center gap-1"
          >
            ← العودة للمتجر
          </button>
        </div>
      </div>
    </div>
  );
}
