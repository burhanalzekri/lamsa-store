import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Home, Tag, Camera, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

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

  // دالة رسم الصورة برمجياً (بدون صور - مضمونة 100%)
  const generateReceiptImage = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // إعدادات الصورة
    const width = 800;
    const lineHeight = 40;
    const padding = 40;
    const headerHeight = 120;
    const footerHeight = 120;
    const itemsHeight = cart.length * (lineHeight * 2 + 20);
    const height = headerHeight + itemsHeight + footerHeight + padding * 2;

    canvas.width = width;
    canvas.height = height;

    // الخلفية
    ctx.fillStyle = '#FAF3E0';
    ctx.fillRect(0, 0, width, height);

    // الترويسة
    ctx.fillStyle = '#482d39';
    ctx.fillRect(0, 0, width, headerHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('متجر لمسة - Lamsa Store', width / 2, 60);
    
    ctx.font = '20px Arial';
    ctx.fillText('تفاصيل الطلب', width / 2, 95);

    // المنتجات
    ctx.textAlign = 'right';
    let y = headerHeight + padding + 30;
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('المنتجات:', width - padding, y);
    y += 30;

    ctx.font = '20px Arial';
    cart.forEach((item, index) => {
      ctx.fillStyle = '#2C3E50';
      ctx.fillText(`${index + 1}. ${item.name}`, width - padding, y);
      
      ctx.fillStyle = '#d93844';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.price * item.quantity} ر.ي`, padding, y);
      ctx.textAlign = 'right';
      
      y += 25;
      ctx.fillStyle = '#888';
      ctx.font = '16px Arial';
      ctx.fillText(`المقاس: ${item.size || '-'} | اللون: ${item.color || '-'} | الكمية: ${item.quantity}`, width - padding, y);
      ctx.font = '20px Arial';
      y += 40;
    });

    // خط فاصل
    y += 20;
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 40;

    // المجاميع
    ctx.fillStyle = '#2C3E50';
    ctx.font = '22px Arial';
    ctx.fillText('المجموع:', width - padding, y);
    ctx.textAlign = 'left';
    ctx.fillText(`${subtotal} ر.ي`, padding, y);
    ctx.textAlign = 'right';
    y += 35;

    if (discount > 0) {
      ctx.fillStyle = '#16a34a';
      ctx.fillText(`الخصم (${discount}%):`, width - padding, y);
      ctx.textAlign = 'left';
      ctx.fillText(`-${discountAmount} ر.ي`, padding, y);
      ctx.textAlign = 'right';
      y += 35;
    }

    // الإجمالي
    ctx.fillStyle = '#482d39';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('الإجمالي:', width - padding, y);
    ctx.textAlign = 'left';
    ctx.fillText(`${total} ر.ي`, padding, y);
    y += 50;

    // معلومات العميل
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888';
    ctx.font = '18px Arial';
    ctx.fillText(`العميل: ${user?.name || 'زائر'} | البريد: ${user?.email || 'غير مسجل'}`, width / 2, y);
    y += 30;
    ctx.fillText(`للاستفسار: +967775799926`, width / 2, y);

    return canvas.toDataURL('image/png');
  };

  // حفظ الصورة
  const saveImage = () => {
    try {
      const dataUrl = generateReceiptImage();
      if (!dataUrl) return toast.error('فشل إنشاء الصورة');
      const link = document.createElement('a');
      link.download = 'lamsa-order-' + Date.now() + '.png';
      link.href = dataUrl;
      link.click();
      toast.success('تم حفظ الصورة في المعرض!');
    } catch (e) {
      console.error(e);
      toast.error('فشل حفظ الصورة.');
    }
  };

  // مشاركة الصورة
  const shareImage = async () => {
    try {
      toast.info('جارٍ تجهيز الصورة للمشاركة...');
      const dataUrl = generateReceiptImage();
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'lamsa-order.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'طلب من متجر لمسة',
          text: 'تفاصيل طلبي من متجر لمسة 🛍️'
        });
        toast.success('تم تجهيز الطلب للمشاركة!');
      } else {
        // بديل: حفظ الصورة
        const link = document.createElement('a');
        link.download = 'lamsa-order.png';
        link.href = dataUrl;
        link.click();
        toast.success('تم حفظ الصورة (متصفحك لا يدعم المشاركة المباشرة)');
      }
    } catch (e) {
      console.error(e);
      toast.error('فشل مشاركة الصورة.');
    }
  };

  // إرسال واتساب
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

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border space-y-4">
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

              <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
                <label className="block text-xs font-bold text-gray-600 mb-1"><Tag size={14} className="inline"/> كود الخصم</label>
                <div className="relative">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="أدخل الكود هنا" className="w-full border p-2.5 pl-20 rounded-lg text-sm" />
                  <button onClick={applyCoupon} className="absolute left-1 top-1 bottom-1 bg-[#34212a] text-white px-4 rounded-md text-xs font-bold">تطبيق</button>
                </div>
                {couponMsg.text && <p className={`text-xs mt-1 font-bold ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMsg.text}</p>}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع:</span><span>{subtotal} ر.ي</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم:</span><span>-{discountAmount} ر.ي</span></div>}
                <div className="flex justify-between font-bold text-lg text-[#482d39] border-t pt-2 mt-2"><span>الإجمالي:</span><span>{total} ر.ي</span></div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
              <p className="font-bold mb-1">📋 كيفية إرسال الطلب:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>اضغط على <b>"حفظ"</b> لحفظ صورة الطلب في المعرض.</li>
                <li>أو اضغط على <b>"مشاركة"</b> لفتح قائمة التطبيقات وإرسال الصورة.</li>
                <li>أو اضغط على <b>"واتساب"</b> لإرسال تفاصيل الطلب كنص.</li>
              </ol>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={sendWhatsApp} className="bg-[#25D366] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1DA851] transition flex flex-col justify-center items-center gap-1 shadow-lg">
                <MessageCircle size={22}/> واتساب
              </button>
              <button onClick={shareImage} className="bg-[#482d39] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#654151] transition flex flex-col justify-center items-center gap-1 shadow-lg">
                <Share2 size={22}/> مشاركة
              </button>
              <button onClick={saveImage} className="bg-[#34212a] text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition flex flex-col justify-center items-center gap-1 shadow-lg">
                <Camera size={22}/> حفظ
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
