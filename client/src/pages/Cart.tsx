import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Home, Tag, Camera, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { generateReceiptImage } from '../lib/generateReceipt';
import { useSettings } from '../hooks/useSettings';
import ConfirmModal from '../components/ConfirmModal';

const CART_KEY = "lamsa-cart-v2";

export default function Cart() {
  const { currency } = useSettings();
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});

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

  const handleDeleteClick = (index: number) => {
    setConfirmState({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا المنتج من السلة؟',
      onConfirm: async () => {
        const item = cart[index];
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        if (user) {
          await fetch(`/api/cart/${user.email}/${item.id}`, { method: 'DELETE' });
        } else {
          localStorage.setItem(CART_KEY, JSON.stringify(newCart));
        }
        toast.success('تم حذف المنتج');
      }
    });
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
      setIsGenerating(true);
      const dataUrl = generateReceiptImage(cart, subtotal, discount, discountAmount, total, user);
      if (!dataUrl) { setIsGenerating(false); return toast.error('فشل إنشاء الصورة'); }
      const link = document.createElement('a');
      link.download = 'lamsa-order-' + Date.now() + '.png';
      link.href = dataUrl;
      link.click();
      toast.success('تم حفظ الصورة في المعرض!');
    } catch (e) {
      toast.error('فشل حفظ الصورة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareImage = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = generateReceiptImage(cart, subtotal, discount, discountAmount, total, user);
      if (!dataUrl) { setIsGenerating(false); return toast.error('فشل إنشاء الصورة'); }
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'lamsa-order.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'طلبي من لمسة', text: 'إليك طلبي' });
      } else {
        saveImage();
      }
    } catch (e) { toast.error('فشل المشاركة'); }
    finally { setIsGenerating(false); }
  };

  const sendWhatsApp = () => {
    const message = `🛍️ طلب جديد من متجر لمسة\n\n` +
      cart.map(i => `• ${i.name} (${i.quantity}x) - ${i.price} ر.ي`).join('\n') +
      `\n\nالمجموع: ${subtotal} ر.ي` +
      (discount > 0 ? `\nالخصم: ${discountAmount} ر.ي` : '') +
      `\nالإجمالي: ${total} ر.ي`;
    window.open(`https://wa.me/967775799926?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm max-w-md w-full">
          <ShoppingBag size={64} className="mx-auto text-[#C9A84C] mb-4" />
          <h2 className="text-2xl font-bold text-[#2a1a21] mb-2">سلتك فارغة</h2>
          <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات بعد</p>
          <button onClick={() => setLocation('/')} className="bg-[#2a1a21] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#482d39] transition">تسوقي الآن</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2a1a21]" style={{ fontFamily: "'Amiri', serif" }}>سلة المشتريات ({cart.length})</h1>
          <button onClick={() => setLocation('/')} className="text-[#2a1a21] font-bold flex items-center gap-2 hover:text-[#C9A84C] transition">
            <Home size={18}/> العودة للمتجر
          </button>
        </div>

        {/* شريط الشحن المجاني */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <p className="text-sm text-center font-bold text-[#2a1a21] mb-2">
            {remainingForFreeShipping > 0 ? `أضيفي ${remainingForFreeShipping.toLocaleString()} {currency} للحصول على شحن مجاني 🚚` : '🎉 مبروك! حصلت على شحن مجاني'}
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#C9A84C] to-[#E8C87A] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المنتجات */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4">
                <img src={item.image || item.imageUrl} className="w-24 h-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#2a1a21] mb-1">{item.name}</h3>
                      {item.size && <p className="text-xs text-gray-500">المقاس: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">اللون: {item.color}</p>}
                    </div>
                    <button onClick={() => handleDeleteClick(index)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18}/></button>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-[#2a1a21]">{item.price.toLocaleString()} {currency}</span>
                    <div className="flex items-center border rounded-lg h-10">
                      <button onClick={() => updateQuantity(index, -1)} className="px-3 h-full hover:bg-gray-100"><Minus size={14}/></button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="px-3 h-full hover:bg-gray-100"><Plus size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#2a1a21] mb-4" style={{ fontFamily: "'Amiri', serif" }}>ملخص الطلب</h2>
              
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-600"><span>المجموع الفرعي:</span><span>{subtotal.toLocaleString()} {currency}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم ({discount}%):</span><span>-{discountAmount.toLocaleString()} {currency}</span></div>}
                <div className="flex justify-between text-gray-600"><span>الشحن:</span><span className="text-green-600 font-bold">{remainingForFreeShipping === 0 ? 'مجاني' : 'قيد التحديد'}</span></div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-[#2a1a21]"><span>الإجمالي:</span><span>{total.toLocaleString()} {currency}</span></div>
              </div>

              {/* كود الخصم */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="كود الخصم" className="w-full border rounded-lg py-2 pr-9 pl-3 text-sm" />
                  </div>
                  <button onClick={applyCoupon} className="bg-[#2a1a21] text-white px-4 rounded-lg text-sm font-bold hover:bg-[#482d39] transition">تطبيق</button>
                </div>
                {couponMsg.text && <p className={`text-xs mt-1 ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMsg.text}</p>}
              </div>

              {/* أزرار الإجراءات */}
              <div className="space-y-2">
                <button onClick={sendWhatsApp} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm">
                  <MessageCircle size={18}/> إرسال الطلب عبر واتساب
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={saveImage} disabled={isGenerating} className="bg-white border-2 border-[#2a1a21] text-[#2a1a21] py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-[#2a1a21] hover:text-white transition disabled:opacity-50">
                    <Camera size={16}/> حفظ صورة
                  </button>
                  <button onClick={shareImage} disabled={isGenerating} className="bg-white border-2 border-[#2a1a21] text-[#2a1a21] py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-[#2a1a21] hover:text-white transition disabled:opacity-50">
                    <Share2 size={16}/> مشاركة
                  </button>
                </div>
                <button onClick={() => setLocation('/checkout')} className="w-full bg-[#C9A84C] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#b8952f] transition shadow-lg flex items-center justify-center gap-2">
                  إتمام الطلب <ArrowRight size={18}/>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <ShieldCheck size={14}/> ادفع عند الاستلام أو في المتجر
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}); }}
        onCancel={() => setConfirmState({...confirmState, isOpen: false})}
      />
    </div>
  );
}
