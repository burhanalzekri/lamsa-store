import { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, AlertTriangle, TrendingUp, Clock, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// بيانات تجريبية (Mock) ستظهر دائماً حتى لو كانت قاعدة البيانات فارغة
const mockStats = {
  totalSales: 125000,
  totalOrders: 24,
  totalProducts: 12,
  lowStock: 3,
};

const mockChartData = [
  { name: 'السبت', sales: 12000 },
  { name: 'الأحد', sales: 19000 },
  { name: 'الاثنين', sales: 15000 },
  { name: 'الثلاثاء', sales: 22000 },
  { name: 'الأربعاء', sales: 18000 },
  { name: 'الخميس', sales: 25000 },
  { name: 'الجمعة', sales: 14000 },
];

const mockOrders = [
  { id: 'LMS-596076', customer: 'برهان الالكري', amount: 15000, status: 'مكتمل', date: '2026-10-24' },
  { id: 'LMS-395877', customer: 'ريهام', amount: 80000, status: 'قيد الانتظار', date: '2026-10-24' },
  { id: 'LMS-342936', customer: 'اختبار', amount: 100, status: 'مكتمل', date: '2026-10-23' },
  { id: 'LMS-290531', customer: 'اختبار', amount: 100, status: 'مكتمل', date: '2026-10-23' },
  { id: 'LMS-106653', customer: 'برهان الالكري', amount: 50000, status: 'قيد الانتظار', date: '2026-10-22' },
];

export default function OverviewPanel() {
  const [loading, setLoading] = useState(true);

  // محاكاة تحميل سريع
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-[#482d39] font-bold">جارٍ تحميل الإحصائيات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#482d39]">نظرة عامة</h2>
        <span className="text-sm text-gray-500">آخر تحديث: اليوم</span>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="المبيعات" 
          value={mockStats.totalSales.toLocaleString() + ' ر.ي'} 
          icon={<DollarSign size={24} />} 
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard 
          title="الطلبات" 
          value={mockStats.totalOrders.toString()} 
          icon={<ShoppingBag size={24} />} 
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="المنتجات" 
          value={mockStats.totalProducts.toString()} 
          icon={<Package size={24} />} 
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="تنبيهات المخزون" 
          value={mockStats.lowStock.toString()} 
          icon={<AlertTriangle size={24} />} 
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* الرسم البياني */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-[#C9A84C]" size={20} />
          <h3 className="font-bold text-[#482d39]">المبيعات اليومية (آخر 7 أيام)</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => value / 1000 + 'k'} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [value.toLocaleString() + ' ر.ي', 'المبيعات']}
              />
              <Line type="monotone" dataKey="sales" stroke="#C9A84C" strokeWidth={3} dot={{ fill: '#C9A84C', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* آخر الطلبات وتنبيهات المخزون */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* آخر الطلبات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-[#C9A84C]" size={20} />
              <h3 className="font-bold text-[#482d39]">آخر الطلبات</h3>
            </div>
            <span className="text-xs text-blue-500 cursor-pointer hover:underline">عرض الكل</span>
          </div>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-500">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#34212a]">{order.customer}</p>
                    <p className="text-xs text-gray-500">#{order.id}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-[#482d39]">{order.amount.toLocaleString()} ر.ي</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    order.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تنبيهات المخزون */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-bold text-[#482d39]">تنبيهات المخزون</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="text-red-400" size={32} />
            </div>
            <p className="text-[#34212a] font-bold">المخزون بحالة جيدة</p>
            <p className="text-sm text-gray-500 mt-1">لا توجد منتجات على وشك النفاد حالياً</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-[#34212a] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
