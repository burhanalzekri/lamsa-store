import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// دالة مساعدة لتصفية الحالة
const statusLabel: any = { pending: "قيد الانتظار", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };
const statusColor: any = { pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

export default function OverviewPanel({ setTab }: { setTab?: (t: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/stats-new', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json()),
      fetch('/api/admin/all-orders', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } }).then(r => r.json()),
      fetch('/api/admin/reports?days=7').then(r => r.json()).catch(() => ({ dailySales: [] }))
    ]).then(([statsData, ordersData, reportsData]) => {
      setStats(statsData);
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.rows || []));
      setChartData(Array.isArray(reportsData.dailySales) ? reportsData.dailySales : []);
    }).catch(() => toast.error("فشل تحميل البيانات"));
  };

  useEffect(() => { fetchData(); }, []);

  // تصفية الطلبات حسب الحالة
  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);
  // عرض فقط آخر 5 طلبات
  const recentOrders = filteredOrders.slice(0, 5);
  // عدد الطلبات المعلقة
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // تحديث حالة الطلب بسرعة
  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      toast.success("تم تحديث حالة الطلب");
      fetchData(); // إعادة جلب البيانات
    } catch { toast.error("فشل التحديث"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#482d39]">نظرة عامة</h1>

      {/* 1. تنبيهات عاجلة */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 mt-0.5" size={20}/>
          <div className="flex-1">
            <h3 className="font-bold text-orange-800 text-sm">تنبيه: لديك {pendingCount} طلبات قيد الانتظار</h3>
            <p className="text-xs text-orange-600 mt-1">يرجى مراجعة الطلبات الجديدة وتجهيزها في أسرع وقت.</p>
          </div>
          <button onClick={() => setTab && setTab('orders')} className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-orange-600 border border-orange-200 hover:bg-orange-100 flex items-center gap-1">
            عرض الطلبات <ArrowLeft size={14}/>
          </button>
        </div>
      )}

      {/* 2. بطاقات المؤشرات مع رسم بياني مصغر */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package/>} label="المنتجات" value={stats?.products || 0} color="bg-blue-500" chartData={chartData} />
        <StatCard icon={<ShoppingCart/>} label="الطلبات" value={stats?.orders || 0} color="bg-purple-500" chartData={chartData} />
        <StatCard icon={<Users/>} label="المستخدمون" value={stats?.users || 0} color="bg-green-500" />
        <StatCard icon={<DollarSign/>} label="الإيرادات" value={Number(stats?.revenue || 0).toLocaleString() + " ر.ي"} color="bg-[#C9A84C]" chartData={chartData} />
      </div>

      {/* 3. أزرار تنقل سريع (Quick Actions) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <button onClick={() => setTab && setTab('products')} className="flex items-center gap-2 bg-[#482d39] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#5a3847]"><Plus size={16}/> إضافة منتج</button>
        <button onClick={() => setTab && setTab('coupons')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"><Plus size={16}/> إضافة كوبون</button>
        <button onClick={() => setTab && setTab('reports')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"><TrendingUp size={16}/> عرض التقارير</button>
        <a href="/" target="_blank" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"><ArrowLeft size={16}/> زيارة المتجر</a>
      </div>

      {/* 4. جدول الطلبات مع فلاتر وإجراءات سريعة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-[#482d39]">آخر الطلبات</h2>
          
          {/* فلاتر الحالة */}
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'pending', label: 'قيد الانتظار' },
              { id: 'shipped', label: 'مشحون' },
              { id: 'completed', label: 'مكتمل' }
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === f.id ? 'bg-white shadow text-[#482d39]' : 'text-gray-500 hover:text-gray-700'}`}>
                {f.label}
              </button>
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
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[o.status] || 'bg-gray-100'}`}>{statusLabel[o.status] || o.status}</span>
                  </td>
                  <td className="p-3">
                    <select onChange={(e) => updateStatus(o.id, e.target.value)} value={o.status} className="border p-1 rounded text-xs text-gray-600 bg-white">
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
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

function StatCard({ icon, label, value, color, chartData }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center gap-3 mb-2 z-10">
        <div className={`${color} text-white p-2 rounded-lg`}>{icon}</div>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#482d39] z-10">{value}</p>
      
      {/* Sparkline (رسم مصغر) */}
      {chartData && chartData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="total" stroke="#482d39" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
