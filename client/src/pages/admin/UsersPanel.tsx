import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Printer, Download, Search, Plus, UserCheck, UserX } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { Eye, EyeOff } from 'lucide-react';

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
  const itemsPerPage = 50;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/all-users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : (data.rows || []));
    } catch { toast.error("فشل جلب المستخدمين"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("تمت إضافة المستخدم");
        setForm({ name: '', email: '', password: '', role: 'admin' });
        setShowForm(false);
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل الإضافة");
      }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const handleRoleChange = (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'ترقية إلى مدير' : 'إلغاء صلاحية المدير';
    setConfirmState({
      isOpen: true,
      message: `هل أنت متأكد من ${action} للمستخدم "${user.name}"؟`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${user.id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` },
            body: JSON.stringify({ role: newRole })
          });
          if (res.ok) {
            toast.success(`تم ${action}`);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
          } else { toast.error("فشل التحديث"); }
        } catch { toast.error("خطأ"); }
      }
    });
  };

  const filteredAll = users.filter(u => !search || u.name?.includes(search) || u.email?.includes(search));
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage) || 1;
  const filtered = filteredAll.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    let csv = "الاسم,البريد,الدور,تاريخ التسجيل\n";
    filteredAll.forEach(u => { csv += `"${u.name}","${u.email}","${u.role}","${new Date(u.createdAt).toLocaleDateString('ar')}"\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "users.csv"; link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#6b174d]">إدارة المستخدمين ({users.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#6b174d] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={16}/> إضافة مدير جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddUser} className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="الاسم الكامل" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="border p-2 rounded" />
          <input required type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="border p-2 rounded" dir="ltr" />
          <div className="relative">
            <input required type={showPassword ? "text" : "password"} placeholder="كلمة المرور" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="border p-2 rounded w-full pl-10" dir="ltr" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6b174d]">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="border p-2 rounded">
            <option value="admin">مدير (Admin)</option>
            <option value="user">عميل عادي</option>
          </select>
          <div className="col-span-full flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded font-bold">إضافة</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 bg-gray-300 rounded">إلغاء</button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute right-3 top-2.5 text-gray-400"/>
          <input placeholder="ابحث..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} className="border p-2 pr-9 rounded w-full text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Printer size={14}/> طباعة</button>
          <button onClick={exportCSV} className="bg-white border text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1"><Download size={14}/> Excel</button>
        </div>
      </div>

      {loading ? <div className="text-center py-10">جاري التحميل...</div> : (
        <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto border rounded-lg">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
              <tr><th className="p-3">الاسم</th><th className="p-3">البريد</th><th className="p-3">الدور</th><th className="p-3">تاريخ التسجيل</th><th className="p-3">إجراء</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-xs" dir="ltr">{u.email}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-[#C9A84C] text-white' : 'bg-gray-100 text-gray-700'}`}>{u.role === 'admin' ? 'مدير' : 'عميل'}</span></td>
                  <td className="p-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar')}</td>
                  <td className="p-3">
                    <button onClick={() => handleRoleChange(u)} className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                      {u.role === 'admin' ? <><UserX size={14}/> إلغاء المدير</> : <><UserCheck size={14}/> ترقية إلى مدير</>}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">لا يوجد مستخدمون</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">عرض {filtered.length} من {filteredAll.length}</span>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">السابق</button>
          <span className="px-3 py-1 bg-[#6b174d] text-white rounded text-sm">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">التالي</button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}); }}
        onCancel={() => setConfirmState({...confirmState, isOpen: false})}
      />
    </div>
  );
}
