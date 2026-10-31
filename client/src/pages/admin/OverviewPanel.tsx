import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const statusLabel: any = { pending: "قيد الانتظار", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };
const statusColor: any = { pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

export default function OverviewPanel({ setTab }: { setTab?: (t: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/stats-new', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json()),
      fetch('/api/admin/all-orders', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json())
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.rows || []));
    }).catch(() => toast.error("فشل تحميل البيانات"));
  };

  useEffect(() => { fetchData(); }, []);

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);
  const recentOrders = filteredOrders.slice(0, 5);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('lamsa_token');
      if (!token) { toast.error("انتهت جلسة الدخول"); return; }
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error();
      toast.success("تم تحديث الحالة");
      fetchData();
    } catch { toast.error("فشل التحديث"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#6b174d]">نظرة عامة</h1>

      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 mt-0.5" size={20}/>
          <div className="flex-1">
            <h3 className="font-bold text-orange-800 text-sm">تنبيه: لديك {pendingCount} طلبات قيد الانتظار</h3>
          </div>
          <button onClick={() => setTab && setTab('orders')} className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-orange-600 border border-orange-200">عرض الطلبات</button>
        </div>
      )}

      {/* البطاقات الإحصائية - مصممة لتظهر الألوان والأرقام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] shadow-lg text-white">
          <div className="flex items-center justify-between mb-4"><Package size={24}/><span className="text-xs opacity-80">المنتجات</span></div>
          <p className="text-3xl font-bold">{stats?.products || 0}</p>
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb] shadow-lg text-white">
          <div className="flex items-center justify-between mb-4"><ShoppingCart size={24}/><span className="text-xs opacity-80">الطلبات</span></div>
          <p className="text-3xl font-bold">{stats?.orders || 0}</p>
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#43e97b] to-[#38f9d7] shadow-lg text-white">
          <div className="flex items-center justify-between mb-4"><Users size={24}/><span className="text-xs opacity-80">المستخدمون</span></div>
          <p className="text-3xl font-bold">{stats?.users || 0}</p>
        </div>
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#C9A84C] to-[#f3dfb7] shadow-lg text-white">
          <div className="flex items-center justify-between mb-4"><DollarSign size={24}/><span className="text-xs opacity-80">الإيرادات</span></div>
          <p className="text-2xl font-bold">{Number(stats?.revenue || 0).toLocaleString()} <span className="text-sm">ر.ي</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <button onClick={() => setTab && setTab('products')} className="flex items-center gap-2 bg-[#6b174d] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4a0f35]"><Plus size={16}/> إضافة منتج</button>
        <button onClick={() => setTab && setTab('coupons')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold"><Plus size={16}/> إضافة كوبون</button>
        <button onClick={() => setTab && setTab('reports')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold"><TrendingUp size={16}/> عرض التقارير</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-[#6b174d]">آخر الطلبات</h2>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border">
            {[{ id: 'all', label: 'الكل' }, { id: 'pending', label: 'قيد الانتظار' }, { id: 'shipped', label: 'مشحون' }, { id: 'completed', label: 'مكتمل' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 text-xs font-bold rounded-md ${filter === f.id ? 'bg-white shadow text-[#6b174d]' : 'text-gray-500'}`}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr><th className="p-3">رقم الطلب</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">الحالة</th><th className="p-3">إجراء سريع</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{o.orderNumber || o.id.slice(0,8)}</td>
                  <td className="p-3">{o.customerName}</td>
                  <td className="p-3 font-bold">{Number(o.totalAmount).toLocaleString()} ر.ي</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[o.status] || 'bg-gray-100'}`}>{statusLabel[o.status] || o.status}</span></td>
                  <td className="p-3">
                    <select onChange={(e) => updateStatus(o.id, e.target.value)} value={o.status} className="border p-1 rounded text-xs text-gray-600 bg-white">
                      <option value="pending">قيد الانتظار</option><option value="processing">قيد التجهيز</option><option value="shipped">تم الشحن</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
                    </select>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">لا توجد طلبات مطابقة</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-left">
          <button onClick={() => setTab && setTab('orders')} className="text-sm text-[#C9A84C] font-bold hover:underline">عرض كل الطلبات ←</button>
        </div>
      </div>
    </div>
  );
}
