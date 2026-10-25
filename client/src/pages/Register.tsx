import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Star } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Register({ onLogin, goToLogin }: { onLogin: (user: any, token: string) => void, goToLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إنشاء حسابك بنجاح! 🎉");
        onLogin(data.user, data.token);
      } else {
        toast.error(data.error || 'فشل إنشاء الحساب');
      }
    } catch (e) { toast.error('خطأ في الاتصال بالخادم'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse" dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      
      {/* القسم الأيمن (الداكن - الفاخر) */}
      <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-[#2a1a21] via-[#482d39] to-[#2a1a21] flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden min-h-[35vh] lg:min-h-screen">
        {/* دوائر مضيئة في الخلفية */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 text-center">
          {/* شعار النجمة */}
          <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto bg-white/5 rounded-full backdrop-blur-xl border border-[#C9A84C]/30 flex items-center justify-center mb-6 shadow-2xl">
             <Star className="text-[#C9A84C] fill-[#C9A84C] drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]" size={36} />
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3">انضمي إلينا</h1>
          <p className="text-[#E8C87A] text-sm lg:text-lg mb-6 max-w-sm mx-auto leading-relaxed">اكتشفي عالم من الأناقة والجمال. سجلي الآن لتكوني جزءاً من عائلة لمسة.</p>
          <div className="flex items-center justify-center gap-3 text-[#FAF3E0]/50 text-xs lg:text-sm tracking-widest">
            <span className="w-8 lg:w-12 h-[1px] bg-[#C9A84C]/50"></span>
            LAMSA STORE
            <span className="w-8 lg:w-12 h-[1px] bg-[#C9A84C]/50"></span>
          </div>
        </div>
      </div>

      {/* القسم الأيسر (الفاتح - النموذج) */}
      <div className="w-full lg:w-1/2 bg-[#FAF3E0] flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#482d39] mb-2">حساب جديد</h2>
            <p className="text-[#777] text-sm">أدخلي بياناتك للانضمام إلينا</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            {/* حقل الاسم */}
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C] group-focus-within:text-[#482d39] transition-colors duration-300" size={20} />
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full pr-12 pl-4 py-3.5 lg:py-4 bg-white border border-[#C9A84C]/30 rounded-2xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:ring-4 focus:ring-[#482d39]/5 outline-none transition-all duration-300 shadow-sm"
                disabled={loading}
              />
            </div>

            {/* حقل البريد */}
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C] group-focus-within:text-[#482d39] transition-colors duration-300" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full pr-12 pl-4 py-3.5 lg:py-4 bg-white border border-[#C9A84C]/30 rounded-2xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:ring-4 focus:ring-[#482d39]/5 outline-none transition-all duration-300 shadow-sm"
                disabled={loading}
                dir="ltr"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A84C] group-focus-within:text-[#482d39] transition-colors duration-300" size={20} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full pr-12 pl-12 py-3.5 lg:py-4 bg-white border border-[#C9A84C]/30 rounded-2xl text-[#34212a] placeholder-[#999] focus:border-[#482d39] focus:ring-4 focus:ring-[#482d39]/5 outline-none transition-all duration-300 shadow-sm"
                disabled={loading}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#482d39] transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* زر إنشاء الحساب */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#482d39] text-white py-3.5 lg:py-4 rounded-2xl font-bold text-lg hover:bg-[#5a3847] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 group"
            >
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              {!loading && <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* رابط تسجيل الدخول */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#777]">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={goToLogin}
                className="font-bold text-[#482d39] hover:text-[#C9A84C] transition-colors underline underline-offset-4 decoration-[#C9A84C]/50 hover:decoration-[#C9A84C]"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
          
          {/* العودة للمتجر */}
          <div className="mt-8 lg:mt-10 text-center">
             <button onClick={() => setLocation('/')} className="text-sm text-[#999] hover:text-[#482d39] transition flex items-center justify-center gap-2 mx-auto group">
               <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" /> العودة للمتجر
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
