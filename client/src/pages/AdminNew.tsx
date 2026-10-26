import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, ShoppingBag, Users, Package, DollarSign, Upload, X, Check, Search, Menu } from "lucide-react";
import AdminSidebar from "./admin/AdminSidebar";

export default function AdminNew() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <div className="hidden md:block">
        <AdminSidebar activeTab={tab} setActiveTab={setTab} />
      </div>

      {/* القائمة الجانبية للجوال */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-white h-full shadow-xl overflow-y-auto">
            <AdminSidebar activeTab={tab} setActiveTab={(t) => { setTab(t); setSidebarOpen(false); }} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[#482d39]"><Menu size={24} /></button>
          <h1 className="font-bold text-[#482d39]">لوحة لمسة</h1>
          <div className="w-6"></div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "users" && <UsersTab />}
          {(tab === "coupons" || tab === "reports" || tab === "settings") && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-bold mb-2">قيد التطوير</p>
              <p>هذا القسم سيكون متاحاً قريباً</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============ Dashboard ============
function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/admin/stats-new").then(r => r.json()).then(setStats).catch(() => setError(true));
  }, []);
  if (error) return <div className="text-center py-10 text-red-500">فشل تحميل الإحصائيات</div>;
  if (!stats) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#482d39]"/></div>;
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">نظرة عامة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package/>} label="المنتجات" value={stats.products || 0} color="bg-blue-500" />
        <StatCard icon={<ShoppingBag/>} label="الطلبات" value={stats.orders || 0} color="bg-purple-500" />
        <StatCard icon={<Users/>} label="المستخدمون" value={stats.users || 0} color="bg-green-500" />
        <StatCard icon={<DollarSign/>} label="الإيرادات" value={Number(stats.revenue || 0).toLocaleString() + " ر.ي"} color="bg-[#C9A84C]" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`${color} text-white p-4 rounded-xl`}>{icon}</div>
      <div><p className="text-gray-500 text-sm">{label}</p><p className="text-2xl font-bold text-[#482d39]">{value}</p></div>
    </div>
  );
}

// ============ Products ============
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "فساتين", imageUrl: "", description: "" });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/all-products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (data.rows || []));
    } catch { toast.error("فشل الجلب"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const filtered = useMemo(() => {
    return products.filter(p => p.name.includes(search) || (p.category && p.category.includes(search)));
  }, [products, search]);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      toast.success("تم رفع الصورة");
    } catch { toast.error("فشل الرفع"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEditing = !!editing;
    const url = isEditing ? `/api/admin/products/${editing}/update` : "/api/admin/products/new";
    const method = isEditing ? "PUT" : "POST";
    const payload = {
        name: form.name, price: Number(form.price), stock: Number(form.stock || 0),
        category: form.category || "عام", imageUrl: form.imageUrl || "", description: form.description || ""
    };
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? "تم التعديل" : "تمت الإضافة");
        setForm({ name: "", price: "", stock: "", category: "فساتين", imageUrl: "", description: "" });
        setEditing(null); setShowForm(false); 
        if (isEditing) setProducts(prev => prev.map(p => p.id === editing ? { ...p, ...payload, price: payload.price } : p));
        else await fetchProducts();
      } else { 
        const err = await res.json(); toast.error("فشل الحفظ: " + (err.error || "خطأ")); 
      }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("تأكيد الحذف؟")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}/delete`, { method: "DELETE" });
      if (res.ok) toast.success("تم الحذف");
      else { toast.error("فشل الحذف"); fetchProducts(); }
    } catch { toast.error("فشل الاتصال"); fetchProducts(); }
  };

  const handleEdit = (p: any) => {
    setEditing(p.id);
    setForm({ 
        name: p.name, price: String(p.priceHalalas ? p.priceHalalas/100 : p.price || 0), 
        stock: String(p.stock || 0), category: p.category || "فساتين", 
        imageUrl: p.imageUrl || p.image || "", description: p.description || "" 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <h2 className="text-2xl font-bold text-[#482d39] whitespace-nowrap">المنتجات ({products.length})</h2>
            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute right-3 top-3 text-gray-400"/>
                <input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2.5 pr-9 rounded-lg w-full text-sm"/>
            </div>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: "", price: "", stock: "", category: "فساتين", imageUrl: "", description: "" }); setShowForm(true); }} className="bg-[#482d39] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#5a3a48] w-full md:w-auto justify-center">
          <Plus size={16}/> إضافة منتج
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="اسم المنتج *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2.5 rounded-lg" />
          <input required type="number" placeholder="السعر (ريال) *" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border p-2.5 rounded-lg" />
          <input type="number" placeholder="المخزون" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border p-2.5 rounded-lg" />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border p-2.5 rounded-lg bg-white">
            <option value="فساتين">فساتين</option><option value="عبايات">عبايات</option><option value="حقائب">حقائب</option><option value="أحذية">أحذية</option>
          </select>
          <textarea placeholder="الوصف" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border p-2.5 rounded-lg md:col-span-2" rows={2} />
          <div className="md:col-span-2 flex flex-col gap-3 border-t pt-4">
            <input placeholder="رابط الصورة" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="border p-2.5 rounded-lg text-sm" dir="ltr" />
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <Upload size={16}/> {uploading ? "جاري الرفع..." : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {form.imageUrl && (
                <div className="flex items-center gap-2">
                  <img src={form.imageUrl} alt="معاينة" className="w-12 h-12 object-cover rounded border" />
                  <button type="button" onClick={() => setForm({...form, imageUrl: ""})} className="text-red-500"><X size={16}/></button>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700">
              <Check size={16}/> {editing ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-bold">إلغاء</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#482d39]"/></div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#FAF3E0] text-[#482d39]">
              <tr><th className="p-4">المنتج</th><th className="p-4">السعر</th><th className="p-4">المخزون</th><th className="p-4">الفئة</th><th className="p-4">إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const stock = p.stock || 0;
                return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover border bg-gray-100" onError={(e:any) => e.target.src='https://via.placeholder.com/40'}/> : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center"><Package size={16}/></div>}
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-4 font-bold text-[#482d39]">{p.priceHalalas ? (p.priceHalalas/100).toLocaleString() : (p.price || 0)} ر.ي</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{stock}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{p.category}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="تعديل"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="حذف"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-6 text-gray-500">لا توجد نتائج</p>}
        </div>
      )}
    </div>
  );
}

// ============ Orders ============
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/all-orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : (data.rows || []));
    } catch { toast.error("فشل الجلب"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      toast.success("تم تحديث الحالة");
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { toast.error("فشل التحديث"); }
  };

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = (o.customerName && o.customerName.includes(search)) || (o.phone && o.phone.includes(search)) || (o.id && o.id.includes(search));
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  const statusLabel: any = { pending: "قيد الانتظار", processing: "قيد التجهيز", shipped: "تم الشحن", completed: "مكتمل", cancelled: "ملغي" };
  const statusColor: any = { pending: "bg-yellow-100 text-yellow-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">الطلبات ({orders.length})</h2>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-3 text-gray-400"/>
            <input placeholder="ابحث بالاسم/الهاتف/الطلب..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2.5 pr-9 rounded-lg w-full text-sm"/>
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border p-2.5 rounded-lg text-sm bg-white">
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#FAF3E0] text-[#482d39]">
            <tr><th className="p-4">رقم الطلب</th><th className="p-4">العميل</th><th className="p-4">الهاتف</th><th className="p-4">الإجمالي</th><th className="p-4">الحالة</th><th className="p-4">تحديث</th></tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{o.orderNumber || o.id.slice(0,8)}</td>
                <td className="p-4 font-medium">{o.customerName}</td>
                <td className="p-4" dir="ltr">{o.phone}</td>
                <td className="p-4 font-bold">{o.totalAmount?.toLocaleString()} ر.ي</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[o.status] || "bg-gray-100"}`}>{statusLabel[o.status] || o.status}</span>
                </td>
                <td className="p-4">
                  <select value={o.status || "pending"} onChange={e => updateStatus(o.id, e.target.value)} className="border p-2 rounded-lg text-xs bg-white">
                    <option value="pending">قيد الانتظار</option>
                    <option value="processing">قيد التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-6 text-gray-500">لا توجد طلبات</p>}
      </div>
    </div>
  );
}

// ============ Users ============
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/all-users").then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : (d.rows || [])); setLoading(false); }).catch(() => { toast.error("فشل الجلب"); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => u.name.includes(search) || (u.email && u.email.includes(search)));
  }, [users, search]);

  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">المستخدمون ({users.length})</h2>
      <div className="relative w-full md:w-64 mb-4">
        <Search size={16} className="absolute right-3 top-3 text-gray-400"/>
        <input placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2.5 pr-9 rounded-lg w-full text-sm"/>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#FAF3E0] text-[#482d39]">
            <tr><th className="p-4">الاسم</th><th className="p-4">البريد</th><th className="p-4">الدور</th><th className="p-4">تاريخ التسجيل</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-xs" dir="ltr">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-[#C9A84C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role === 'admin' ? 'مدير' : 'عميل'}
                  </span>
                </td>
                <td className="p-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
