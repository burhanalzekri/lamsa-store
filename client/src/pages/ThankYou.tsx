import { useLocation } from 'wouter';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function ThankYou() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#34212a] mb-2">شكراً لطلبك!</h1>
        <p className="text-gray-600 mb-6">تم استلام طلبك بنجاح. سنتواصل معك قريباً لتأكيد التفاصيل.</p>
        <div className="space-y-3">
          <button onClick={() => setLocation('/')} className="w-full bg-[#482d39] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Home size={18} /> العودة للرئيسية
          </button>
          <button onClick={() => setLocation('/products')} className="w-full border border-[#482d39] text-[#482d39] py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <ShoppingBag size={18} /> مواصلة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}
