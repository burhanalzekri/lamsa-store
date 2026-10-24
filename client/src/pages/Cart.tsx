import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, User, CheckCircle, Sparkles, Home, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';

const CART_KEY = "lamsa-cart-v2";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [orderId, setOrderId] = useState("");

  // كوبون
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

  // جلب السلة والمنتجات المقترحة
  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      // جلب السلة من الخادم
      fetch(`/api/cart/${u.email}`).then(r => r.json()).then(d => setCart(Array.isArray(d) ? d : []));
    } else {
      // زائر: استخدام localStorage
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setCart(saved);
    }

    fetch('/api/products?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSuggested(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      }).catch(() => {});
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

  const addToCart = async (product: any) => {
    const newCart = [...cart];
    const existing = newCart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else newCart.push({ ...product, quantity: 1 });
    setCart(newCart);

    if (user) {
      await fetch('/api/cart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, productId: product.id, quantity: 1, color: null, size: null })
      });
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(newCart));
    }
    toast.success('تمت الإضافة للسلة');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

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

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) return toast.error("يرجى ملء جميع البيانات");
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name, phone: customer.phone, address: customer.address,
          items: cart, totalAmount: total,
          customerEmail: user?.email || null
        })
      });
      const data = await res.json();
      if (data.success) {
        if (user) {
          // حذف السلة من الخادم
          for (const item of cart) {
            await fetch(`/api/cart/${user.email}/${item.id}`, { method: 'DELETE' });
          }
        } else {
          localStorage.removeItem(CART_KEY);
        }
        setCart([]);
        setOrderId(data.orderId);
        setStep('success');
      } else { toast.error("فشل إرسال الطلب"); }
    } catch (error) { toast.error("حدث خطأ في الاتصال"); }
    setIsCheckingOut(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#482d39] mb-2">تم استلام طلبك بنجاح!</h1>
          <p className="text-gray-500 mb-6">شكراً لك <span className="font-bold text-[#482d39]">{customer.name}</span>، سيتواصل معك فريقنا قريباً لتأكيد الطلب.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">رقم الطلب الخاص بك:</p>
            <p className="text-2xl font-extrabold text-[#d93844] tracking-wider">{orderId}</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => setLocation(`/track?id=${orderId}`)} className="w-full bg-[#482d39] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#654151] transition">
              <Package size={20}/> تتبع الطلب
            </button>
            <button onClick={() => setLocation('/')} className="w-full bg-gray-100 text-[#482d39] py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 transition">
              <Home size={20}/> العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline">
          <Home size={20} /> العودة للرئيسية
        </button>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cart' ? 'text-[#482d39] font-bold' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cart' ? 'bg-[#482d39] text-white' : 'bg-gray-200'}`}>1</span> السلة
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded"><div className={`h-full bg-[#482d39] rounded transition-all ${step === 'checkout' ? 'w-full' : 'w-0'}`}></div></div>
          <div className={`flex items-center gap-2 ${step === 'checkout' ? 'text-[#482d39] font-bold' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'checkout' ? 'bg-[#482d39] text-white' : 'bg-gray-200'}`}>2</span> المراجعة والدفع
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <ShoppingBag size={60} className="text-gray-300 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-[#34212a] mb-2">حقيبتك فارغة</h2>
            <button onClick={() => setLocation('/')} className="bg-[#482d39] text-white px-8 py-3 rounded-xl font-bold mt-4">تسوقي الآن</button>
          </div>
        ) : step === 'cart' ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-[#34212a] mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">المقاس: {item.size || 'افتراضي'} | اللون: {item.color || 'افتراضي'}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg bg-gray-50">
                        <button onClick={() => updateQuantity(i, -1)} className="p-2"><Minus size={16}/></button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(i, 1)} className="p-2"><Plus size={16}/></button>
                      </div>
                      <span className="font-bold text-[#482d39]">{item.price} ر.ي</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-24">
              <h2 className="text-xl font-bold text-[#482d39] mb-4 border-b pb-3">ملخص الطلب</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span>المجموع:</span><span>{subtotal} ر.ي</span></div>
                <div className="flex justify-between"><span>الشحن:</span><span className="text-green-600">مجاني</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم ({discount}%):</span><span>-{discountAmount} ر.ي</span></div>}
                <div className="flex justify-between font-bold text-xl border-t pt-3"><span>الإجمالي:</span><span>{total} ر.ي</span></div>
              </div>

              <div className="mb-6 bg-gray-50 p-3 rounded-lg border">
                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1"><Tag size={14}/> هل لديك كود خصم؟</label>
                <div className="relative">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="أدخل الكود هنا" className="w-full border border-gray-300 p-2.5 pl-20 rounded-lg text-sm focus:outline-none focus:border-[#482d39]" />
                  <button onClick={applyCoupon} className="absolute left-1 top-1 bottom-1 bg-[#34212a] text-white px-4 rounded-md text-xs font-bold hover:bg-black transition">تطبيق</button>
                </div>
                {couponMsg.text && <p className={`text-xs mt-2 font-bold ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{couponMsg.text}</p>}
              </div>

              <button onClick={() => setStep('checkout')} className="w-full bg-[#d93844] text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition flex justify-center gap-2">
                متابعة الطلب <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <form onSubmit={handleCheckout} className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border space-y-4">
              <h2 className="text-xl font-bold text-[#482d39] border-b pb-3 mb-4 flex items-center gap-2"><User size={20}/> بيانات التوصيل</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" placeholder="مثال: نورة محمد" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الجوال</label>
                <input required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" placeholder="05xxxxxxxx" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">العنوان بالتفصيل</label>
                <textarea required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full border p-3 rounded-lg outline-none focus:border-[#482d39]" rows={3} placeholder="المدينة، الحي، الشارع، رقم المنزل"></textarea>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="font-bold text-sm text-gray-700 mb-2">طريقة الدفع (تجريبي)</h3>
                <div className="flex items-center gap-2 border p-2 rounded bg-white">
                  <CheckCircle size={18} className="text-green-600"/>
                  <span className="text-sm font-bold">الدفع عند الاستلام</span>
                </div>
              </div>

              <button type="submit" disabled={isCheckingOut} className="w-full bg-[#d93844] text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 mt-4">
                {isCheckingOut ? 'جارٍ تأكيد الطلب...' : `تأكيد الطلب النهائي (${total} ر.ي)`}
              </button>
            </form>

            <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-24">
              <h2 className="text-xl font-bold text-[#482d39] mb-4 border-b pb-3">مراجعة المنتجات ({cart.length})</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center text-sm">
                    <img src={item.image} className="w-12 h-14 object-cover rounded" />
                    <div className="flex-grow">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">{item.quantity} × {item.price} ر.ي</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-xl text-[#482d39]">
                <span>الإجمالي:</span><span>{total} ر.ي</span>
              </div>
              <div className="text-xs text-green-600 mt-4 flex items-center gap-1 justify-center"><ShieldCheck size={14}/> الدفع آمن ومضمون</div>
            </div>
          </div>
        )}

        {suggested.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-[#d93844]" size={28}/>
              <h2 className="text-2xl font-bold text-[#34212a]">أكملي إطلالتك</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggested.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src={p.image || "https://placehold.co/400x500"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-sm text-[#34212a] truncate">{p.name}</h3>
                    <p className="text-sm text-[#d93844] font-bold mt-1 mb-2">{p.price} ر.ي</p>
                    <button onClick={() => addToCart(p)} className="w-full bg-gray-100 text-[#34212a] py-2 rounded-lg text-sm font-bold hover:bg-[#34212a] hover:text-white transition">إضافة للسلة</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
