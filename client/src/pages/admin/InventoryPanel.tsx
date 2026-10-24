import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Minus, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc, type RouterOutputs } from "@/lib/trpc";

type Product = RouterOutputs["admin"]["products"][number];

export default function AdminInventory() {
  const utils = trpc.useUtils();
  const products = trpc.admin.products.useQuery();
  const setStock = trpc.admin.inventory.setStock.useMutation({
    onSuccess: async () => { await Promise.all([utils.admin.products.invalidate(), utils.admin.overview.invalidate(), utils.store.products.invalidate()]); toast.success("تم تحديث رصيد المخزون."); },
    onError: error => toast.error(error.message || "تعذر تحديث المخزون."),
  });
  const addVariant = trpc.admin.inventory.addVariant.useMutation({
    onSuccess: async () => { await Promise.all([utils.admin.products.invalidate(), utils.admin.overview.invalidate(), utils.store.products.invalidate()]); toast.success("أُضيف اللون إلى المنتج."); setProductId(""); document.getElementById("adm-add-color-dialog")?.classList.remove("is-open"); },
    onError: error => toast.error(error.message || "تعذر إضافة اللون."),
  });
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#eee6d8");
  const [stock, setStockDraft] = useState("0");
  const rows = useMemo(() => (products.data ?? []).flatMap(product => product.colors.map(color => ({ product, color })))
    .filter(row => `${row.product.name} ${row.product.category} ${row.color.name}`.toLowerCase().includes(search.trim().toLowerCase())), [products.data, search]);
  const units = rows.reduce((total, row) => total + row.color.stock, 0);
  const low = rows.filter(row => row.color.stock > 0 && row.color.stock <= 3).length;
  const empty = rows.filter(row => row.color.stock === 0).length;

  const adjust = (variantId: string, currentStock: number, delta: number) => {
    setStock.mutate({ variantId, stock: Math.max(0, currentStock + delta) });
  };
  const submitVariant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productId) { toast.error("اختاري المنتج أولًا."); return; }
    addVariant.mutate({ productId, variant: { name: colorName.trim(), hex: colorHex, stock: Number(stock) } });
  };

  if (products.isLoading) return <div className="adm-state-card">جارٍ تحميل أرصدة المخزون…</div>;
  if (products.error) return <div className="adm-state-card adm-error-card">تعذر تحميل المخزون: {products.error.message}</div>;

  return (
    <>
      <div className="adm-metric-grid adm-inventory-metrics">
        <article className="adm-metric"><div className="adm-metric-top"><span>إجمالي الوحدات</span><span>▦</span></div><strong>{units}</strong><small>موزعة على {rows.length} لونًا</small></article>
        <article className="adm-metric"><div className="adm-metric-top"><span>قرب النفاد</span><AlertTriangle size={17} /></div><strong className={low ? "adm-warning-text" : ""}>{low}</strong><small>من ١ إلى ٣ قطع</small></article>
        <article className="adm-metric"><div className="adm-metric-top"><span>ألوان نفدت</span><span>○</span></div><strong>{empty}</strong><small>رصيد صفر</small></article>
        <article className="adm-metric"><div className="adm-metric-top"><span>المنتجات النشطة</span><span>◈</span></div><strong>{products.data?.filter(product => product.active).length ?? 0}</strong><small>من قاعدة بيانات المتجر</small></article>
      </div>
      <section className="adm-panel adm-data-panel">
        <div className="adm-table-toolbar"><label className="adm-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحثي بالمنتج أو اللون" /></label><button className="adm-primary-button" onClick={() => { setProductId(products.data?.[0]?.id ?? ""); setColorName(""); setColorHex("#eee6d8"); setStockDraft("0"); document.getElementById("adm-add-color-dialog")?.classList.add("is-open"); }} disabled={!products.data?.length}><Plus size={16} /> إضافة لون</button></div>
        <div className="adm-table-scroll"><table className="adm-table"><thead><tr><th>المنتج</th><th>اللون</th><th>رصيد المخزون</th><th>الحالة</th><th>تعديل الرصيد</th></tr></thead><tbody>
          {rows.map(({ product, color }) => <tr key={color.id}>
            <td><div className="adm-product-cell">{product.image ? <img className="adm-product-image" src={product.image} alt="" /> : <span className="adm-product-placeholder">◈</span>}<div><b>{product.name}</b><small>{product.category}</small></div></div></td>
            <td><span className="adm-color-name"><i style={{ backgroundColor: color.hex }} />{color.name}</span></td>
            <td><b className={color.stock <= 3 ? "adm-warning-text" : ""}>{color.stock}</b> قطعة</td>
            <td><span className={`adm-status ${color.stock === 0 ? "adm-status-cancelled" : color.stock <= 3 ? "adm-status-processing" : "adm-status-complete"}`}>{color.stock === 0 ? "نفد" : color.stock <= 3 ? "منخفض" : "متوفر"}</span></td>
            <td><div className="adm-stock-control"><button disabled={setStock.isPending || color.stock === 0} onClick={() => adjust(color.id, color.stock, -1)} aria-label={`تقليل ${product.name} ${color.name}`}><Minus size={14} /></button><span>{color.stock}</span><button disabled={setStock.isPending} onClick={() => adjust(color.id, color.stock, 1)} aria-label={`زيادة ${product.name} ${color.name}`}><Plus size={14} /></button></div></td>
          </tr>)}
          {!rows.length && <tr><td colSpan={5}><p className="adm-empty-state">{search ? "لا توجد نتائج." : "لا توجد منتجات أو ألوان بعد. أضيفي المنتجات من قسم المنتجات."}</p></td></tr>}
        </tbody></table></div>
        <div className="adm-table-footer">أرصدة المخزون محفوظة في قاعدة البيانات · تغيير الرصيد هنا ينعكس على الكمية المتاحة في المتجر</div>
      </section>
      <div className="adm-dialog-backdrop" id="adm-add-color-dialog" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.classList.remove("is-open"); }}>
        <section className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="adm-add-color-title">
          <div className="adm-dialog-heading"><div><span className="adm-kicker">متغير جديد</span><h2 id="adm-add-color-title">إضافة لون للمنتج</h2></div><button className="adm-icon-button" onClick={() => document.getElementById("adm-add-color-dialog")?.classList.remove("is-open")} aria-label="إغلاق">×</button></div>
          <form className="adm-form" onSubmit={event => { submitVariant(event); }}>
            <label className="adm-field">المنتج<select required value={productId} onChange={event => setProductId(event.target.value)}><option value="" disabled>اختاري منتجًا</option>{products.data?.map((product: Product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <label className="adm-field">اسم اللون<input required maxLength={80} value={colorName} onChange={event => setColorName(event.target.value)} placeholder="مثال: بيج رملي" /></label>
            <label className="adm-field">لون العرض<input type="color" value={colorHex} onChange={event => setColorHex(event.target.value)} /></label>
            <label className="adm-field">الكمية المتوفرة<input required type="number" min="0" max="1000000" step="1" value={stock} onChange={event => setStockDraft(event.target.value)} /></label>
            <div className="adm-dialog-actions"><button type="button" className="adm-secondary-button" onClick={() => document.getElementById("adm-add-color-dialog")?.classList.remove("is-open")}>إلغاء</button><button className="adm-primary-button" type="submit" disabled={addVariant.isPending}>{addVariant.isPending ? "جارٍ الحفظ…" : "حفظ اللون"}</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
