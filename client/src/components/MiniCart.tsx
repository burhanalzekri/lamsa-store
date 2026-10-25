import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShoppingBag, X } from 'lucide-react';

export default function MiniCart({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [cart, setCart] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('lamsa_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      fetch(`/api/cart/${u.email}`).then(r => r.json()).then(d => setCart(Array.isArray(d) ? d : []));
    } else {
      const saved = JSON.parse(localStorage.getItem('lamsa-cart-v2') || '[]');
      setCart(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
        <div className="p-3 bg-[#FAF3E0] border-b flex justify-between items-center">
          <h3 className="font-bold text-[#34212a]">حقيبتي ({count})</h3>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="max-h-64 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">الحقيبة فارغة.</p>
          ) : cart.map((item, i) => (
            <div key={i} className="flex gap-2 items-center border-b pb-2">
              <img src={item.image} className="w-12 h-14 object-cover rounded" />
              <div className="flex-grow">
                <p className="font-bold text-xs line-clamp-1">{item.name}</p>
                <p className="text-[#d93844] text-xs font-bold">{item.price} ر.ي × {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <div className="flex justify-between font-bold text-sm mb-2"><span>المجموع:</span><span>{total} ر.ي</span></div>
            <button onClick={() => { onClose(); setLocation('/cart'); }} className="w-full bg-[#482d39] text-white py-2 rounded-lg text-sm font-bold">عرض السلة</button>
          </div>
        )}
      </div>
    </>
  );
}
