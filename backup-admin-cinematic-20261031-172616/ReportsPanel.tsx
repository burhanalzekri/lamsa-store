import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { TrendingUp, ShoppingBag, DollarSign, Package, AlertTriangle, Download, RefreshCw, Printer, Users, ArrowUp, ArrowDown } from 'lucide-react';

export default function ReportsPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchReports = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/reports?days=${days}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } })
      .then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || "خطأ في الخادم");
        }
        return r.json();
      })
      .then(d => setData(d))
      .catch((e) => {
        setError(e.message);
        toast.error("فشل جلب التقارير: " + e.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [days]);

  if (loading) return <div className="text-center py-10"><RefreshCw className="animate-spin mx-auto text-[#482d39]"/></div>;
  if (error) return (
    <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl">
      <AlertTriangle className="mx-auto mb-2" size={32}/>
      <p className="font-bold">فشل تحميل التقارير</p>
      <p className="text-sm mt-1">{error}</p>
      <button onClick={fetchReports} className="mt-4 bg-[#482d39] text-white px-4 py-2 rounded-lg text-sm">إعادة المحاولة</button>
    </div>
  );
  if (!data) return <div className="text-center py-10 text-gray-500">لا توجد بيانات</div>;

  // ✅ حماية البيانات من الانهيار
  const totals = data.totals || { orders: 0, revenue: 0, avgOrder: 0, growth: 0, profit: 0 };
  const dailySales = Array.isArray(data.dailySales) ? data.dailySales : [];
  const categorySales = Array.isArray(data.categorySales) ? data.categorySales : [];
  const topCustomers = Array.isArray(data.topCustomers) ? data.topCustomers : [];
  const topProducts = Array.isArray(data.topProducts) ? data.topProducts : [];
  const stagnantProducts = Array.isArray(data.stagnantProducts) ? data.stagnantProducts : [];
  const reorderRecommendations = Array.isArray(data.reorderRecommendations) ? data.reorderRecommendations : [];

  const COLORS = ['#C9A84C', '#482d39', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6 pb-10" id="reports-container">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[#482d39]">لوحة التقارير الذكية</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => window.print()} className="bg-white border p-2 rounded-lg text-gray-600 hover:bg-gray-50" title="طباعة"><Printer size={18}/></button>
          <button onClick={fetchReports} className="bg-white border p-2 rounded-lg text-gray-600 hover:bg-gray-50" title="تحديث"><RefreshCw size={18}/></button>
        </div>
      </div>

      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm w-fit border">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${days === d ? 'bg-[#482d39] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            آخر {d} يوم
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign/>} label="الإيرادات" value={Number(totals.revenue).toLocaleString() + " ر.ي"} color="bg-green-500" 
          extra={totals.growth !== 0 && (
            <span className={`text-xs flex items-center gap-1 font-bold ${totals.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.growth > 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
              {Math.abs(totals.growth).toFixed(1)}% مقارنة بالفترة السابقة
            </span>
          )}
        />
        <StatCard icon={<ShoppingBag/>} label="الطلبات" value={totals.orders} color="bg-blue-500" />
        <StatCard icon={<TrendingUp/>} label="متوسط الطلب" value={Number(totals.avgOrder).toLocaleString() + " ر.ي"} color="bg-purple-500" />
        <StatCard icon={<DollarSign/>} label="صافي الربح (تقريبي)" value={Number(totals.profit).toLocaleString() + " ر.ي"} color="bg-[#C9A84C]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#482d39] mb-6">المبيعات اليومية</h2>
          {dailySales.length > 0 ? (
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('ar', { day: 'numeric', month: 'short' })} />
                  <YAxis />
                  <Tooltip formatter={(v: any) => [Number(v).toLocaleString() + ' ر.ي', 'المبيعات']} />
                  <Bar dataKey="total" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-center text-gray-500 py-10">لا توجد مبيعات</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#482d39] mb-6 text-center">توزيع المبيعات (الفئات)</h2>
          {categorySales.length > 0 ? (
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySales} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {categorySales.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => Number(v).toLocaleString() + ' ر.ي'} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-center text-gray-500 py-10">لا توجد بيانات</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2 mb-4"><AlertTriangle size={20}/> تنبيهات نفاذ المخزون</h2>
          {reorderRecommendations.length > 0 ? (
            <div className="space-y-2">
              {reorderRecommendations.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div><p className="font-bold text-[#482d39] text-sm">{p.name}</p><p className="text-xs text-gray-600">معدل: {p.dailyRate}/يوم</p></div>
                  <span className="bg-white text-orange-600 font-bold px-3 py-1 rounded-full text-xs border border-orange-200">{p.daysLeft} يوم</span>
                </div>
              ))}
            </div>
          ) : <p className="text-center text-green-700 bg-green-50 py-4 rounded-lg text-sm">المخزون بحالة جيدة</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#482d39] flex items-center gap-2 mb-4"><Users size={20}/> أفضل العملاء</h2>
          {topCustomers.length > 0 ? (
            <div className="space-y-2">
              {topCustomers.map((c: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div><p className="font-medium text-sm">{c.customerName}</p><p className="text-xs text-gray-500" dir="ltr">{c.phone}</p></div>
                  <div className="text-left"><p className="font-bold text-[#482d39] text-sm">{Number(c.totalSpent).toLocaleString()} ر.ي</p><p className="text-xs text-gray-500">{c.orderCount} طلب</p></div>
                </div>
              ))}
            </div>
          ) : <p className="text-center text-gray-500 py-6 text-sm">لا يوجد عملاء</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#482d39] mb-4">الأكثر مبيعاً</h2>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="font-bold text-gray-400 w-5 text-sm">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1"><span>{p.name}</span><span className="font-bold">{p.count} قطعة</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${topProducts[0] && p.count ? (p.count / topProducts[0].count) * 100 : 0}%` }}></div></div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">لا توجد مبيعات</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#482d39] flex items-center gap-2 mb-4"><Package size={20}/> منتجات راكدة</h2>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {stagnantProducts.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                <span>{p.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">المخزون: {p.stock}</span>
              </div>
            ))}
            {stagnantProducts.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">لا توجد منتجات راكدة</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, extra }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${color} text-white p-2 rounded-lg`}>{icon}</div>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
      <p className="text-xl font-bold text-[#482d39]">{value}</p>
      {extra && <div className="mt-1">{extra}</div>}
    </div>
  );
}
