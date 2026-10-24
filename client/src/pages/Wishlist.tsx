import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Heart, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CART_KEY = "lamsa-cart-v2";

export default function Wishlist() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (!savedUser) {
      setLocation('/login');
      return;
    }
    const u = JSON.parse(savedUser);
    setUser(u);
    
    // جلب المفضلة من الخادم
    fetch(`/api/wishlist/${u.email}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeItem = async (id: string) => {
    try {
      await fetch(`/api/wishlist/${user.email}/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
      toast.success('تمت الإزالة من المفضلة');
    } catch (e) { toast.error('حدث خطأ'); }
  };

  const addToCart = (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      const existing = cart.find((item: any) => item.id === product.id);
      if (existing) existing.quantity += 1;
      else cart.push({ ...product, quantity: 1 });
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      toast.success('تمت الإضافة للسلة');
    } catch (e) { toast.error('حدث خطأ'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#482d39]">جاري التحميل...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline"><ArrowRight size={20}/> العودة للرئيسية</button>

        <h1 className="text-3xl font-bold text-[#34212a] mb-8 flex items-center gap-2"><Heart className="text-red-500" fill="currentColor"/> قائمة المفضلة ({items.length})</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm">
            <Heart size={60} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">قائمة المفضلة فارغة.</p>
            <button onClick={() => setLocation('/')} className="mt-4 bg-[#482d39] text-white px-6 py-3 rounded-xl font-bold">اكتشفي المنتجات</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <img src={product.image} alt={product.name} className="w-24 h-32 object-cover rounded-lg" />
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#34212a] line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="font-bold text-[#d93844] mt-1">{product.price} ر.ي</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => addToCart(product)} className="flex-1 bg-[#482d39] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><ShoppingBag size={14}/> إضافة للسلة</button>
                    <button onClick={() => removeItem(product.id)} className="bg-red-50 text-red-500 p-2 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
