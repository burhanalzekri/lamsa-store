import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, AlertTriangle, Package } from 'lucide-react';

export default function OverviewPanel() {
  const [stats, setStats] = useState<any>({ products: 0, orders: 0, revenue: 0, lowStock: 0, pendingOrders: 0 });

  useEffect(() => {
    // جلب البيانات بشكل تجريبي (يمكن ربطها لاحقاً بالخادم)
    setStats({ products: 4, orders: 0, revenue: 0, lowStock: 0, pendingOrders: 0 });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">نظرة عامة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={28}/></div>
          <div><p className="text-sm text-gray-500 font-bold">المبيعات</p><p className="text-2xl font-bold text-[#482d39]">{stats.revenue} ر.ي</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><ShoppingBag size={28}/></div>
          <div><p className="text-sm text-gray-500 font-bold">الطلبات</p><p className="text-2xl font-bold text-[#482d39]">{stats.orders}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Package size={28}/></div>
          <div><p className="text-sm text-gray-500 font-bold">المنتجات</p><p className="text-2xl font-bold text-[#482d39]">{stats.products}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertTriangle size={28}/></div>
          <div><p className="text-sm text-gray-500 font-bold">تنبيهات المخزون</p><p className="text-2xl font-bold text-[#482d39]">{stats.lowStock}</p></div>
        </div>
      </div>
    </div>
  );
}
