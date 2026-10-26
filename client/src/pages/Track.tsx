import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, AlertCircle, ArrowRight, Phone, Hash, Clock, Heart, Tag } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Track() {
  const [searchType, setSearchType] = useState<'id' | 'phone'>('id');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // البحث
  const performSearch = async (searchQuery: string, type: 'id' | 'phone') => {
    setLoading(true); setError(''); setOrders([]);
    try {
      if (type === 'id') {
        const res = await fetch(`/api/orders/${searchQuery}`);
        if (!res.ok) throw new Error("لم يتم العثور على الطلب.");
        const data = await res.json();
        setOrders([data]);
      } else {
        const res = await fetch(`/api/orders/track-by-phone/${searchQuery}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("لا توجد طلبات بهذا الرقم.");
        setOrders(data);
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    }
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setSearchType('id');
      setQuery(id);
      performSearch(id, 'id');
    }
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    performSearch(query, searchType);
  };

  // مراحل الطلب
  const steps = [
    { key: 'pending', label: 'تم الاستلام', icon: <Package size={18}/> },
    { key: 'processing', label: 'قيد التجهيز', icon: <Clock size={18}/> },
    { key: 'shipped', label: 'تم الشحن', icon: <Truck size={18}/> },
    { key: 'completed', label: 'تم التوصيل', icon: <CheckCircle size={18}/> },
  ];

  const getStepIndex = (status: string) => {
    if (!status) return 0;
    return steps.findIndex(s => s.key === status);
  };

  // قراءة آمنة للمنتجات
  const parseItems = (items: any): any[] => {
    try {
      if (Array.isArray(items)) return items;
      if (typeof items === 'string') {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline">
          <ArrowRight size={20}/> العودة للرئيسية
        </button>
        
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#482d39]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-[#482d39]" size={32}/>
            </div>
            <h1 className="text-2xl font-bold text-[#34212a]">تتبع طلبك</h1>
            <p className="text-gray-500 text-sm mt-2">ابحث برقم الطلب أو رقم الجوال.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button onClick={() => { setSearchType('id'); setQuery(''); setOrders([]); }} className={`flex-grow py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition ${searchType === 'id' ? 'bg-white shadow-sm text-[#482d39]' : 'text-gray-500'}`}>
              <Hash size={16}/> رقم الطلب
            </button>
            <button onClick={() => { setSearchType('phone'); setQuery(''); setOrders([]); }} className={`flex-grow py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition ${searchType === 'phone' ? 'bg-white shadow-sm text-[#482d39]' : 'text-gray-500'}`}>
              <Phone size={16}/> رقم الجوال
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <input required value={query} onChange={e => setQuery(e.target.value)} placeholder={searchType === 'id' ? "LMS-123456" : "05xxxxxxxx"} className="flex-grow border p-3 rounded-lg outline-none focus:border-[#482d39]" dir="ltr" />
            <button disabled={loading} type="submit" className="bg-[#C9A84C] text-white px-6 rounded-lg font-bold hover:bg-[#b8952f] transition disabled:opacity-50">
              {loading ? '...' : 'بحث'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center flex items-center justify-center gap-2">
              <AlertCircle size={16}/>{error}
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order, index) => {
                if (!order) return null;
                const currentStep = getStepIndex(order.status);
                const items = parseItems(order.items);
                
                return (
                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                      <div>
                        <h2 className="font-bold text-lg text-[#34212a]">طلب {order.id || 'غير معروف'}</h2>
                        <p className="text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : ''}</p>
                      </div>
                      <p className="font-bold text-[#d93844]">{order.totalAmount || 0} ر.ي</p>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between relative mt-6">
                        <div className="absolute top-5 right-0 left-0 h-1 bg-gray-200 -z-0"></div>
                        <div className="absolute top-5 right-0 h-1 bg-[#C9A84C] -z-0" style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}></div>
                        
                        {steps.map((step, i) => (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-2" style={{ width: '25%' }}>
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${i <= currentStep ? 'bg-[#C9A84C] text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
                              {step.icon}
                            </div>
                            <span className={`text-[11px] font-bold text-center ${i <= currentStep ? 'text-[#34212a]' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t">
                      <h3 className="font-bold text-sm text-gray-700 mb-2">المنتجات:</h3>
                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.name || item.title || 'منتج'}</span>
                              <span className="font-bold">x{item.quantity || 1}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs">لا توجد تفاصيل</p>
                      )}
                      <div className="border-t mt-2 pt-2 text-sm text-gray-600 space-y-1">
                        <p><b>الاسم:</b> {order.customerName || '-'}</p>
                        <p><b>الهاتف:</b> {order.phone || '-'}</p>
                        <p><b>العنوان:</b> {order.address || '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
