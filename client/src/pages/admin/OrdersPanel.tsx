import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Printer, Download, Search } from 'lucide-react';

export default function OrdersPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/all-orders', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : (data.rows || []));
    } catch { toast.error("فشل جلب الطلبات"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      toast.success("تم تحديث الحالة");
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { toast.error("فشل التحديث"); }
  };

  const filteredAll = orders.filter(o => {
    const matchSearch = !search || (o.customerName?.includes(search)) || (o.phone?.includes(search)) || (o.id?.includes(search));
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage) || 1;
  const filtered = filteredAll.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    let csv = "رقم الطلب,العميل,الهاتف,الإجمالي,الحالة\n";
    filteredAll.forEach(o => { csv += `"${o.orderNumber || o.id}","${o.customerName}","${o.phone}",${o.totalAmount},"${o.status}"\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "orders.csv"; link.click();
  };

  const statusLabel: any = { pending: "قيد الانتظار", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };
  const statusColor: any = { pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">إدارة الطلبات ({orders.length})</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-2.5 text-gray-400"/>
            <input placeholder="ابحث..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="border p-2 pr-9 rounded w-full text-sm" />
          </div>
          <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setPage(1);}} className="border p-2 rounded text-sm">
            <option value="all">كل الحالات</option><option value="pending">قيد الانتظار</option><option value="processing">قيد التجهيز</option><option value="shipped">تم الشحن</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Printer size={14}/> طباعة</button>
          <button onClick={exportCSV} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Download size={14}/> Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto border rounded-lg">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
            <tr><th className="p-3">رقم الطلب</th><th className="p-3">العميل</th><th className="p-3">الهاتف</th><th className="p-3">الإجمالي</th><th className="p-3">الحالة</th><th className="p-3">تحديث</th></tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{o.orderNumber || o.id.slice(0,8)}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3" dir="ltr">{o.phone}</td>
                <td className="p-3 font-bold">{Number(o.totalAmount).toLocaleString()} ر.ي</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[o.status] || 'bg-gray-100'}`}>{statusLabel[o.status] || o.status}</span></td>
                <td className="p-3">
                  <select value={o.status || 'pending'} onChange={e => updateStatus(o.id, e.target.value)} className="border p-1 rounded text-xs">
                    <option value="pending">قيد الانتظار</option><option value="processing">قيد التجهيز</option><option value="shipped">تم الشحن</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">لا توجد طلبات</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">عرض {filtered.length} من {filteredAll.length}</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">السابق</button>
          <span className="px-3 py-1 bg-[#482d39] text-white rounded text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">التالي</button>
        </div>
      </div>
    </div>
  );
}
