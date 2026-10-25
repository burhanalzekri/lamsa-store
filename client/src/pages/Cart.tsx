import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Home, Package, Tag, Camera, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import domtoimage from 'dom-to-image';

const CART_KEY = "lamsa-cart-v2";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const cartRef = useRef<HTMLDivElement>(null);

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

  // تصوير السلة أولاً
  const captureCart = async () => {
    if (!cartRef.current) return;
    try {
      toast.info('جارٍ تجهيز الصورة...');
      
      // إخفاء الصور مؤقتاً لتجنب مشكلة CORS
      const images = cartRef.current.querySelectorAll('img');
      images.forEach(img => img.style.display = 'none');
      
      // استخدام html2canvas (موجودة أصلاً)
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cartRef.current, { 
        scale: 2, 
        backgroundColor: '#FAF3E0',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // استعادة الصور
      images.forEach(img => img.style.display = '');
      
      const link = document.createElement('a');
      link.download = 'lamsa-order.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم حفظ صورة الطلب في المعرض!');
    } catch (e) { 
      console.error(e);
      toast.error('فشل تصوير السلة. تأكد من اتصالك بالإنترنت.');
    }
  };

  // إرسال الطلب عبر الواتساب (نص فقط)
  const sendOrderViaWhatsApp = () => {
    if (cart.length === 0) return toast.error('السلة فارغة');
    
    let message = '🛍️ *طلب جديد من متجر لمسة*\n\n';
    message += `👤 *العميل:* ${user?.name || 'زائر'}\n`;
    message += `📧 *البريد:* ${user?.email || 'غير مسجل'}\n\n`;
    message += '📦 *المنتجات:*\n';
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.color || 'افتراضي'} - ${item.size || 'افتراضي'}) × ${item.quantity} = ${item.price * item.quantity} ر.ي\n`;
    });
    
    message += `\n💰 *المجموع:* ${subtotal} ر.ي\n`;
    if (discount > 0) message += `🎟️ *الخصم:* ${discount}% (-${discountAmount} ر.ي)\n`;
    message += `💵 *الإجمالي:* ${total} ر.ي\n\n`;
    message += '📞 يرجى التواصل لتأكيد الطلب.';

    const phone = '967775799926';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline">
          <Home size={20} /> العودة للرئيسية
        </button>

        <h1 className="text-3xl font-bold text-[#34212a] mb-6 flex items-center gap-2">
          <ShoppingBag size={28}/> سلة المشتريات ({cart.length})
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <ShoppingBag size={60} className="text-gray-300 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-[#34212a] mb-2">حقيبتك فارغة</h2>
            <button onClick={() => setLocation('/')} className="bg-[#482d39] text-white px-8 py-3 rounded-xl font-bold mt-4">تسوقي الآن</button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* شريط تقدم الشحن */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-center mb-2 font-bold text-[#482d39]">
                {remainingForFreeShipping > 0 
                  ? `أضيفي ${remainingForFreeShipping.toLocaleString()} ر.ي للحصول على شحن مجاني! 🚚` 
                  : '🎉 مبروك! حصلتِ على شحن مجاني'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {/* محتوى السلة (للتصوير) */}
            <div ref={cartRef} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-bold text-[#482d39]">تفاصيل الطلب</h2>
                <span className="text-xs text-gray-400">لمسة - Lamsa Store</span>
              </div>
              
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b pb-3">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-[#34212a]">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">المقاس: {item.size || '-'} | اللون: {item.color || '-'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg bg-gray-50">
                        <button onClick={() => updateQuantity(i, -1)} className="p-1"><Minus size={14}/></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(i, 1)} className="p-1"><Plus size={14}/></button>
                      </div>
                      <span className="font-bold text-[#d93844]">{item.price * item.quantity} ر.ي</span>
                      <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}

              {/* الكوبون */}
              <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
                <label className="block text-xs font-bold text-gray-600 mb-1"><Tag size={14} className="inline"/> كود الخصم</label>
                <div className="relative">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="أدخل الكود هنا" className="w-full border p-2.5 pl-20 rounded-lg text-sm" />
                  <button onClick={applyCoupon} className="absolute left-1 top-1 bottom-1 bg-[#34212a] text-white px-4 rounded-md text-xs font-bold">تطبيق</button>
                </div>
                {couponMsg.text && <p className={`text-xs mt-1 font-bold ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMsg.text}</p>}
              </div>

              {/* المجاميع */}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع:</span><span>{subtotal} ر.ي</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم:</span><span>-{discountAmount} ر.ي</span></div>}
                <div className="flex justify-between font-bold text-lg text-[#482d39] border-t pt-2 mt-2"><span>الإجمالي:</span><span>{total} ر.ي</span></div>
              </div>
            </div>

            {/* التعليمات */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
              <p className="font-bold mb-1">📋 كيفية إرسال الطلب:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>اضغط على <b>"حفظ صورة الطلب"</b> (سيتم حفظ الصورة في معرض هاتفك).</li>
                <li>اضغط على <b>"إرسال الطلب عبر واتساب"</b> (سيتم فتح واتساب بالرسالة).</li>
                <li>قم بإرفاق الصورة التي حفظتها من المعرض في محادثة واتساب.</li>
                <li>أرسل الرسالة، وسيتواصل معك فريقنا فوراً.</li>
              </ol>
            </div>

            {/* أزرار الطلب */}
            <div className="grid md:grid-cols-2 gap-3">
              <button 
                onClick={captureCart}
                className="w-full bg-[#34212a] text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition flex justify-center items-center gap-2 shadow-lg"
              >
                <Camera size={22}/> 1. حفظ صورة الطلب
              </button>
              <button 
                onClick={sendOrderViaWhatsApp}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1DA851] transition flex justify-center items-center gap-2 shadow-lg"
              >
                <MessageCircle size={22}/> 2. إرسال عبر واتساب
              </button>
            </div>

            <div className="text-center text-xs text-green-600 font-bold flex items-center justify-center gap-1 mt-2">
              <ShieldCheck size={14}/> إرسال آمن ومباشر
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
