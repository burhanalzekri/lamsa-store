import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function ReportsPanel() {
  const [data, setData] = useState<any>({ daily: [], topProducts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lamsa_token');
    fetch('/api/admin/reports/sales', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  const maxTotal = Math.max(...data.daily.map((d: any) => Number(d.total)), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#482d39] flex items-center gap-2"><BarChart3 size={28}/> تقارير المبيعات</h1>

      {/* رسم بياني للمبيعات اليومية */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp size={20}/> المبيعات اليومية (آخر 30 يوم)</h2>
        
        {data.daily.length === 0 ? (
          <p className="text-center text-gray-500 py-10">لا توجد بيانات بعد.</p>
        ) : (
          <div>
            {/* أعمدة الرسم البياني */}
            <div className="flex items-end justify-between gap-2 h-64 bg-gray-50 p-2 rounded-lg border">
              {data.daily.map((d: any, i: number) => {
                const height = (Number(d.total) / maxTotal) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-grow h-full justify-end">
                    <div 
                      className="w-full bg-[#d93844] rounded-t-sm transition-all hover:bg-[#b02a36]"
                      style={{ height: `${height}%`, minHeight: '5px' }}
                      title={`${Number(d.total).toLocaleString()} ر.ي`}
                    ></div>
                    <span className="text-[10px] text-gray-500 mt-1">{new Date(d.date).getDate()}</span>
                  </div>
                );
              })}
            </div>
            
            {/* ملخص أسفل الرسم */}
            <div className="mt-4 flex justify-between text-sm text-gray-600 border-t pt-2">
              <span>إجمالي المبيعات: <b className="text-[#d93844]">{data.daily.reduce((s: number, d: any) => s + Number(d.total), 0).toLocaleString()} ر.ي</b></span>
              <span>عدد الطلبات: <b>{data.daily.reduce((s: number, d: any) => s + Number(d.count), 0)}</b></span>
            </div>
          </div>
        )}
      </div>

      {/* المنتجات الأكثر مبيعاً */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">المنتجات الأكثر مبيعاً</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-gray-500">لا توجد بيانات بعد.</p>
        ) : (
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => {
              let name = p.names;
              if (name && name.startsWith('[')) {
                try {
                  const arr = JSON.parse(name);
                  name = Array.isArray(arr) ? arr.join(' + ') : name;
                } catch (e) { name = String(name).replace(/[\[\]"]/g, ''); }
              }
              return (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-[#482d39] truncate max-w-[200px]">{name || 'غير معروف'}</span>
                  <span className="text-[#d93844] font-bold">{Number(p.total).toLocaleString()} ر.ي</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
