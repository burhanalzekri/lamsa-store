import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Home, User, Phone, MapPin, ShoppingBag, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const CART_KEY = "lamsa-cart-v2";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setForm(f => ({ ...f, customerName: u.name || '', phone: u.phone || '' }));
    }
    
    // دائمًا: نقرأ السلة من localStorage أولاً (لأن هذا ما يملؤه العميل عند التسوق)
    const localCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    setCart(localCart);
    
    // إذا كان مسجلاً ولديه سلة في DB، ندمجها مع localStorage (اختياري)
    // لكن الأولوية دائمًا لـ localStorage (لأنه ما يراه العميل)
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 20000 ? 0 : 500;
  const total = subtotal + shipping;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("السلة فارغة");
    setLoading(true);

    try {
      const items = cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size || '',
        color: i.color || '',
        image: i.image || i.imageUrl || ''
      }));

      console.log('🚀 [CHECKOUT] Sending order...');
      console.log('📦 [CHECKOUT] Cart:', cart);
      console.log('📋 [CHECKOUT] Items:', items);
      console.log('👤 [CHECKOUT] Form:', form);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          address: `${form.city ? form.city + ' - ' : ''}${form.address}${form.notes ? ' (' + form.notes + ')' : ''}`,
          items,
          totalAmount: total,
          customerEmail: user?.email || null
        })
      });

      const data = await res.json();
      console.log('📡 [CHECKOUT] Response:', { status: res.status, ok: res.ok, data });
      console.log('🔍 [CHECKOUT] response:', { status: res.status, data });
      console.log('🔍 [CHECKOUT] success:', data.success);
      if (data.success) {
        localStorage.removeItem(CART_KEY);
        if (user) {
          fetch(`/api/cart/${user.email}/clear`, { method: 'DELETE' }).catch(() => {});
        }
        toast.success("تم استلام طلبك بنجاح!");
        await new Promise(r => setTimeout(r, 500)); // تأخير بسيط للسلاسة
        setLocation(`/thank-you?order=${data.orderId}&name=${encodeURIComponent(form.customerName)}`);
      } else {
        toast.error(data.error || "فشل حفظ الطلب");
      }
    } catch (e) {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-[#2a1a21] mb-2">سلتك فارغة</h2>
          <p className="text-gray-500 mb-6">لا يمكن إتمام الطلب. أضف منتجات أولاً.</p>
          <button onClick={() => setLocation('/')} className="bg-[#C9A84C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b8952f] transition">تسوقي الآن</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setLocation('/cart')} className="mb-6 flex items-center gap-2 text-[#2a1a21] font-bold hover:text-[#C9A84C] transition">
          <ArrowRight size={20} /> العودة للسلة
        </button>

        <h1 className="text-3xl font-bold text-[#2a1a21] mb-6" style={{ fontFamily: "'Amiri', serif" }}>إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج البيانات */}
          <div className="lg:col-span-2 space-y-6">
            {/* بيانات العميل */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2a1a21] mb-4 flex items-center gap-2">
                <User size={20} className="text-[#C9A84C]"/> بيانات العميل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل *</label>
                  <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full border p-3 rounded-lg focus:border-[#C9A84C] outline-none transition" placeholder="اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف *</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-lg focus:border-[#C9A84C] outline-none transition" placeholder="7xxxxxxxx" dir="ltr" />
                </div>
              </div>
            </div>

            {/* عنوان التوصيل */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2a1a21] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#C9A84C]"/> عنوان التوصيل
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المدينة *</label>
                  <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border p-3 rounded-lg focus:border-[#C9A84C] outline-none transition" placeholder="مثال: تعز" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العنوان التفصيلي *</label>
                  <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-3 rounded-lg focus:border-[#C9A84C] outline-none transition" placeholder="الحي، الشارع، رقم المبنى..." rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border p-3 rounded-lg focus:border-[#C9A84C] outline-none transition" placeholder="مثال: الاتصال قبل التوصيل" />
                </div>
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#2a1a21] mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-[#C9A84C]"/> طريقة الدفع
              </h2>
              <div className="border-2 border-[#C9A84C] bg-[#FAF3E0] p-4 rounded-xl flex items-center gap-3">
                <input type="radio" checked readOnly className="w-5 h-5 accent-[#C9A84C]" />
                <div>
                  <p className="font-bold text-[#2a1a21]">الدفع عند الاستلام</p>
                  <p className="text-xs text-gray-500">ادفع نقداً عند استلام الطلب</p>
                </div>
              </div>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[#2a1a21] mb-4">ملخص الطلب ({cart.length})</h2>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <img src={item.image || item.imageUrl} className="w-12 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-bold text-[#2a1a21] truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x {item.price} ر.ي</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>المجموع الفرعي:</span><span>{subtotal.toLocaleString()} ر.ي</span></div>
                <div className="flex justify-between text-gray-600"><span>الشحن:</span><span className={shipping === 0 ? "text-green-600 font-bold" : ""}>{shipping === 0 ? 'مجاني' : `${shipping} ر.ي`}</span></div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-[#2a1a21]"><span>الإجمالي:</span><span>{total.toLocaleString()} ر.ي</span></div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-[#C9A84C] to-[#b8952f] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'جاري إرسال الطلب...' : (
                  <><ShieldCheck size={20}/> تأكيد الطلب</>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck size={12}/> طلب آمن ومشفر
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
