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
    <section className="luxury-hero-slider bg-gradient-to-br from-[#FDF6ED] to-[#f4ece1] rounded-3xl my-6 overflow-hidden grid md:grid-cols-2 gap-0 relative border border-[#e0d0b8]">
      {/* النصوص */}
      <div className="order-2 md:order-1 p-8 md:p-12 flex flex-col justify-center z-10">
        <span className="inline-flex items-center gap-1 bg-[#d93844] text-white text-xs px-3 py-1 rounded-full mb-4 self-start shadow-sm">
          <Sparkles size={12}/> عرض خاص
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#2a1a21] leading-tight mb-4" style={{ fontFamily: "'Amiri', serif", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {current.name}
        </h1>
        <p className="text-[#d93844] font-bold text-2xl mb-6">
          {current.price} ر.ي
          <span className="text-gray-400 text-sm line-through mr-2">
            {current.compareAtHalalas} ر.ي
          </span>
        </p>
        <button 
          onClick={() => setLocation(`/product/${current.id}`)} 
          className="bg-[#34212a] text-white px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-black transition self-start shadow-md"
        >
          تسوقي الآن <ArrowLeft size={18} />
        </button>
      </div>
      
      {/* الصورة (ثلاثية الأبعاد مع انعكاس) */}
      <div className="order-1 md:order-2 relative h-72 md:h-[500px] flex items-center justify-center p-8 perspective-[1000px]">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* الصورة الرئيسية مع تأثير 3D */}
          <img 
            key={current.id}
            src={current.image} 
            alt={current.name} 
            className="max-w-full max-h-full object-contain transition-transform duration-700 animate-[float_6s_ease-in-out_infinite]"
            style={{
              transform: 'rotateY(-10deg) rotateX(5deg)',
              filter: 'drop-shadow(20px 20px 30px rgba(72, 45, 57, 0.25))',
              borderRadius: '12px'
            }}
          />
          {/* الانعكاس */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] bg-black/10 blur-2xl rounded-full -z-10" />
        </div>
      </div>

      {/* النقاط */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        {sliderProducts.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)} 
            className={'w-2 h-2 rounded-full transition-all ' + (index === i ? 'bg-[#d93844] w-6' : 'bg-gray-400')}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
