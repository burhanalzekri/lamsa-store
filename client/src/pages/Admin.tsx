import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ClipboardList, LayoutDashboard, Users, Tag, Settings, DollarSign, ShoppingBag, AlertTriangle, TrendingUp, BarChart3, Layers } from 'lucide-react';
import ProductsPanel from './admin/ProductsPanel';
import CouponsPanel from './admin/CouponsPanel';
import SettingsPanel from './admin/SettingsPanel';
import ReportsPanel from './admin/ReportsPanel';
import VariantsPanel from './admin/VariantsPanel';
import { toast } from 'sonner';
import AdminSidebar from './admin/AdminSidebar';

export default function Admin({ user }: { user: any }) {
  const [tab, setTab] = useState<'overview'|'products'|'orders'|'users'|'coupons'|'settings'|'reports'|'variants'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { localStorage.removeItem('lamsa_user'); localStorage.removeItem('lamsa_token'); window.location.href = '/'; };
  const [stats, setStats] = useState<any>({ products: 0, orders: 0, revenue: 0, lowStock: 0, pendingOrders: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch('/api/admin/chart-data', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setChartData(Array.isArray(data) ? data : []);
      }
    } catch (e) {}
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lamsa_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, oRes, uRes, rRes, lRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/recent-orders', { headers }),
        fetch('/api/admin/low-stock', { headers })
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (oRes.ok) setOrders(await oRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (rRes.ok) setRecentOrders(await rRes.json());
      if (lRes.ok) setLowStockItems(await lRes.json());
    } catch (e) {}
  };

  useEffect(() => { if (user?.role === 'admin') { fetchData(); fetchChartData(); } }, [user]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('lamsa_token');
      if (!token) return toast.error("يجب تسجيل الدخول");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("تم تحديث حالة الطلب بنجاح!");
        fetchData();
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } catch (e) { toast.error("حدث خطأ في الاتصال"); }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        toast.success("تم تحديث الصلاحية");
        fetchData();
      } else {
        toast.error("فشل التحديث");
      }
    } catch (e) { toast.error("خطأ"); }
  };

  if (!user || user.role !== 'admin') return <div className="p-10 text-center font-bold text-red-600">غير مصرح</div>;

  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearch || o.id.includes(orderSearch) || o.customerName.includes(orderSearch) || o.phone.includes(orderSearch);
    const matchFilter = orderFilter === 'all' || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f6f2]" dir="rtl">
      <AdminSidebar 
        tab={tab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {tab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#482d39]">نظرة عامة</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={24}/></div>
                <div><p className="text-xs text-gray-500">المبيعات</p><p className="text-lg font-bold text-[#34212a]">{Number(stats.revenue).toLocaleString()}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><ShoppingBag size={24}/></div>
                <div><p className="text-xs text-gray-500">الطلبات</p><p className="text-lg font-bold text-[#34212a]">{stats.orders}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Package size={24}/></div>
                <div><p className="text-xs text-gray-500">المنتجات</p><p className="text-lg font-bold text-[#34212a]">{stats.products}</p></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600"><TrendingUp size={24}/></div>
                <div><p className="text-xs text-gray-500">طلبات جديدة</p><p className="text-lg font-bold text-[#34212a]">{stats.pendingOrders}</p></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
            <h2 className="text-lg font-bold text-[#482d39] mb-4">📈 المبيعات اليومية (آخر 7 أيام)</h2>
            {chartData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد بيانات كافية.</p>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#d93844" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-bold text-[#482d39] mb-4 flex items-center gap-2"><ShoppingBag size={20}/> آخر الطلبات</h2>
                {recentOrders.length === 0 ? <p className="text-gray-500 text-sm">لا توجد طلبات بعد.</p> : (
                  <div className="space-y-3">
                    {recentOrders.map(o => (
                      <div key={o.id} className="flex justify-between items-center border-b pb-2 text-sm">
                        <div><p className="font-bold text-[#34212a]">#{o.id}</p><p className="text-xs text-gray-500">{o.customerName}</p></div>
                        <div className="text-left"><p className="font-bold text-[#d93844]">{o.totalAmount} ر.ي</p><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{o.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-bold text-[#482d39] mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> تنبيهات المخزون</h2>
                {lowStockItems.length === 0 ? <p className="text-gray-500 text-sm">المخزون بحالة جيدة.</p> : (
                  <div className="space-y-3">
                    {lowStockItems.map(p => (
                      <div key={p.id} className="flex justify-between items-center border-b pb-2 text-sm">
                        <p className="font-bold text-[#34212a] truncate max-w-[150px]">{p.name}</p>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">باقي {p.stock}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {tab === 'products' && <ProductsPanel />}
        {tab === 'variants' && <VariantsPanel />}
        {tab === 'coupons' && <CouponsPanel />}
        {tab === 'reports' && <ReportsPanel />}
        {tab === 'settings' && <SettingsPanel />}
        
        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">الطلبات ({orders.length})</h2>
            
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input placeholder="ابحث برقم الطلب أو الاسم أو الهاتف..." value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} className="flex-grow border p-2 rounded-lg" />
              <select value={orderFilter} onChange={e=>setOrderFilter(e.target.value)} className="border p-2 rounded-lg bg-gray-50">
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="shipped">تم الشحن</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredOrders.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-bold text-[#482d39]">#{o.id}</p>
                    <p className="text-sm text-gray-500">{o.customerName} - {o.phone}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#d93844]">{o.totalAmount} ر.ي</span>
                    <select value={o.status} onChange={(e)=>handleUpdateStatus(o.id, e.target.value)} className="border p-1 rounded text-sm bg-gray-50">
                      <option value="pending">قيد الانتظار</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    <button onClick={() => setSelectedOrder(o)} className="text-[#482d39] bg-gray-100 px-3 py-1 rounded text-sm font-bold">تفاصيل</button>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && <p className="text-center text-gray-500 py-6">لا توجد طلبات مطابقة.</p>}
            </div>

            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#482d39]">تفاصيل الطلب #{selectedOrder.id}</h3>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500">✕</button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><b>العميل:</b> {selectedOrder.customerName}</p>
                    <p><b>الهاتف:</b> {selectedOrder.phone}</p>
                    <p><b>العنوان:</b> {selectedOrder.address}</p>
                    <p><b>الحالة:</b> {selectedOrder.status}</p>
                    <p><b>الإجمالي:</b> {selectedOrder.totalAmount} ر.ي</p>
                    <hr className="my-2"/>
                    <p className="font-bold">المنتجات:</p>
                    {(() => {
                      try {
                        const items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items;
                        if (Array.isArray(items)) {
                          return items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between bg-gray-50 p-2 rounded text-xs">
                              <span>{item.name || item.title || 'منتج'}</span>
                              <span>x{item.quantity}</span>
                            </div>
                          ));
                        }
                      } catch (e) {}
                      return <p className="text-gray-400">لا توجد تفاصيل</p>;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {tab === 'users' && (
          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">المستخدمون ({users.length})</h2>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50">
                  <div><p className="font-bold text-[#34212a]">{u.name}</p><p className="text-sm text-gray-500">{u.email}</p></div>
                  <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)} className="border p-1 rounded text-sm bg-white font-bold">
                    <option value="user">عميل</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
