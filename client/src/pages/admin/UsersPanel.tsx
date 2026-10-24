import { useMemo, useState } from "react";
import { Search, Shield, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminUsers({ currentUserId }: { currentUserId: number }) {
  const utils = trpc.useUtils();
  const query = trpc.admin.users.list.useQuery();
  const changeRole = trpc.admin.users.setRole.useMutation({
    onSuccess: async () => { await Promise.all([utils.admin.users.list.invalidate(), utils.admin.overview.invalidate()]); toast.success("تم حفظ صلاحية الحساب."); },
    onError: error => toast.error(error.message || "تعذر تحديث الصلاحية."),
  });
  const [search, setSearch] = useState("");
  const users = useMemo(() => (query.data ?? []).filter(user => `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [query.data, search]);
  const adminCount = query.data?.filter(user => user.role === "admin").length ?? 0;

  if (query.isLoading) return <div className="adm-state-card">جارٍ تحميل الحسابات…</div>;
  if (query.error) return <div className="adm-state-card adm-error-card">تعذر تحميل الحسابات: {query.error.message}</div>;

  return <section className="adm-panel adm-data-panel">
    <div className="adm-permissions-banner"><span><ShieldCheck size={20} /></span><div><b>صلاحيات الخادم مفعّلة</b><p>كل طلب إداري يتحقق من جلسة Manus ودور admin في قاعدة البيانات قبل إرجاع البيانات أو حفظ التعديل.</p></div><strong>{adminCount} مشرفين</strong></div>
    <div className="adm-table-toolbar"><label className="adm-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحثي بالاسم أو البريد" /></label><span className="adm-table-footer">{query.data?.length ?? 0} حسابات</span></div>
    <div className="adm-table-scroll"><table className="adm-table adm-users-table"><thead><tr><th>الحساب</th><th>طريقة الدخول</th><th>آخر دخول</th><th>الدور</th><th>إدارة الدور</th></tr></thead><tbody>
      {users.map(user => <tr key={user.id}>
        <td><div className="adm-user-row"><span className={`adm-user-role-icon ${user.role === "admin" ? "is-admin" : ""}`}>{user.role === "admin" ? <ShieldCheck size={16} /> : <UserRound size={16} />}</span><div><b>{user.name || "حساب Manus"}</b><small>{user.email || "البريد غير متاح"}</small></div></div></td>
        <td>{user.loginMethod || "Manus"}</td>
        <td>{user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
        <td><span className={`adm-role-badge ${user.role === "admin" ? "is-admin" : ""}`}>{user.role === "admin" ? "مشرف" : "مستخدم"}</span></td>
        <td><select className="adm-role-select" aria-label={`دور ${user.name || user.email || user.id}`} value={user.role} disabled={changeRole.isPending || user.id === currentUserId || !user.email} onChange={event => changeRole.mutate({ userId: user.id, role: event.target.value as "user" | "admin" })}><option value="user">مستخدم</option><option value="admin">مشرف</option></select>{user.id === currentUserId && <small className="adm-self-role-note">حسابك الحالي</small>}</td>
      </tr>)}
      {!users.length && <tr><td colSpan={5}><p className="adm-empty-state">{search ? "لا توجد حسابات مطابقة." : "لا توجد حسابات مسجلة بعد. سجّلي الدخول بحساب Manus أولًا."}</p></td></tr>}
    </tbody></table></div>
    <div className="adm-permission-footnote"><Shield size={15} /><span>الحساب الإداري الأول المعيّن بإعداد المشروع لا يمكن سحب دوره من هنا. احتفظي بمشرفين اثنين على الأقل قبل تخفيض دور أي مشرف آخر.</span></div>
  </section>;
}
