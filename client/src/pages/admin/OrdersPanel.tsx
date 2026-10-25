import { useMemo, useState, useEffect } from "react";
import { ClipboardList, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/catalog";

// تعريف مبسط للطلب
type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  createdAt: string;
  items: number;
  total: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
};

const statuses = [
  { id: "all", label: "الكل" },
  { id: "pending", label: "جديدة" },
  { id: "processing", label: "قيد التجهيز" },
  { id: "shipped", label: "تم الشحن" },
  { id: "delivered", label: "مكتملة" },
  { id: "cancelled", label: "ملغاة" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // جلب البيانات من الـ API البسيط
  useEffect(() => {
    fetch("/api/admin/orders-simple")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
          setError(null);
        } else {
          setOrders([]);
          setError("البيانات المستلمة غير صالحة");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("تعذر الاتصال بالخادم");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // تحديث حالة الطلب
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        toast.success("تم تحديث حالة الطلب");
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
  };

  // تحديث حالة الدفع
  const handleUpdatePayment = async (orderId: number, newPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus as any } : o))
        );
        toast.success("تم تحديث حالة الدفع");
      } else {
        toast.error("فشل تحديث الدفع");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
  };

  // تصفية الطلبات
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch = `${order.orderNumber} ${order.customerName} ${order.phone} ${order.city}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const unpaid = orders.filter((o) => o.paymentStatus === "unpaid").length;
  const paidTotal = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  if (isLoading) return <div className="adm-state-card">جارٍ تحميل الطلبات…</div>;
  if (error) return <div className="adm-state-card adm-error-card">تعذر تحميل الطلبات: {error}</div>;

  return (
    <section className="adm-panel adm-data-panel">
      <div className="adm-order-summary-row">
        <div>
          <span className="adm-kicker">الطلبات المسجّلة</span>
          <h2>تابعي الطلب من الاستلام حتى التسليم</h2>
          <p>الطلبات تُنشأ من Checkout المسجل، وتغيير الحالة الملغاة يعيد الكمية للمخزون.</p>
        </div>
        <div className="adm-order-summary">
          <span>الطلبات</span>
          <b>{orders.length}</b>
        </div>
        <div className="adm-order-summary">
          <span>بانتظار الدفع</span>
          <b>{unpaid}</b>
        </div>
        <div className="adm-order-summary">
          <span>مدفوع مسجل</span>
          <b>{formatPrice(paidTotal)}</b>
        </div>
      </div>

      <div className="adm-table-toolbar">
        <label className="adm-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحثي بالطلب أو العميل أو الجوال"
          />
        </label>
        <span className="adm-payment-warning">
          <ShieldCheck size={14} /> الدفع يدوي في هذه النسخة؛ لا يوجد مزود دفع مرتبط
        </span>
      </div>

      <div className="adm-order-filters">
        {statuses.map((status) => (
          <button
            key={status.id}
            className={statusFilter === status.id ? "adm-filter-active" : ""}
            onClick={() => setStatusFilter(status.id)}
          >
            {status.label}
            {status.id !== "all" && (
              <small>{orders.filter((o) => o.status === status.id).length}</small>
            )}
          </button>
        ))}
      </div>

      <div className="adm-table-scroll">
        <table className="adm-table adm-orders-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل وبيانات التوصيل</th>
              <th>التاريخ</th>
              <th>القطع</th>
              <th>الإجمالي</th>
              <th>الدفع</th>
              <th>حالة الطلب</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="adm-order-id">{order.orderNumber}</td>
                <td>
                  <div className="adm-customer-cell">
                    <b>{order.customerName}</b>
                    <small dir="ltr">{order.phone}</small>
                    <small>
                      {order.city} · {order.address}
                    </small>
                  </div>
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td>{order.items}</td>
                <td>{formatPrice(order.total)}</td>
                <td>
                  <select
                    className={`adm-payment-select adm-payment-${order.paymentStatus}`}
                    value={order.paymentStatus}
                    onChange={(e) => handleUpdatePayment(order.id, e.target.value)}
                    disabled={order.paymentStatus === "refunded"}
                  >
                    <option value="unpaid">غير مدفوع</option>
                    <option value="paid">مدفوع</option>
                    <option value="refunded">مسترد</option>
                  </select>
                </td>
                <td>
                  <select
                    className="adm-order-status-select"
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    disabled={order.status === "cancelled"}
                  >
                    {statuses
                      .filter((s) => s.id !== "all")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
            {!filteredOrders.length && (
              <tr>
                <td colSpan={7}>
                  <div className="adm-empty-state">
                    <ClipboardList size={24} />
                    <p>{search ? "لا توجد طلبات تطابق البحث." : "لا توجد طلبات محفوظة حتى الآن."}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="adm-table-footer">
        تعرض الصفحة أحدث 300 طلب · البيانات شخصية ومقصورة على المشرفين
      </div>
    </section>
  );
}
