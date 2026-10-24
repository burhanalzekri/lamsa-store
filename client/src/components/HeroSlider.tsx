import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function HeroSlider({ products }: { products: any[] }) {
  const [index, setIndex] = useState(0);
  const [, setLocation] = useLocation();

  // تصفية المنتجات التي عليها خصم
  const sliderProducts = products.filter(p => p.compareAtHalalas > 0).slice(0, 5);

  // تغيير تلقائي كل 15 ثانية
  useEffect(() => {
    if (sliderProducts.length === 0) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % sliderProducts.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [sliderProducts.length]);

  if (sliderProducts.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500 my-6">
        لا توجد عروض حالياً.
      </div>
    );
  }

  const current = sliderProducts[index];

  return (
    <section className="bg-white rounded-3xl shadow-sm my-6 overflow-hidden grid md:grid-cols-2 gap-0 relative">
      <div className="order-2 md:order-1 p-8 md:p-12 flex flex-col justify-center">
        <span className="inline-flex items-center gap-1 bg-[#d93844] text-white text-xs px-3 py-1 rounded-full mb-4 self-start">
          <Sparkles size={12}/> عرض خاص
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#34212a] leading-tight mb-4">
          {current.name}
        </h1>
        <p className="text-[#d93844] font-bold text-2xl mb-6">
          {current.price} ر.ي
          <span className="text-gray-400 text-sm line-through mr-2">
            {current.compareAtHalalas / 100} ر.ي
          </span>
        </p>
        <button 
          onClick={() => setLocation(`/product/${current.id}`)} 
          className="bg-[#34212a] text-white px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-black transition self-start"
        >
          تسوقي الآن <ArrowLeft size={18} />
        </button>
      </div>
      
      <div className="order-1 md:order-2 h-64 md:h-[400px]">
        <img 
          key={current.id}
          src={current.image} 
          alt={current.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* النقاط */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sliderProducts.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)} 
            className={'w-2 h-2 rounded-full transition-all ' + (index === i ? 'bg-[#d93844] w-6' : 'bg-gray-300')}
          />
        ))}
      </div>
    </section>
  );
}
