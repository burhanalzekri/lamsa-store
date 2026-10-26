import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Star, AlertCircle, Flame, Clock, Heart, Check } from 'lucide-react';
import { toast } from 'sonner';

const CART_KEY = "lamsa-cart-v2";
const WISHLIST_KEY = "lamsa-wishlist";

export default function ProductDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = () => {
    fetch(`/api/products/${id}/reviews`).then(res => res.json()).then(data => setReviews(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products/${id}`).then(res => { if(!res.ok) throw new Error("المنتج غير موجود"); return res.json(); }),
      fetch(`/api/products/${id}/related`).then(res => res.json()),
      fetch(`/api/products/${id}/reviews`).then(res => res.json())
    ]).then(([p, r, rev]) => {
      setProduct(p);
      setRelated(Array.isArray(r) ? r : []);
      setReviews(Array.isArray(rev) ? rev : []);
      setMainImage(p.imageUrl || p.image || "");
      
      const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      setIsWishlisted(wishlist.includes(p.id));
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const addToCart = (goToCheckout: boolean) => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const price = product.priceHalalas ? product.priceHalalas / 100 : product.price;
      
      const exists = cart.find((l: any) => l.id === product.id && l.size === selectedSize && l.color === selectedColor);
      if (exists) exists.quantity += quantity;
      else cart.push({ ...product, price, quantity, size: selectedSize, color: selectedColor });
      
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      toast.success("أضيف المنتج إلى حقيبتك");
      if (goToCheckout) setLocation('/cart');
    } catch (e) { toast.error("حدث خطأ"); }
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    if (wishlist.includes(product.id)) {
      const newWishlist = wishlist.filter((wid: string) => wid !== product.id);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
      setIsWishlisted(false);
    } else {
      wishlist.push(product.id);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
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

  let productImages: string[] = [];
  if (product.images) {
    productImages = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (product.imageUrl && !productImages.includes(product.imageUrl)) {
    productImages.unshift(product.imageUrl);
  } else if (product.image && !productImages.includes(product.image)) {
    productImages.unshift(product.image);
  }

  const price = product.priceHalalas ? product.priceHalalas / 100 : (product.price || 0);
  const compareAtPrice = product.compareAtHalalas ? product.compareAtHalalas / 100 : (product.compareAtPrice || 0);
  const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const sizes = ["S", "M", "L", "XL"];
  const colors = ["أحمر", "أسود", "أبيض"];
  const stock = product.stock || 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : (product.rating || 4.5);

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:text-[#C9A84C] transition">
          <ArrowRight size={20} /> العودة للمتجر
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row gap-10">
          {/* معرض الصور */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border-2 border-[#F0E6D2] shadow-md">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-[#d93844] text-white font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                  <Flame size={16}/> خصم {discount}%
                </div>
              )}
            </div>
            
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    onClick={() => setMainImage(img)} 
                    className={`w-20 h-24 object-cover rounded-lg cursor-pointer border-2 transition ${mainImage === img ? 'border-[#C9A84C] shadow-md' : 'border-gray-200 hover:border-[#C9A84C]/50'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                <span className="text-[#C9A84C] font-bold text-sm block mb-1">{product.category}</span>
                <h1 className="text-3xl font-bold text-[#2a1a21]" style={{ fontFamily: "'Amiri', serif" }}>{product.name}</h1>
              </div>
              <button onClick={toggleWishlist} className="p-2 rounded-full bg-gray-50 hover:bg-red-50 transition mt-1">
                <Heart size={24} className={isWishlisted ? 'text-red-500' : 'text-gray-400'} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">{Array.from({length:5}).map((_,i) => <Star key={i} size={16} fill={i < Math.floor(Number(avgRating)) ? "currentColor" : "none"} className={i < Math.floor(Number(avgRating)) ? "text-amber-400" : "text-gray-300"} />)}</div>
              <span className="text-gray-500 text-sm font-bold">({avgRating})</span>
              <span className="text-gray-400 text-sm">| {reviews.length} مراجعة</span>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">🚚 شحن مجاني</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">🔄 استبدال خلال 3 أيام</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">💳 دفع عند الاستلام</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-[#2a1a21]">{price.toLocaleString()} ر.ي</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{compareAtPrice.toLocaleString()} ر.ي</span>
                  <span className="bg-[#d93844] text-white text-xs font-bold px-2 py-1 rounded">وفري {discount}%</span>
                </>
              )}
            </div>

            {stock === 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm font-bold">
                ❌ نفد المخزون - غير متوفر حالياً
              </div>
            )}
            {stock > 0 && stock <= 5 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg mb-4 text-sm font-bold">
                ⚠️ باقي {stock} قطع فقط!
              </div>
            )}
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-[#FAF3E0] rounded-lg border border-[#F0E6D2] text-xs">
              <div><span className="text-gray-500">الفئة:</span> <b className="text-[#34212a]">{product.category}</b></div>
              <div><span className="text-gray-500">الخامة:</span> <b className="text-[#34212a]">{product.material || 'قطن'}</b></div>
              <div><span className="text-gray-500">الكود:</span> <b className="text-[#34212a]">{product.id}</b></div>
              <div><span className="text-gray-500">التقييم:</span> <b className="text-[#34212a]">{avgRating} ⭐</b></div>
            </div>

            <div className="mb-6">
              <span className="font-bold text-gray-700 block mb-2">المقاس:</span>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 border rounded-lg font-bold transition ${selectedSize === s ? 'bg-[#2a1a21] text-white border-[#2a1a21]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#2a1a21]'}`}>{s}</button>)}
              </div>
            </div>

            <div className="mb-8">
              <span className="font-bold text-gray-700 block mb-2">اللون:</span>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 border rounded-lg font-bold transition ${selectedColor === c ? 'bg-[#2a1a21] text-white border-[#2a1a21]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#2a1a21]'}`}>{c}</button>)}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg h-14">
                  <button onClick={() => setQuantity(v => Math.max(1, v - 1))} className="px-4 h-full hover:bg-gray-100 transition"><Minus size={18}/></button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(v => v + 1)} className="px-4 h-full hover:bg-gray-100 transition"><Plus size={18}/></button>
                </div>
                <button onClick={() => addToCart(false)} className="flex-grow h-14 bg-white text-[#2a1a21] border-2 border-[#2a1a21] rounded-xl font-bold text-lg hover:bg-[#2a1a21] hover:text-white transition flex justify-center items-center gap-2">
                  <ShoppingBag size={20} /> أضيفي للسلة
                </button>
              </div>
              <button onClick={() => addToCart(true)} className="w-full h-14 bg-[#d93844] text-white rounded-xl font-bold text-lg hover:bg-red-700 transition flex justify-center items-center gap-2 shadow-lg">
                <Check size={20} /> اشتري الآن
              </button>
            </div>
          </div>
        </div>

        {/* قسم التقييمات */}
        <div className="mt-12 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#2a1a21] mb-6" style={{ fontFamily: "'Amiri', serif" }}>تقييمات العملاء ({reviews.length})</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reviews.length === 0 ? <p className="text-gray-500 text-center py-8">لا توجد تقييمات بعد. كن أول من يقيّم!</p> : reviews.map(r => (
                <div key={r.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <b className="text-[#2a1a21]">{r.userName}</b>
                    <div className="flex text-amber-500">{Array.from({length: r.rating}).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{r.comment}</p>
                  {r.imageUrl && <img src={r.imageUrl} alt="Review" className="w-24 h-24 object-cover rounded-lg border" />}
                  <small className="text-gray-400 text-xs block mt-1">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</small>
                </div>
              ))}
            </div>

            <form onSubmit={submitReview} className="bg-[#FAF3E0] p-6 rounded-xl border border-[#F0E6D2]">
              <h3 className="font-bold text-[#2a1a21] mb-4">أضيفي تقييمك</h3>
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
                    } catch (err) { toast.error('فشل الرفع'); }
                  }} />
                  <label htmlFor="review-image-upload" className="cursor-pointer bg-white hover:bg-gray-50 border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    📷 اختر صورة
                  </label>
                  {reviewImage && <img src={reviewImage} className="w-12 h-12 object-cover rounded border" />}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#2a1a21] text-white py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-[#482d39] transition">{isSubmitting ? 'جارٍ النشر...' : 'نشر التقييم'}</button>
            </form>
          </div>
        </div>

        {/* منتجات مشابهة */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#2a1a21] mb-6" style={{ fontFamily: "'Amiri', serif" }}>منتجات مشابهة قد تعجبك</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const pPrice = p.priceHalalas ? p.priceHalalas / 100 : (p.price || 0);
                const pCompare = p.compareAtHalalas ? p.compareAtHalalas / 100 : 0;
                const pDiscount = pCompare > pPrice ? Math.round(((pCompare - pPrice) / pCompare) * 100) : 0;
                return (
                  <div key={p.id} onClick={() => setLocation(`/product/${p.id}`)} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img src={p.imageUrl || p.image || "https://placehold.co/400x400"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {pDiscount > 0 && <span className="absolute top-2 right-2 bg-[#d93844] text-white text-xs font-bold px-2 py-1 rounded">-{pDiscount}%</span>}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-bold text-sm text-[#2a1a21] truncate">{p.name}</h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-sm text-[#2a1a21] font-bold">{pPrice.toLocaleString()} ر.ي</p>
                        {pDiscount > 0 && <p className="text-xs text-gray-400 line-through">{pCompare.toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
