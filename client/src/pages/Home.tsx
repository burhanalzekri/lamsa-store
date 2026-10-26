import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Phone, Mail, Heart, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import HeroSlider from "../components/HeroSlider";
import LuxuryLogo from "../components/LuxuryLogo";
import MiniCart from "../components/MiniCart";
import { useLocation } from "wouter";

const CART_KEY = "lamsa-cart-v2";

export default function Home() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  });
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchCategory = activeCategory === "الكل" || product.category === activeCategory;
    const matchSearch = `${product.name} ${product.category}`.includes(query.trim());
    return matchCategory && matchSearch;
  }), [activeCategory, query, products]);

  const addToCart = (product: any) => {
    setCart(lines => {
      const exists = lines.find(l => l.id === product.id);
      if (exists) return lines.map(l => l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l);
      return [...lines, { ...product, quantity: 1 }];
    });
    toast.success(
      <div className="flex items-center gap-3" dir="rtl">
        <img src={product.image} className="w-12 h-12 rounded-lg object-cover" />
        <div>
          <p className="font-bold text-sm text-[#34212a]">تمت الإضافة!</p>
          <p className="text-xs text-gray-500">{product.name}</p>
        </div>
      </div>,
      { duration: 3000 }
    );
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart(lines => lines.map(l => l.id === id ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l));
  };

  const removeFromCart = (id: string) => {
    setCart(lines => lines.filter(l => l.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF3E0] pb-20" dir="rtl">
      {/* شريط التنبيهات المتحرك */}
      <div className="bg-[#34212a] text-white text-xs py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="mx-4">🚚 توصيل مجاني للطلبات فوق 20,000 ر.ي</span>
          <span className="mx-4">|</span>
          <span className="mx-4">✨ عروض مختارة على قطع جديدة</span>
          <span className="mx-4">|</span>
          <span className="mx-4">🎁 استخدمي كود LAMSA10 لخصم 10%</span>
          <span className="mx-4">|</span>
        </div>
      </div>

      {/* الترويسة */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden"><Menu size={24} /></button>
            <a href="#" className="block"><LuxuryLogo size="sm" /></a>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-bold text-gray-600">
            <a href="#" className="hover:text-[#34212a] transition">تسوقي الآن</a>
            <a href="#" className="hover:text-[#34212a] transition">وصل حديثاً</a>
            <a href="#" className="hover:text-[#34212a] transition">حكاية لمسة</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحثي عن قطعة أو لون" className="w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:border-[#34212a]" />
            </div>
            <div className="relative" onMouseEnter={() => setMiniCartOpen(true)} onMouseLeave={() => setMiniCartOpen(false)}>
              <button onClick={() => setLocation("/cart")} className="relative flex items-center gap-2 text-[#34212a] font-bold text-sm">
                <ShoppingBag size={22} />
                <span className="hidden sm:inline">حقيبتي</span>
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#d93844] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
              </button>
              <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {/* السلايدر الجديد (بدلاً من الهيرو القديم) */}
        <HeroSlider products={products} />
        
        {/* قسم الأكثر مبيعاً */}
        <section className="py-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <h2 className="text-2xl font-bold text-[#34212a]">الأكثر مبيعاً</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter(p => p.badge?.includes('مبيع')).slice(0, 4).map(product => (
              <div key={product.id} onClick={() => setLocation(`/product/${product.id}`)} className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition">
                <div className="relative aspect-[3/4] bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-[#f59e0b] text-white text-xs font-bold px-2 py-1 rounded">الأكثر مبيعاً</span>
                </div>
                <div className="p-2 text-center">
                  <p className="font-bold text-sm truncate">{product.name}</p>
                  <p className="text-[#d93844] font-bold">{product.price} ر.ي</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* شريط المزايا */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8 border-y border-gray-200 my-8">
          <div className="flex items-center justify-center gap-4 bg-white/50 p-4 rounded-xl">
            <span className="text-2xl text-[#d93844] font-bold">01</span>
            <div><h4 className="font-bold text-[#34212a]">قطع جديدة</h4><p className="text-xs text-gray-500">تشكيلة لمسة المختارة</p></div>
          </div>
          <div className="flex items-center justify-center gap-4 bg-white/50 p-4 rounded-xl border-y md:border-y-0 md:border-x border-gray-200">
            <span className="text-2xl text-[#d93844] font-bold">02</span>
            <div><h4 className="font-bold text-[#34212a]">كل التفاصيل</h4><p className="text-xs text-gray-500">السعر واللون والتوفر</p></div>
          </div>
          <div className="flex items-center justify-center gap-4 bg-white/50 p-4 rounded-xl">
            <span className="text-2xl text-[#d93844] font-bold">03</span>
            <div><h4 className="font-bold text-[#34212a]">تسوق أسرع</h4><p className="text-xs text-gray-500">بحث وسلة في متناولك</p></div>
          </div>
        </section>

        {/* قسم المنتجات */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#d93844] text-sm font-bold mb-1">اكتشفي تشكيلتنا</p>
              <h2 className="text-3xl font-bold text-[#34212a]">اختاري إطلالتك <span className="text-[#d93844]">الجديدة</span></h2>
            </div>
            <button className="text-sm font-bold border-b border-[#34212a] pb-1 hidden sm:block">عرض كل القطع</button>
          </div>

          {/* التصنيفات */}
          <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {["الكل", "وصل حديثاً", "فساتين", "عبايات", "حقائب", "أحذية"].map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition border ${activeCategory === c ? 'bg-[#34212a] text-white border-[#34212a]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{c}</button>
            ))}
          </div>

          {/* شبكة المنتجات */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => {
              const price = product.price || (product.priceHalalas ? product.priceHalalas / 100 : 0);
              const compareAtPrice = product.compareAtPrice || (product.compareAtHalalas ? product.compareAtHalalas / 100 : 0);
              const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
              const image = product.image || product.imageUrl;
              return (
                <div key={product.id} onClick={() => setLocation(`/product/${product.id}`)} className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img src={image || "https://placehold.co/400x400"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    {discount > 0 && <span className="absolute top-2 right-2 bg-[#d93844] text-white text-xs font-bold px-2 py-1 rounded z-10">-{discount}%</span>}
                    {product.badge && <span className={`absolute ${discount > 0 ? 'top-2 left-2' : 'top-2 right-2'} bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-1 rounded z-10`}>{product.badge}</span>}
                  </div>
                  <div className="p-3 text-right" dir="rtl">
                    <h3 className="text-sm text-gray-700 font-medium line-clamp-2 min-h-[40px] leading-5">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-[#34212a]">{Number(price).toLocaleString()} ر.ي</span>
                      {discount > 0 && <span className="text-xs text-gray-400 line-through">{Number(compareAtPrice).toLocaleString()}</span>}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex text-[#C9A84C]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < Math.round(Number(product.rating)) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.rating})</span>
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="absolute bottom-16 left-3 bg-[#34212a] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg hover:bg-[#C9A84C] z-20" title="أضف للسلة">
                    <ShoppingBag size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* بانر الأسطورة */}
        <section className="my-16 luxury-banner rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-right">
          <div className="max-w-lg relative z-10">
            <p className="text-[#C9A84C] text-sm font-bold mb-2 tracking-widest" style={{ fontFamily: "'Reem Kufi', sans-serif" }}>من دفتر لمسة</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2a1a21] leading-tight mb-4" style={{ fontFamily: "'Amiri', serif" }}>الأسلوب ليس ما ترتدينه،<br/><span className="text-[#C9A84C]">بل كيف تشعرين فيه.</span></h2>
            <p className="text-[#6b5a4a] mb-6 leading-relaxed">نؤمن أن القطعة الجميلة هي التي تمنحك مساحة لتكوني أنتِ.</p>
            <button className="text-sm font-bold border-b-2 border-[#C9A84C] text-[#2a1a21] pb-1 hover:text-[#C9A84C] transition-colors">اختاري إطلالتك ←</button>
          </div>
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[#d93844] opacity-10 text-[200px] font-serif pointer-events-none select-none">✳</div>
        </section>
      </main>

      {/* الفوتر */}
      <footer className="luxury-footer py-16 mt-12 text-center md:text-right rounded-t-3xl">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-extrabold text-[#C9A84C] mb-4" style={{ fontFamily: "'Reem Kufi', sans-serif", textShadow: "0 2px 10px rgba(201,168,76,0.3)" }}>لمسة</h3>
            <p className="text-gray-500 text-sm mt-3 max-w-xs mx-auto md:mx-0">ملابس تحمل لمستك الخاصة. أزياء يومية مختارة بعناية للباحثات عن إطلالة عصرية.</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 font-bold flex items-center gap-2 justify-center md:justify-start">
                <Phone size={16} className="text-[#d93844]"/>
                <a href="tel:+967775799926" dir="ltr">+967 775 799 926</a>
              </p>
              <p className="text-sm text-gray-600 font-bold flex items-center gap-2 justify-center md:justify-start">
                <Mail size={16} className="text-[#d93844]"/>
                <a href="mailto:burhanalzekri77@gmail.com" dir="ltr">burhanalzekri77@gmail.com</a>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#C9A84C] mb-4 text-lg">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/about" className="hover:text-[#34212a]">من نحن / اتصل بنا</a></li>
              <li><a href="#" className="hover:text-[#34212a]">سياسة الاستبدال</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#C9A84C] mb-4 text-lg">تابعينا</h4>
            <div className="flex gap-3 justify-center md:justify-start">
              <span className="luxury-social-icon">f</span>
              <span className="luxury-social-icon">in</span>
              <span className="luxury-social-icon">ig</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          © لمسة ٢٠٢٦ | جميع الحقوق محفوظة
        </div>
      </footer>

      {/* نافذة السلة */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="w-full max-w-md bg-white h-full flex flex-col p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-[#34212a]">حقيبتي ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">حقيبتك فارغة.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 border-b pb-3">
                    <img src={item.image} className="w-20 h-24 object-cover rounded-lg" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                      <p className="text-[#34212a] font-bold mb-2">{item.price} ر.ي</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded">
                          <button onClick={() => changeQuantity(item.id, -1)} className="p-1 hover:bg-gray-50"><Minus size={14}/></button>
                          <span className="px-2 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.id, 1)} className="p-1 hover:bg-gray-50"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1"><Trash2 size={14}/> إزالة</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-extrabold text-xl mb-4 text-[#34212a]"><span>الإجمالي:</span><span>{cartTotal} ر.ي</span></div>
                <button onClick={() => { toast.success("تم إرسال طلبك (تجريبي)"); setCart([]); setCartOpen(false); }} className="w-full bg-[#34212a] text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition">إتمام الطلب</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
