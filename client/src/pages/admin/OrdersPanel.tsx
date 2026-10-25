import { useState, useEffect } from 'react';
import { ClipboardList, Search, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/catalog';

const statuses = [
  { id: "all", label: "الكل" }, { id: "pending", label: "جديدة" }, { id: "processing", label: "قيد التجهيز" },
  { id: "shipped", label: "تم الشحن" }, { id: "delivered", label: "مكتملة" }, { id: "cancelled", label: "ملغاة" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders-simple')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError('فشل تحميل البيانات');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchSearch = `${order.orderNumber} ${order.customerName} ${order.phone} ${order.city}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="p-8 text-center">جارٍ تحميل الطلبات…</div>;
  if (error) return <div className="p-8 text-center text-red-500">تعذر تحميل الطلبات: {error}</div>;

  const unpaid = orders.filter(o => o.paymentStatus === 'unpaid').length;
  const paidTotal = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <span className="text-xs text-gray-500">الطلبات</span>
          <p className="text-2xl font-bold text-[#482d39]">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <span className="text-xs text-gray-500">بانتظار الدفع</span>
          <p className="text-2xl font-bold text-[#482d39]">{unpaid}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <span className="text-xs text-gray-500">مدفوع مسجل</span>
          <p className="text-2xl font-bold text-[#482d39]">{formatPrice(paidTotal)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold">البيانات مقصورة على المشرفين</span>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالطلب أو العميل..." 
              className="pr-9 pl-3 py-2 text-sm border rounded-lg outline-none focus:border-[#482d39] w-64" 
            />
          </div>
        </div>

        <div className="p-4 border-b flex gap-2 overflow-x-auto">
          {statuses.map(s => (
            <button 
              key={s.id} onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition ${statusFilter === s.id ? 'bg-[#482d39] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3 font-bold">رقم الطلب</th>
                <th className="p-3 font-bold">العميل</th>
                <th className="p-3 font-bold">التاريخ</th>
                <th className="p-3 font-bold">الإجمالي</th>
                <th className="p-3 font-bold">حالة الطلب</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-bold text-[#482d39]">{order.orderNumber || '#' + order.id}</td>
                  <td className="p-3">
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-YE') : '-'}</td>
                  <td className="p-3 font-bold text-[#d93844]">{formatPrice(order.total)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                      {statuses.find(s => s.id === order.status)?.label || order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
                    <p>لا توجد طلبات محفوظة حتى الآن.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
