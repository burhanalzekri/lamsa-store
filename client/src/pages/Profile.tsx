import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, Package, LogOut, ArrowRight } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // قراءة بيانات المستخدم من التخزين المحلي أولاً
    const savedUser = localStorage.getItem('lamsa_user');
    const token = localStorage.getItem('lamsa_token');
    
    if (!savedUser || !token) {
      setLocation('/login');
      return;
    }

    setUser(JSON.parse(savedUser));

    // محاولة جلب الطلبات (إذا فشلت، تبقى الصفحة تعمل)
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(d => { if (d.orders) setOrders(d.orders); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lamsa_user');
    localStorage.removeItem('lamsa_token');
    setLocation('/');
    window.location.reload();
  };

  // إذا لم يتم تحميل المستخدم بعد
  if (!user) return <div className="p-10 text-center font-bold text-[#482d39]">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline"><ArrowRight size={20}/> العودة للرئيسية</button>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#482d39] text-white p-4 rounded-full"><User size={32}/></div>
            <div>
              <h1 className="text-2xl font-bold text-[#34212a]">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold mt-1 inline-block">{user.role === 'admin' ? 'مدير' : 'عميل'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg"><LogOut size={18}/> خروج</button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#34212a] mb-4 flex items-center gap-2"><Package size={20}/> سجل الطلبات</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد طلبات سابقة مسجلة بهذا الحساب.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#34212a]">طلب #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#d93844]">{order.totalAmount} ر.ي</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
