import { useState, useEffect } from 'react';
import { Search, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users-simple');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
      else toast.error('فشل تحميل المستخدمين');
    } catch (e) {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        toast.success('تم تحديث الصلاحية');
        fetchUsers(); // إعادة جلب البيانات
      } else {
        toast.error('فشل تحديث الصلاحية');
      }
    } catch (e) { toast.error('خطأ في الاتصال'); }
  };

  const filtered = users.filter(u => 
    `${u.name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">جارٍ تحميل الحسابات…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#482d39]">إدارة المستخدمين</h2>
        <span className="text-sm text-gray-500">{users.length} حساب</span>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد..."
          className="w-full pr-10 pl-4 py-2.5 border rounded-xl outline-none focus:border-[#482d39]"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right">الحساب</th>
              <th className="p-3 text-center">الدور</th>
              <th className="p-3 text-center">إدارة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' ? <ShieldCheck size={18} className="text-[#C9A84C]"/> : <UserRound size={18} className="text-gray-400"/>}
                    <div>
                      <div className="font-bold">{u.name || 'بدون اسم'}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role === 'admin' ? 'مشرف' : 'مستخدم'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <select 
                    value={u.role} 
                    onChange={e => changeRole(u.id, e.target.value)}
                    disabled={u.id === currentUserId}
                    className="border rounded p-1 text-sm disabled:opacity-50"
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مشرف</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
