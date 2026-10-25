import { useMemo, useState } from "react";
import { ClipboardList, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/catalog";

import orderStatusLabel from "@/pages/Admin";

type Order = any;
type Status = Order["status"];
const statuses: Array<{ id: Status | "all"; label: string }> = [
  { id: "all", label: "الكل" }, { id: "pending", label: "جديدة" }, { id: "processing", label: "قيد التجهيز" },
  { id: "shipped", label: "تم الشحن" }, { id: "delivered", label: "مكتملة" }, { id: "cancelled", label: "ملغاة" },
];

export default function AdminOrders() {
  const utils = { admin: { orders: { list: { invalidate: () => {} } }, overview: { invalidate: () => {} }, products: { invalidate: () => {} } }, store: { products: { invalidate: () => {} } } };
  const [query, setQuery] = useState({ data: [], isLoading: true, error: null });
  const setStatus = { mutate: async ({ orderId, status }: { orderId: number, status: string }) => { try { const res = await fetch("/api/admin/orders/" + orderId + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (res.ok) { setQuery(prev => ({ ...prev, data: prev.data.map(o => o.id === orderId ? { ...o, status } : o) })); toast.success("تم تحديث الحالة"); } } catch(e) { toast.error("فشل"); } }, isPending: false };
    
    
  });
  const setPayment = { mutate: async ({ orderId, paymentStatus }: { orderId: number, paymentStatus: string }) => { try { const res = await fetch("/api/admin/orders/" + orderId + "/payment", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus }) }); if (res.ok) { setQuery(prev => ({ ...prev, data: prev.data.map(o => o.id === orderId ? { ...o, paymentStatus } : o) })); toast.success("تم تحديث الدفع"); } } catch(e) { toast.error("فشل"); } }, isPending: false };
    
    
  });
  useEffect(() => { fetch("/api/admin/orders-simple").then(r => r.json()).then(data => { if (Array.isArray(data)) setQuery({ data, isLoading: false, error: null }); else setQuery({ data: [], isLoading: false, error: "Invalid data" }); }).catch(e => setQuery({ data: [], isLoading: false, error: e.message })); }, []);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => (query.data ?? []).filter(order =>
    (statusFilter === "all" || order.status === statusFilter) &&
    `${order.orderNumber} ${order.customerName} ${order.phone} ${order.city}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [query.data, statusFilter, search]);
  const allOrders = query.data ?? [];
  const unpaid = allOrders.filter(order => order.paymentStatus === "unpaid").length;
  const paidTotal = allOrders.filter(order => order.paymentStatus === "paid").reduce((total, order) => total + order.total, 0);

  if (query.isLoading) return <div className="adm-state-card">جارٍ تحميل الطلبات…</div>;
  if (query.error) return <div className="adm-state-card adm-error-card">تعذر تحميل الطلبات: {query.error.message}</div>;

  return (
    <section className="adm-panel adm-data-panel">
      <div className="adm-order-summary-row"><div><span className="adm-kicker">الطلبات المسجّلة</span><h2>تابعي الطلب من الاستلام حتى التسليم</h2><p>الطلبات تُنشأ من Checkout المسجل، وتغيير الحالة الملغاة يعيد الكمية للمخزون.</p></div><div className="adm-order-summary"><span>الطلبات</span><b>{allOrders.length}</b></div><div className="adm-order-summary"><span>بانتظار الدفع</span><b>{unpaid}</b></div><div className="adm-order-summary"><span>مدفوع مسجل</span><b>{formatPrice(paidTotal)}</b></div></div>
      <div className="adm-table-toolbar"><label className="adm-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحثي بالطلب أو العميل أو الجوال" /></label><span className="adm-payment-warning"><ShieldCheck size={14} /> الدفع يدوي في هذه النسخة؛ لا يوجد مزود دفع مرتبط</span></div>
      <div className="adm-order-filters">{statuses.map(status => <button key={status.id} className={statusFilter === status.id ? "adm-filter-active" : ""} onClick={() => setStatusFilter(status.id)}>{status.label}{status.id !== "all" && <small>{allOrders.filter(order => order.status === status.id).length}</small>}</button>)}</div>
      <div className="adm-table-scroll"><table className="adm-table adm-orders-table"><thead><tr><th>رقم الطلب</th><th>العميل وبيانات التوصيل</th><th>التاريخ</th><th>القطع</th><th>الإجمالي</th><th>الدفع</th><th>حالة الطلب</th></tr></thead><tbody>
        {rows.map(order => <tr key={order.id}>
          <td className="adm-order-id">{order.orderNumber}</td>
          <td><div className="adm-customer-cell"><b>{order.customerName}</b><small dir="ltr">{order.phone}</small><small>{order.city} · {order.address}</small></div></td>
          <td>{new Date(order.createdAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</td><td>{order.items}</td><td>{formatPrice(order.total)}</td>
          <td><select className={`adm-payment-select adm-payment-${order.paymentStatus}`} aria-label={`حالة الدفع ${order.orderNumber}`} value={order.paymentStatus} disabled={setPayment.isPending || order.paymentStatus === "refunded"} onChange={event => setPayment.mutate({ orderId: order.id, paymentStatus: event.target.value as "unpaid" | "paid" | "refunded" })}><option value="unpaid">غير مدفوع</option><option value="paid">مدفوع</option><option value="refunded">مسترد</option></select></td>
          <td><select className="adm-order-status-select" aria-label={`حالة الطلب ${order.orderNumber}`} value={order.status} disabled={setStatus.isPending || order.status === "cancelled"} onChange={event => setStatus.mutate({ orderId: order.id, status: event.target.value as Exclude<Status, "cancelled"> })}>{statuses.filter(status => status.id !== "all").map(status => <option key={status.id} value={status.id}>{status.label}</option>)}</select></td>
        </tr>)}
        {!rows.length && <tr><td colSpan={7}><div className="adm-empty-state"><ClipboardList size={24} /><p>{search ? "لا توجد طلبات تطابق البحث." : "لا توجد طلبات محفوظة حتى الآن."}</p></div></td></tr>}
      </tbody></table></div>
      <div className="adm-table-footer">تعرض الصفحة أحدث ٣٠٠ طلب · البيانات شخصية ومقصورة على المشرفين</div>
    </section>
  );
}
