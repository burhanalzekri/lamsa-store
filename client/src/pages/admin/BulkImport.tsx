import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(0);

  const handleFileChange = async (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setErrors([]);
    setRows([]);
    setSuccess(0);

    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      // التحقق من البيانات
      const validationErrors: string[] = [];
      json.forEach((row, i) => {
        if (!row.name) validationErrors.push(`الصف ${i + 2}: اسم المنتج مفقود`);
        if (!row.price || Number(row.price) <= 0) validationErrors.push(`الصف ${i + 2}: السعر مطلوب`);
        if (!row.category) validationErrors.push(`الصف ${i + 2}: الفئة مفقودة`);
      });

      setRows(json);
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        toast.error(`⚠️ ${validationErrors.length} مشكلة في الملف`);
      } else {
        toast.success(`✅ ${json.length} منتج جاهز للاستيراد`);
      }
    } catch (err) {
      toast.error('فشل قراءة الملف — تأكد أنه Excel صالح');
      console.error(err);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'فستان سهرة',
        category: 'فساتين',
        price: 15000,
        compareAtPrice: 20000,
        stock: 10,
        description: 'فستان أنيق للسهرات',
        imageUrl: 'https://example.com/image.jpg',
        badge: 'جديد',
        material: 'حرير',
      },
      {
        name: 'حذاء رياضي',
        category: 'أحذية',
        price: 8000,
        compareAtPrice: 0,
        stock: 20,
        description: 'حذاء مريح',
        imageUrl: 'https://example.com/image2.jpg',
        badge: 'الأكثر مبيعاً',
        material: 'جلد',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'lamsa-products-template.xlsx');
    toast.success('تم تحميل القالب');
  };

  const handleImport = async () => {
    if (rows.length === 0 || errors.length > 0) {
      return toast.error('لا توجد منتجات صالحة للاستيراد');
    }

    setImporting(true);
    setSuccess(0);

    try {
      const token = localStorage.getItem('lamsa_token');
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ products: rows }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.imported || rows.length);
        toast.success(`✅ تم استيراد ${data.imported || rows.length} منتج بنجاح!`);
      } else {
        toast.error(data.error || 'فشل الاستيراد');
      }
    } catch (err) {
      toast.error('خطأ في الاتصال');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRows([]);
    setErrors([]);
    setSuccess(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* العنوان */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#2a1a21]">📤 إضافة منتجات بالجملة</h2>
          <p className="text-gray-500 text-sm mt-1">ارفع ملف Excel لإضافة منتجات متعددة في نفس الوقت</p>
        </div>
        <button onClick={downloadTemplate} className="bg-white border-2 border-[#2a1a21] text-[#2a1a21] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#2a1a21] hover:text-white transition">
          <Download size={16}/> تحميل القالب
        </button>
      </div>

      {/* منطقة الرفع */}
      {!file && (
        <label htmlFor="excel-upload" className="block cursor-pointer">
          <div className="border-4 border-dashed border-gray-300 hover:border-[#C9A84C] rounded-2xl p-12 text-center transition">
            <FileSpreadsheet size={64} className="mx-auto text-gray-400 mb-4"/>
            <p className="text-xl font-bold text-[#2a1a21] mb-2">اضغط لرفع ملف Excel</p>
            <p className="text-sm text-gray-500">يدعم ملفات .xlsx و .xls و .csv</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              id="excel-upload"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </label>
      )}

      {/* معاينة الملف */}
      {file && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={32} className="text-green-600"/>
              <div>
                <p className="font-bold text-[#2a1a21]">{file.name}</p>
                <p className="text-xs text-gray-500">{rows.length} صف</p>
              </div>
            </div>
            <button onClick={reset} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><X size={20}/></button>
          </div>

          {/* الأخطاء */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle size={18}/> مشاكل في الملف:</p>
              <ul className="text-sm text-red-600 space-y-1 list-disc list-inside max-h-40 overflow-y-auto">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* المعاينة */}
          {rows.length > 0 && errors.length === 0 && (
            <div>
              <h3 className="font-bold text-[#2a1a21] mb-2">معاينة المنتجات ({rows.length})</h3>
              <div className="overflow-x-auto max-h-96 border rounded-lg">
                <table className="w-full text-right text-sm">
                  <thead className="bg-[#482d39] text-white sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">الاسم</th>
                      <th className="p-2">الفئة</th>
                      <th className="p-2">السعر</th>
                      <th className="p-2">المخزون</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-gray-400">{i + 1}</td>
                        <td className="p-2 font-medium">{row.name}</td>
                        <td className="p-2 text-xs">{row.category}</td>
                        <td className="p-2 font-bold text-[#C9A84C]">{Number(row.price).toLocaleString()} ر.ي</td>
                        <td className="p-2">{row.stock || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* زر الاستيراد */}
          {rows.length > 0 && errors.length === 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? <><Loader2 className="animate-spin" size={20}/> جاري الاستيراد...</> : <><CheckCircle size={20}/> استيراد {rows.length} منتج</>}
            </button>
          )}

          {/* رسالة النجاح */}
          {success > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-2"/>
              <p className="text-lg font-bold text-green-800">✅ تم استيراد {success} منتج بنجاح!</p>
              <button onClick={reset} className="mt-3 bg-green-600 text-white px-6 py-2 rounded-lg font-bold">استيراد المزيد</button>
            </div>
          )}
        </div>
      )}

      {/* معلومات إضافية */}
      {!file && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-bold text-blue-800 mb-2">💡 كيف تستخدم الملف؟</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside pr-4">
            <li>اضغط "تحميل القالب" لتحميل ملف Excel جاهز.</li>
            <li>افتح الملف في Excel أو Google Sheets.</li>
            <li>عدّل/أضف المنتجات (استبدل بيانات القالب).</li>
            <li>احفظ الملف ثم ارفعه هنا.</li>
            <li>راجع المعاينة → اضغط "استيراد".</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2"><b>ملاحظة:</b> الأعمدة المطلوبة: name, category, price. الباقي اختياري.</p>
        </div>
      )}
    </div>
  );
}
