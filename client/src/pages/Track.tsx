import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, AlertCircle, ArrowRight, Phone, Hash, Clock, Heart, Sparkles, Tag } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Track() {
  const [searchType, setSearchType] = useState<'id' | 'phone'>('id');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/api/products?t=' + Date.now())
      .then(r => r.json())
      .then(d => { if(Array.isArray(d)) setSuggested(d.sort(() => 0.5 - Math.random()).slice(0, 4)); })
      .catch(() => {});
  }, []);

  const performSearch = async (searchQuery: string, type: 'id' | 'phone') => {
    setLoading(true); setError(''); setOrders([]);
    try {
      if (type === 'id') {
        const res = await fetch(`/api/orders/${searchQuery}`);
        if (!res.ok) throw new Error("لم يتم العثور على الطلب. تأكد من رقم الطلب.");
        const data = await res.json();
        setOrders([data]);
      } else {
        const res = await fetch(`/api/orders/track-by-phone/${searchQuery}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("لا توجد طلبات مسجلة بهذا الرقم.");
        setOrders(data);
      }
    } catch (e: any) { setError(e.message); }
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

  const steps = [
    { key: 'pending', label: 'تم الاستلام', icon: <Package size={18}/> },
    { key: 'processing', label: 'قيد التجهيز', icon: <Clock size={18}/> },
    { key: 'shipped', label: 'تم الشحن', icon: <Truck size={18}/> },
    { key: 'completed', label: 'تم التوصيل', icon: <CheckCircle size={18}/> },
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  const isDelayed = (order: any) => {
    if (order.status !== 'pending') return false;
    const orderDate = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - orderDate) / (1000 * 3600 * 24);
    return diffDays > 3;
  };

  const filterRecentOrders = (ordersList: any[]) => {
    const now = new Date().getTime();
    return ordersList.filter(o => {
      const orderDate = new Date(o.createdAt).getTime();
      const diffDays = (now - orderDate) / (1000 * 3600 * 24);
      return diffDays <= 90;
    });
  };

  const visibleOrders = filterRecentOrders(orders);
  const hasHiddenOrders = orders.length > visibleOrders.length;

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
            <p className="text-gray-500 text-sm mt-2">ابحث برقم الطلب أو رقم الجوال لمعرفة حالته.</p>
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
            <input 
              required 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder={searchType === 'id' ? "مثال: LMS-123456" : "مثال: 05xxxxxxxx"} 
              className="flex-grow border p-3 rounded-lg outline-none focus:border-[#482d39]" 
              dir="ltr" 
            />
            <button disabled={loading} type="submit" className="bg-[#482d39] text-white px-6 rounded-lg font-bold hover:bg-[#654151] transition disabled:opacity-50">
              {loading ? '...' : 'بحث'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center flex items-center justify-center gap-2">
              <AlertCircle size={16}/>{error}
            </div>
          )}

          {visibleOrders.length > 0 && (
            <div className="space-y-6">
              {visibleOrders.map((order, index) => {
                const currentStep = getStepIndex(order.status);
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                const delayed = isDelayed(order);
                
                return (
                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                      <div>
                        <h2 className="font-bold text-lg text-[#34212a]">طلب رقم {order.id}</h2>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-[#d93844]">{order.totalAmount} ر.ي</p>
                      </div>
                    </div>

                    <div className={`p-4 text-sm text-center ${delayed ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
                      {delayed ? (
                        <p className="flex items-center justify-center gap-2">
                          <Clock size={16}/> نعتذر منك، طلبك يتأخر قليلاً عن المعتاد. نعمل جاهدين لتجهيزه في أقرب وقت.
                        </p>
                      ) : (
                        <p className="flex items-center justify-center gap-2">
                          <Heart size={16} className="text-red-500"/> شكراً لثقتك بلمسة! طلبك في أيدٍ أمينة، وسنبقيك على اطلاع دائم.
                        </p>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between relative mt-6">
                        <div className="absolute top-5 right-0 left-0 h-1 bg-gray-200 -z-0"></div>
                        <div className="absolute top-5 right-0 h-1 bg-[#d93844] -z-0 transition-all duration-700" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                        
                        {steps.map((step, i) => (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-2" style={{ width: '25%' }}>
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-500 ${i <= currentStep ? 'bg-[#d93844] text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>
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
                      <div className="space-y-2">
                        {items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name || item.title}</span>
                            <span className="font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-2 pt-2 text-sm text-gray-600 space-y-1">
                        <p><b>الاسم:</b> {order.customerName}</p>
                        <p><b>الهاتف:</b> {order.phone}</p>
                        <p><b>العنوان:</b> {order.address}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasHiddenOrders && (
            <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              عرضنا لك آخر 90 يوماً فقط. الطلبات الأقدم من ذلك متاحة في صفحة "حسابي".
            </div>
          )}
        </div>

        {suggested.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="text-[#d93844]" size={24}/>
              <h2 className="text-xl font-bold text-[#34212a]">عروض وتخفيضات تناسبك</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggested.map(p => (
                <div key={p.id} onClick={() => setLocation(`/product/${p.id}`)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src={p.image || "https://placehold.co/400x500"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    {p.compareAtHalalas > 0 && <span className="absolute top-2 right-2 bg-[#d93844] text-white text-xs font-bold px-2 py-1 rounded">عرض</span>}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-xs text-[#34212a] truncate">{p.name}</h3>
                    <p className="text-sm text-[#d93844] font-bold mt-1">{p.price} ر.ي</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
