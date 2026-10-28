import { useState, useEffect } from 'react';
import { Package, Printer, Download, AlertTriangle, TrendingUp, DollarSign, Boxes, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '../../hooks/useSettings';

export default function InventoryReport() {
  const { currency } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'out' | 'low' | 'active'>('all');

  useEffect(() => {
    fetch('/api/admin/inventory-report', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lamsa_token')}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => toast.error('فشل جلب التقرير'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data?.products?.filter((p: any) => {
    if (filter === 'out') return p.stock === 0;
    if (filter === 'low') return p.stock > 0 && p.stock <= 5;
    if (filter === 'active') return p.active === 1;
    return true;
  }) || [];

  const handlePrint = () => window.print();

  const handleExport = () => {
    let csv = `"المنتج","الفئة","المخزون","سعر البيع","سعر التكلفة","قيمة المخزون","الحالة"\n`;
    data.products.forEach((p: any) => {
      const status = p.stock === 0 ? 'نفد' : p.stock <= 5 ? 'منخفض' : 'متوفر';
      csv += `"${p.name}","${p.category}","${p.stock}","${p.priceHalalas/100}","${p.costHalalas/100}","${p.totalValue/100}","${status}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-${Date.now()}.csv`;
    link.click();
    toast.success("تم تصدير التقرير");
  };

  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#482d39]"/></div>;
  if (!data) return <div className="text-center py-10 text-red-500">لا توجد بيانات</div>;

  return (
    <div className="space-y-6" id="inventory-report">
      {/* عنوان التقرير (يظهر فقط عند الطباعة) */}
      <div className="print-only-header hidden print:block">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 10px 0', padding: '12px 0', borderBottom: '3px solid #C9A84C', color: '#2a1a21' }}>
          📦 تقرير المخزون
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '12px' }}>
          تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      {/* العنوان والأزرار */}
      <div className="flex justify-between items-center flex-wrap gap-3 no-print">
        <h1 className="text-2xl font-bold text-[#2a1a21] no-print">📦 تقرير المخزون</h1>
        <div className="flex gap-2 no-print">
          <button onClick={handlePrint} className="bg-white border-2 border-[#2a1a21] text-[#2a1a21] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#2a1a21] hover:text-white transition">
            <Printer size={18}/> طباعة
          </button>
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
            <Download size={18}/> تصدير Excel
          </button>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stats-cards no-print">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 text-white p-2 rounded-lg icon-hide-print"><Boxes size={20}/></div>
            <p className="text-black text-sm font-bold title-print">إجمالي المنتجات</p>
          </div>
          <p className="text-2xl font-bold text-[#2a1a21] value-print">{data.summary.totalProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 text-white p-2 rounded-lg icon-hide-print"><DollarSign size={20}/></div>
            <p className="text-black text-sm font-bold title-print">قيمة المخزون</p>
          </div>
          <p className="text-2xl font-bold text-[#2a1a21] value-print">{Number(data.summary.totalValue).toLocaleString()} {currency}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 text-white p-2 rounded-lg icon-hide-print"><AlertTriangle size={20}/></div>
            <p className="text-black text-sm font-bold title-print">منتجات منخفضة</p>
          </div>
          <p className="text-2xl font-bold text-orange-600 value-print">{data.summary.lowStock}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500 text-white p-2 rounded-lg icon-hide-print"><AlertTriangle size={20}/></div>
            <p className="text-black text-sm font-bold title-print">منتجات نفدت</p>
          </div>
          <p className="text-2xl font-bold text-red-600 value-print">{data.summary.outOfStock}</p>
        </div>
      </div>

      {/* فلاتر */}
      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm w-fit border filters no-print">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'active', label: 'نشط' },
          { id: 'low', label: 'منخفض المخزون' },
          { id: 'out', label: 'نفد المخزون' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${filter === f.id ? 'bg-[#482d39] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{f.label}</button>
        ))}
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="p-3">المنتج</th><th className="p-3">الفئة</th><th className="p-3">المخزون</th><th className="p-3">سعر البيع</th><th className="p-3">قيمة المخزون</th><th className="p-3">الحالة</th></tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-xs text-gray-500">{p.category}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span>
                </td>
                <td className="p-3">{Number(p.priceHalalas/100).toLocaleString()} {currency}</td>
                <td className="p-3 font-bold text-[#482d39]">{Number(p.totalValue/100).toLocaleString()} {currency}</td>
                <td className="p-3">
                  {p.stock === 0 ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">نفد</span> :
                   p.stock <= 5 ? <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">منخفض</span> :
                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">متوفر</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">لا توجد منتجات مطابقة</td></tr>}
          </tbody>
        </table>
      </div>

      {/* الطباعة */}
      <style>{`
        @media print {
          /* إخفاء كل شيء */
          body * {
            visibility: hidden;
          }
          
          /* إظهار التقرير فقط */
          #inventory-report, #inventory-report * {
            visibility: visible;
          }
          
          /* تثبيت التقرير في أعلى الصفحة */
          #inventory-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px;
            background: white;
            color: black;
          }
          
          /* إخفاء السايدبار والشريط العلوي */
          aside, nav, header, footer {
            display: none !important;
          }
          
          /* إخفاء الأزرار */
          button {
            display: none !important;
          }
          
          /* إخفاء الفلاتر */
          .no-print {
            display: none !important;
          }
          
          /* تنسيق العنوان */
          #inventory-report h1 {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 0 0 20px 0;
            padding: 12px 0;
            border-bottom: 3px solid #C9A84C;
            color: #2a1a21;
            page-break-after: avoid;
          }
          
          /* تنسيق البطاقات الإحصائية */
          .stats-cards {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid;
          }
          
          .stats-cards > div {
            background: #FAF3E0 !important;
            border: 1px solid #C9A84C !important;
            border-radius: 8px !important;
            padding: 10px !important;
            text-align: center !important;
          }
          
          .stats-cards > div > div:first-child {
            display: none !important;
          }
          
          .stats-cards p {
            margin: 0 !important;
            font-size: 10px !important;
            color: #666 !important;
          }
          
          .stats-cards p:last-child {
            font-size: 16px !important;
            font-weight: bold !important;
            color: #2a1a21 !important;
            margin-top: 5px !important;
          }
          
          /* تنسيق الجدول */
          #inventory-report table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
            margin-top: 10px !important;
            page-break-inside: auto;
          }
          
          #inventory-report table th {
            background: #482d39 !important;
            color: white !important;
            font-weight: bold !important;
            padding: 8px 6px !important;
            border: 1px solid #999 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            text-align: right;
          }
          
          #inventory-report table td {
            padding: 6px !important;
            border: 1px solid #999 !important;
            text-align: right;
          }
          
          #inventory-report table tr {
            page-break-inside: avoid;
          }
          
          #inventory-report table tr:nth-child(even) {
            background: #FAF3E0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* إخفاء شارة الحالة (اختياري) */
          #inventory-report table span {
            background: transparent !important;
            padding: 0 !important;
            font-weight: bold !important;
          }
          
          /* صفحة A4 */
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
