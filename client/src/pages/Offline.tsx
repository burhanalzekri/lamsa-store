import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function Offline() {
  const [isOnline, setIsOnline] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const retry = () => {
    if (navigator.onLine) setLocation("/");
    else window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <WifiOff className="w-14 h-14 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">لا يوجد اتصال بالإنترنت</h1>
        <p className="text-gray-500 mb-2 leading-relaxed">
          يبدو أنك غير متصل بالإنترنت حالياً.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          تحقق من اتصالك ثم حاول مرة أخرى.
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
          isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          {isOnline ? "متصل الآن" : "غير متصل"}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة المحاولة
          </button>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
