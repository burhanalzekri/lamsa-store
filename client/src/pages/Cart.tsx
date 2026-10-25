import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Home, Tag, Camera, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateReceiptImage } from '../lib/generateReceipt';

const CART_KEY = "lamsa-cart-v2";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetch(`/api/cart/${u.email}`).then(r => r.json()).then(d => setCart(Array.isArray(d) ? d : []));
    } else {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setCart(saved);
    }
  }, []);

  const updateQuantity = async (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
    if (user) {
      await fetch(`/api/cart/${user.email}/${newCart[index].id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newCart[index].quantity })
      });
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(newCart));
    }
  };

  const removeItem = async (index: number) => {
    const item = cart[index];
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    if (user) {
      await fetch(`/api/cart/${user.email}/${item.id}`, { method: 'DELETE' });
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(newCart));
    }
    toast.success('تم حذف المنتج');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const freeShippingThreshold = 20000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`/api/coupons/validate/${couponCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discountPercent);
        setCouponMsg({ text: `✅ تم تطبيق خصم ${data.discountPercent}%`, type: 'success' });
      } else {
        setDiscount(0);
        setCouponMsg({ text: `❌ ${data.error}`, type: 'error' });
      }
    } catch (e) { setCouponMsg({ text: 'خطأ في الاتصال', type: 'error' }); }
  };

  const saveImage = () => {
    try {
      const dataUrl = generateReceiptImage(cart, subtotal, discount, discountAmount, total, user);
      if (!dataUrl) return toast.error('فشل إنشاء الصورة');
      const link = document.createElement('a');
      link.download = 'lamsa-order-' + Date.now() + '.png';
      link.href = dataUrl;
      link.click();
      toast.success('تم حفظ الصورة في المعرض!');
    } catch (e) { toast.error('فشل حفظ الصورة.'); }
  };

  const shareImage = async () => {
    try {
      toast.info('جارٍ تجهيز الصورة للمشاركة...');
      const dataUrl = generateReceiptImage(cart, subtotal, discount, discountAmount, total, user);
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'lamsa-order.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'طلب من متجر لمسة', text: 'تفاصيل طلبي من متجر لمسة 🛍️' });
        toast.success('تم تجهيز الطلب للمشاركة!');
      } else {
        const link = document.createElement('a');
        link.download = 'lamsa-order.png';
        link.href = dataUrl;
        link.click();
        toast.success('تم حفظ الصورة (متصفحك لا يدعم المشاركة المباشرة)');
      }
    } catch (e) { toast.error('فشل مشاركة الصورة.'); }
  };

  const sendWhatsApp = () => {
    if (cart.length === 0) return toast.error('السلة فارغة');
    let message = '🛍️ *طلب جديد من متجر لمسة*\n\n';
    message += `👤 *العميل:* ${user?.name || 'زائر'}\n`;
    message += `📧 *البريد:* ${user?.email || 'غير مسجل'}\n\n`;
    message += '📦 *المنتجات:*\n';
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.color || '-'} - ${item.size || '-'}) × ${item.quantity} = ${item.price * item.quantity} ر.ي\n`;
    });
    message += `\n💰 *المجموع:* ${subtotal} ر.ي\n`;
    if (discount > 0) message += `🎟️ *الخصم:* ${discount}% (-${discountAmount} ر.ي)\n`;
    message += `💵 *الإجمالي:* ${total} ر.ي\n\n📞 يرجى التواصل لتأكيد الطلب.`;
    window.open(`https://wa.me/967775799926?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-[#482d39] font-bold hover:underline">
            <Home size={20} /> العودة للرئيسية
          </button>
          <h1 className="text-2xl font-bold text-[#34212a] flex items-center gap-2">
            <ShoppingBag size={24}/> سلة المشتريات
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <ShoppingBag size={60} className="text-gray-300 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-[#34212a] mb-2">حقيبتك فارغة</h2>
            <button onClick={() => setLocation('/')} className="bg-[#482d39] text-white px-8 py-3 rounded-xl font-bold mt-4">تسوقي الآن</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-center mb-2 font-bold text-[#482d39]">
                  {remainingForFreeShipping > 0 
                    ? `أضيفي ${remainingForFreeShipping.toLocaleString()} ر.ي للحصول على شحن مجاني! 🚚` 
                    : '🎉 مبروك! حصلتِ على شحن مجاني'}
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {cart.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-lg" />
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-[#34212a]">{item.name}</h3>
                        <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18}/></button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">المقاس: {item.size || '-'} | اللون: {item.color || '-'}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(i, -1)} className="px-2 py-1 hover:bg-gray-50"><Minus size={14}/></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(i, 1)} className="px-2 py-1 hover:bg-gray-50"><Plus size={14}/></button>
                      </div>
                      <span className="font-bold text-[#d93844] text-lg">{(item.price * item.quantity).toLocaleString()} ر.ي</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-[#482d39] mb-4 border-b pb-3">ملخص الطلب</h2>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">المجموع الفرعي:</span><span className="font-bold">{subtotal.toLocaleString()} ر.ي</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">الشحن:</span><span className="text-green-600 font-bold">مجاني</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم ({discount}%):</span><span className="font-bold">-{discountAmount.toLocaleString()} ر.ي</span></div>}
                  <div className="border-t pt-3 flex justify-between text-lg font-extrabold text-[#34212a]"><span>الإجمالي:</span><span>{total.toLocaleString()} ر.ي</span></div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1"><Tag size={14}/> كود الخصم</label>
                  <div className="relative">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="أدخل الكود" className="w-full border border-gray-300 p-2.5 pl-20 rounded-lg text-sm focus:border-[#482d39] outline-none" />
                    <button onClick={applyCoupon} className="absolute left-1 top-1 bottom-1 bg-[#34212a] text-white px-4 rounded-md text-xs font-bold hover:bg-black transition">تطبيق</button>
                  </div>
                  {couponMsg.text && <p className={`text-xs mt-2 font-bold ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMsg.text}</p>}
                </div>

                <div className="space-y-2">
                  <button onClick={sendWhatsApp} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1DA851] transition flex justify-center items-center gap-2 shadow-md">
                    <MessageCircle size={18}/> إرسال عبر واتساب
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={shareImage} className="bg-[#482d39] text-white py-2 rounded-xl font-bold text-xs hover:bg-[#654151] transition flex justify-center items-center gap-1 shadow-sm">
                      <Share2 size={16}/> مشاركة
                    </button>
                    <button onClick={saveImage} className="bg-[#34212a] text-white py-2 rounded-xl font-bold text-xs hover:bg-black transition flex justify-center items-center gap-1 shadow-sm">
                      <Camera size={16}/> حفظ
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12}/> الدفع عند الاستلام آمن ومضمون
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
