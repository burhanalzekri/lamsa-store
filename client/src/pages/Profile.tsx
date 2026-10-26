import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, Package, LogOut, ArrowRight, ShoppingBag, Clock, CheckCircle, Truck, XCircle, Phone } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    const token = localStorage.getItem('lamsa_token');
    if (!savedUser || !token) {
      setLocation('/login');
      return;
    }
    const u = JSON.parse(savedUser);
    setUser(u);

    // جلب الطلبات
    fetch(`/api/my-orders?email=${encodeURIComponent(u.email)}`)
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lamsa_user');
    localStorage.removeItem('lamsa_token');
    setLocation('/');
    window.location.reload();
  };

  const statusInfo: any = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16}/> },
    processing: { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800', icon: <Package size={16}/> },
    shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: <Truck size={16}/> },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16}/> },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: <XCircle size={16}/> },
  };

  if (!user) return <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center font-bold text-[#482d39]">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:text-[#C9A84C] transition">
          <ArrowRight size={20}/> العودة للرئيسية
        </button>

        {/* بطاقة المستخدم */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#C9A84C] to-[#b8952f] text-white p-5 rounded-full shadow-lg">
              <User size={32}/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2a1a21]">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <span className={`text-xs px-2 py-1 rounded font-bold mt-1 inline-block ${user.role === 'admin' ? 'bg-[#C9A84C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                {user.role === 'admin' ? 'مدير' : 'عميل'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition w-full md:w-auto justify-center">
            <LogOut size={18}/> خروج
          </button>
        </div>

        {/* سجل الطلبات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#2a1a21] mb-6 flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#C9A84C]"/> سجل الطلبات ({orders.length})
          </h2>
          
          {loading ? (
            <p className="text-center py-8 text-gray-500">جاري التحميل...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">لا توجد طلبات سابقة</p>
              <button onClick={() => setLocation('/')} className="bg-[#2a1a21] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#482d39] transition">
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const st = statusInfo[order.status] || statusInfo.pending;
                return (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#C9A84C] transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-[#2a1a21]">طلب {order.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <p className="text-sm text-gray-500">{JSON.parse(order.items || '[]').length} منتج</p>
                      <p className="font-bold text-[#d93844] text-lg">{Number(order.totalAmount).toLocaleString()} ر.ي</p>
                    </div>
                    <button onClick={() => setLocation(`/track?phone=${order.phone}`)} className="text-xs text-[#C9A84C] font-bold mt-2 hover:underline flex items-center gap-1">
                      <Phone size={12}/> تتبع الطلب
                    </button>
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
