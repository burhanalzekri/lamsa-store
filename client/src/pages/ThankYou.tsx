import { useLocation, useSearch } from 'wouter';
import { CheckCircle, Home, ShoppingBag, Phone, Truck, Package } from 'lucide-react';

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderNumber = params.get('order') || '';
  const customerName = params.get('name') || 'عميلنا العزيز';

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-[#F0E6D2]">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={60} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#2a1a21] mb-2" style={{ fontFamily: "'Amiri', serif" }}>شكراً لطلبك، {customerName}!</h1>
        
        {orderNumber && (
          <div className="bg-[#FAF3E0] border border-[#F0E6D2] rounded-xl p-4 my-4">
            <p className="text-sm text-gray-600 mb-1">رقم طلبك</p>
            <p className="text-2xl font-bold text-[#C9A84C] tracking-wider" dir="ltr">{orderNumber}</p>
          </div>
        )}

        <p className="text-gray-600 mb-6 leading-relaxed">
          تم استلام طلبك بنجاح. سنتواصل معك قريباً لتأكيد التفاصيل وتحديد موعد التوصيل.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
          <div className="bg-green-50 p-3 rounded-lg"><Package size={20} className="text-green-600 mx-auto mb-1"/><p className="text-green-700 font-bold">تم الاستلام</p></div>
          <div className="bg-gray-50 p-3 rounded-lg opacity-50"><Truck size={20} className="text-gray-400 mx-auto mb-1"/><p className="text-gray-500 font-bold">قيد التجهيز</p></div>
          <div className="bg-gray-50 p-3 rounded-lg opacity-50"><Phone size={20} className="text-gray-400 mx-auto mb-1"/><p className="text-gray-500 font-bold">التوصيل</p></div>
        </div>

        <div className="space-y-3">
          <button onClick={() => setLocation('/')} className="w-full bg-[#2a1a21] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#482d39] transition">
            <Home size={18} /> العودة للرئيسية
          </button>
          <button onClick={() => setLocation('/')} className="w-full border-2 border-[#2a1a21] text-[#2a1a21] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2a1a21] hover:text-white transition">
            <ShoppingBag size={18} /> مواصلة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}
