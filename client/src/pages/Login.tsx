import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Star } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col lg:flex-row-reverse" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      
      {/* القسم الأيمن (الفاخر - الداكن) */}
      <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-[#2a1a21] via-[#482d39] to-[#2a1a21] flex flex-col items-center justify-center p-12 overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* زخارف نباتية ذهبية */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          {/* شعار دائري فاخر */}
          <div className="w-24 h-24 mx-auto bg-[#FAF3E0]/10 rounded-full backdrop-blur-md border border-[#C9A84C]/30 flex items-center justify-center mb-8 shadow-2xl">
             <Star className="text-[#C9A84C] fill-[#C9A84C]" size={40} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">متجر لمسة</h1>
          <p className="text-[#E8C87A] text-lg mb-8 max-w-sm mx-auto leading-relaxed">اكتشفي أحدث صيحات الموضة والأناقة، وتمتعي بتجربة تسوق لا تُنسى.</p>
          <div className="flex items-center justify-center gap-2 text-[#FAF3E0]/60 text-sm">
            <span className="w-8 h-[1px] bg-[#C9A84C]/50"></span>
            <span>LAMSA STORE</span>
            <span className="w-8 h-[1px] bg-[#C9A84C]/50"></span>
          </div>
        </div>
      </div>

      {/* القسم الأيسر (نموذج الدخول - الفاتح) */}
      <div className="w-full lg:w-1/2 bg-[#FAF3E0] flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#482d39] mb-2">مرحباً بعودتك</h2>
            <p className="text-[#777] text-sm">سجلي الدخول لمتابعة تسوقك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقل البريد */}
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C] group-focus-within:text-[#482d39] transition-colors" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full pr-12 pl-4 py-4 bg-white border border-[#C9A84C]/30 rounded-2xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:ring-4 focus:ring-[#482d39]/5 outline-none transition-all shadow-sm"
                disabled={loading}
                dir="ltr"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C] group-focus-within:text-[#482d39] transition-colors" size={20} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full pr-12 pl-12 py-4 bg-white border border-[#C9A84C]/30 rounded-2xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:ring-4 focus:ring-[#482d39]/5 outline-none transition-all shadow-sm"
                disabled={loading}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#482d39] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#482d39] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#5a3847] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              {!loading && <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#777]">
              ليس لديك حساب؟{' '}
              <button
                onClick={goToRegister}
                className="font-bold text-[#482d39] hover:text-[#C9A84C] transition-colors underline underline-offset-4 decoration-[#C9A84C]/50"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
          
          <div className="mt-12 text-center lg:mt-8">
             <button onClick={() => setLocation('/')} className="text-sm text-[#999] hover:text-[#482d39] transition flex items-center justify-center gap-2 mx-auto">
               <ArrowRight size={16} /> العودة للمتجر
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
