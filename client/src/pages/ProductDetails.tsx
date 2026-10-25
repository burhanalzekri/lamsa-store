import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Star, AlertCircle, Flame, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';

const CART_KEY = "lamsa-cart-v2";
const WISHLIST_KEY = "lamsa-wishlist";

export default function ProductDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minPrice, setMinPrice] = useState(0);

  // حالة إضافة تقييم
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة العداد التنازلي
  const [timeLeft, setTimeLeft] = useState(12 * 3600); // 12 ساعة

  const fetchReviews = () => {
    fetch(`/api/products/${id}/reviews`).then(res => res.json()).then(data => setReviews(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products/${id}`).then(res => { if(!res.ok) throw new Error("المنتج غير موجود"); return res.json(); }),
      fetch(`/api/products/${id}/related`).then(res => res.json()),
      fetch(`/api/products/${id}/variants`).then(res => res.json()),
      fetch(`/api/products/${id}/reviews`).then(res => res.json())
    ]).then(([p, r, v, rev]) => {
      setProduct(p);
      setMainImage(p.image || "https://placehold.co/600x800?text=Image");
      setRelated(Array.isArray(r) ? r : []);
      setVariants(Array.isArray(v) ? v : []);
      setReviews(Array.isArray(rev) ? rev : []);
      setCurrentPrice(p.price || 0);
      setCurrentStock(20);
      
      if (Array.isArray(v) && v.length > 0) {
        const prices = v.map((item: any) => Number(item.price));
        setMinPrice(Math.min(...prices));
      } else {
        setMinPrice(p.price || 0);
      }
      
      const savedUser = localStorage.getItem('lamsa_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        fetch(`/api/wishlist/${user.email}`).then(r => r.json()).then(data => {
          if (Array.isArray(data)) setIsWishlisted(data.some((item: any) => item.id === p.id));
        }).catch(() => {});
      }
      
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  // عداد تنازلي
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // تحديث السعر عند تغيير اللون أو المقاس
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find((v: any) => 
        v.color?.trim() === selectedColor.trim() && 
        v.size?.trim() === selectedSize.trim()
      );
      if (variant) {
        setCurrentPrice(variant.price);
        setCurrentStock(variant.stock);
        return;
      }
    }
    if (product) {
      setCurrentPrice(product.price);
      setCurrentStock(20);
    }
  }, [selectedColor, selectedSize, variants, product]);

  const toggleWishlist = async () => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (!savedUser) { toast.error('يرجى تسجيل الدخول أولاً'); return; }
    const user = JSON.parse(savedUser);
    
    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist/${user.email}/${product.id}`, { method: 'DELETE' });
        setIsWishlisted(false);
        toast.success('تمت الإزالة من المفضلة');
      } else {
        await fetch('/api/wishlist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: user.email, productId: product.id })
        });
        setIsWishlisted(true);
        toast.success('تمت الإضافة للمفضلة');
      }
    } catch (e) { toast.error('حدث خطأ'); }
  };

  const addToCart = async (goToCheckout = false) => {
    if (!selectedSize || !selectedColor) {
      toast.error("يرجى اختيار المقاس واللون أولاً");
      return;
    }
    if (!product) return;
    
    const savedUser = localStorage.getItem('lamsa_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    try {
      if (user) {
        // إضافة للسلة في الخادم
        await fetch('/api/cart', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userEmail: user.email, productId: product.id, 
            quantity, color: selectedColor, size: selectedSize 
          })
        });
      } else {
        // زائر: استخدام localStorage
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        const existing = cart.find((item: any) => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
        if (existing) existing.quantity += quantity;
        else cart.push({ ...product, price: currentPrice, quantity, size: selectedSize, color: selectedColor });
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
      
      toast.success("أضيف المنتج إلى حقيبتك");
      if (goToCheckout) setLocation('/cart');
    } catch (e) { toast.error("حدث خطأ"); }
  };

  const submitReview = async (e: any) => {
    e.preventDefault();
    if (!reviewName.trim()) return toast.error("يرجى كتابة اسمك");
    setIsSubmitting(true);
    try {
      await fetch(`/api/products/${id}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: reviewName, rating: reviewRating, comment: reviewComment, imageUrl: reviewImage })
      });
      toast.success("شكراً لك! تم نشر تقييمك.");
      setReviewName(""); setReviewComment(""); setReviewRating(5); setReviewImage("");
      fetchReviews();
    } catch (e) { toast.error("حدث خطأ"); }
    setIsSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#482d39]">جاري تحميل المنتج...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center text-red-600"><AlertCircle className="mr-2"/> {error || "المنتج غير موجود"}</div>;

  let productImages = [];
  if (product.images) productImages = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
  if (product.image && !productImages.includes(product.image)) productImages.unshift(product.image);

  const sizes = ["S", "M", "L", "XL"];
  const colors = ["أحمر", "أسود", "أبيض"];
  const discount = product.compareAtHalalas ? Math.round((1 - product.price / (product.compareAtHalalas / 100)) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : (product.rating || 4.5);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline">
          <ArrowRight size={20} /> العودة للمتجر
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
          
          {/* معرض الصور */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-[#d93844] text-white font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                  <Flame size={16}/> خصم {discount}%
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img, i) => (
                  <img key={i} src={img} onClick={() => setMainImage(img)} className={`w-20 h-24 object-cover rounded-lg cursor-pointer border-2 transition ${mainImage === img ? 'border-[#482d39]' : 'border-gray-200'}`} />
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                <span className="text-[#d93844] font-bold text-sm block mb-1">{product.category}</span>
                <h1 className="text-3xl font-extrabold text-[#482d39]">{product.name}</h1>
              </div>
              <button onClick={toggleWishlist} className="p-2 rounded-full bg-gray-50 hover:bg-red-50 transition mt-1">
                <Heart size={24} className={isWishlisted ? 'text-red-500' : 'text-gray-400'} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">{Array.from({length:5}).map((_,i) => <Star key={i} size={16} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} className={i < Math.floor(avgRating) ? "text-amber-400" : "text-gray-300"} />)}</div>
              <span className="text-gray-500 text-sm font-bold">({avgRating})</span>
              <span className="text-gray-400 text-sm">| {reviews.length} مراجعة</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">🚚 شحن مجاني</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">🔄 استبدال خلال 3 أيام</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">💳 دفع عند الاستلام</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              {!selectedColor || !selectedSize ? (
                <>
                  <span className="text-sm text-gray-500 font-bold">يبدأ من</span>
                  <span className="text-3xl font-bold text-[#482d39]">{minPrice} ر.ي</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[#482d39]">{currentPrice} ر.ي</span>
              )}
              {product.compareAtHalalas && <span className="text-lg text-gray-400 line-through">{product.compareAtHalalas / 100} ر.ي</span>}
            </div>

            {/* العداد التنازلي */}
            {discount > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-center gap-2 mb-4">
                <Clock size={20} className="text-red-600" />
                <span className="text-sm font-bold text-gray-700">ينتهي العرض خلال:</span>
                <span className="font-mono font-bold text-red-600 text-lg" dir="ltr">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-gray-50 rounded-lg border text-xs">
              <div><span className="text-gray-500">الفئة:</span> <b className="text-[#34212a]">{product.category}</b></div>
              <div><span className="text-gray-500">الخامة:</span> <b className="text-[#34212a]">{product.material || 'قطن'}</b></div>
              <div><span className="text-gray-500">الكود:</span> <b className="text-[#34212a]">{product.id}</b></div>
              <div><span className="text-gray-500">التقييم:</span> <b className="text-[#34212a]">{product.rating || 4.5} ⭐</b></div>
            </div>
            <div className="mb-6">
              <span className="font-bold text-gray-700 block mb-2">المقاس:</span>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 border rounded-lg font-bold transition ${selectedSize === s ? 'bg-[#482d39] text-white' : 'bg-white text-gray-700 hover:border-[#482d39]'}`}>{s}</button>)}
              </div>
            </div>

            <div className="mb-8">
              <span className="font-bold text-gray-700 block mb-2">اللون:</span>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 border rounded-lg font-bold transition ${selectedColor === c ? 'bg-[#482d39] text-white' : 'bg-white text-gray-700 hover:border-[#482d39]'}`}>{c}</button>)}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg h-14">
                  <button onClick={() => setQuantity(v => Math.max(1, v - 1))} className="px-4 h-full hover:bg-gray-100"><Minus size={18}/></button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(v => v + 1)} className="px-4 h-full hover:bg-gray-100"><Plus size={18}/></button>
                </div>
                <button onClick={() => addToCart(false)} className="flex-grow h-14 bg-[#f5f5f5] text-[#482d39] border border-[#482d39] rounded-xl font-bold text-lg hover:bg-gray-100 transition flex justify-center items-center gap-2">
                  <ShoppingBag size={20} /> أضيفي للسلة
                </button>
              </div>
              <button onClick={() => addToCart(true)} className="w-full h-14 bg-[#d93844] text-white rounded-xl font-bold text-lg hover:bg-red-700 transition flex justify-center items-center gap-2">
                اشتري الآن
              </button>
            </div>
            <p className="text-center text-xs text-green-600 font-bold mt-2"><Clock size={12} className="inline"/> اطلبي الآن ليصلك غداً</p>
          </div>
        </div>

        {/* قسم التقييمات */}
        <div className="mt-12 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#482d39] mb-6">تقييمات العملاء ({reviews.length})</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reviews.length === 0 ? <p className="text-gray-500 text-center py-8">لا توجد تقييمات بعد. كن أول من يقيّم!</p> : reviews.map(r => (
                <div key={r.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <b className="text-[#482d39]">{r.userName}</b>
                    <div className="flex text-amber-500">{Array.from({length: r.rating}).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{r.comment}</p>
                  {r.imageUrl && <img src={r.imageUrl} alt="Review" className="w-24 h-24 object-cover rounded-lg border" />}
                  <small className="text-gray-400 text-xs block mt-1">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</small>
                </div>
              ))}
            </div>

            <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-[#482d39] mb-4">أضيفي تقييمك</h3>
              <input required placeholder="اسمك" value={reviewName} onChange={e=>setReviewName(e.target.value)} className="w-full border p-2 rounded-lg mb-3" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-gray-600">التقييم:</span>
                {[1,2,3,4,5].map(star => <button type="button" key={star} onClick={()=>setReviewRating(star)} className={reviewRating >= star ? "text-amber-500" : "text-gray-300"}><Star size={20} fill="currentColor"/></button>)}
              </div>
              <textarea required placeholder="رأيك بالمنتج..." value={reviewComment} onChange={e=>setReviewComment(e.target.value)} className="w-full border p-2 rounded-lg mb-3" rows={3}></textarea>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-600 mb-1">أضيفي صورة (اختياري)</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" id="review-image-upload" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("image", file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.url) setReviewImage(data.url);
                    } catch (err) { alert('فشل الرفع'); }
                  }} />
                  <label htmlFor="review-image-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    📷 اختر صورة
                  </label>
                  {reviewImage && <img src={reviewImage} className="w-12 h-12 object-cover rounded border" />}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#482d39] text-white py-2 rounded-lg font-bold disabled:opacity-50">{isSubmitting ? 'جارٍ النشر...' : 'نشر التقييم'}</button>
            </form>
          </div>
        </div>

        {/* منتجات مشابهة */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#482d39] mb-6">منتجات مشابهة قد تعجبك</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <div key={p.id} onClick={() => setLocation(`/product/${p.id}`)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition">
                  <img src={p.image || "https://placehold.co/400x500"} className="w-full aspect-[3/4] object-cover" />
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-sm text-[#482d39] truncate">{p.name}</h3>
                    <p className="text-sm text-[#d93844] font-bold mt-1">{p.price} ر.ي</p>
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
