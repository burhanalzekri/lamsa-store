import { useState } from "react";
import { Link } from "wouter";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin, goToRegister }: { onLogin: (u: any, t: string) => void, goToRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطأ في تسجيل الدخول");
      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f2] p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_10px_40px_rgba(107,23,77,0.08)] p-8 sm:p-10 border border-[#f0e6ed]">
        
        {/* الشعار والعنوان */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#6b174d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white font-bold">ل</span>
          </div>
          <h2 className="text-2xl font-bold text-[#351126] mb-2">مرحباً بك في لمسة</h2>
          <p className="text-gray-500 text-sm">سجلي الدخول لمتابعة تسوقك</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#351126] mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#ead7e2] rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-[#6b174d] focus:ring-1 focus:ring-[#6b174d] transition-all text-left dir-ltr"
                placeholder="admin@lamsa.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#351126] mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#ead7e2] rounded-xl py-3 pr-10 pl-12 focus:outline-none focus:border-[#6b174d] focus:ring-1 focus:ring-[#6b174d] transition-all text-left dir-ltr"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-[#6b174d]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6b174d] hover:bg-[#8b2252] text-white font-bold py-3.5 rounded-xl transition-all mt-6"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            ليس لديك حساب؟{" "}
            <button onClick={goToRegister} className="text-[#6b174d] font-bold hover:underline">
              إنشاء حساب جديد
            </button>
          </p>
          <Link href="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-[#6b174d] transition-colors">
            العودة للمتجر
          </Link>
        </div>
      </div>
    </div>
  );
}
