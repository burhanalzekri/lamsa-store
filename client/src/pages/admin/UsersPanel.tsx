import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Printer, Download, Search } from 'lucide-react';

export default function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetch('/api/admin/all-users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : (d.rows || [])); setLoading(false); }).catch(() => { toast.error("فشل جلب المستخدمين"); setLoading(false); });
  }, []);

  const filteredAll = users.filter(u => !search || u.name?.includes(search) || u.email?.includes(search));
  const totalPages = Math.ceil(filteredAll.length / itemsPerPage) || 1;
  const filtered = filteredAll.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    let csv = "الاسم,البريد,الدور,تاريخ التسجيل\n";
    filteredAll.forEach(u => { csv += `"${u.name}","${u.email}","${u.role}","${new Date(u.createdAt).toLocaleDateString('ar')}"\n`; });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "users.csv"; link.click();
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-[#482d39] mb-6">إدارة المستخدمين ({users.length})</h2>

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

      <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto border rounded-lg">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
            <tr><th className="p-3">الاسم</th><th className="p-3">البريد</th><th className="p-3">الدور</th><th className="p-3">تاريخ التسجيل</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-xs" dir="ltr">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-[#C9A84C] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role === 'admin' ? 'مدير' : 'عميل'}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar')}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">لا يوجد مستخدمون</td></tr>}
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
