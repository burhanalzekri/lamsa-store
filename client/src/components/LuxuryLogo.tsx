import { useState, useEffect } from 'react';

export default function LuxuryLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [storeName, setStoreName] = useState('لمسة');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);

  const sizeMap = {
    sm: { container: 'w-10 h-10', text: 'text-xl', fullName: 'text-xl', subtext: 'text-[9px]' },
    md: { container: 'w-24 h-24', text: 'text-4xl', fullName: 'text-3xl', subtext: 'text-xs' },
    lg: { container: 'w-40 h-40', text: 'text-6xl', fullName: 'text-5xl', subtext: 'text-sm' },
  };
  const sizes = sizeMap[size];

  const initial = storeName.charAt(0);

  return (
    <div className="flex flex-col items-center justify-center" dir="rtl">
      {/* الإطار الدائري الفاخر */}
      <div
        className={`${sizes.container} relative flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, #2a1a21 0%, #482d39 50%, #2a1a21 100%)',
          borderRadius: '50%',
          boxShadow: `
            0 0 0 2px #C9A84C,
            0 0 0 4px #2a1a21,
            0 0 0 5px #C9A84C,
            0 6px 20px rgba(201, 168, 76, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        <span
          className={`${sizes.text} font-bold`}
          style={{
            fontFamily: "'Amiri', serif",
            color: '#F4E4A6',
            textShadow: '0 0 10px rgba(244, 228, 166, 0.8), 0 0 20px rgba(201, 168, 76, 0.6)',
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          {initial}
        </span>
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(244, 228, 166, 0.4), transparent 70%)' }}
        />
      </div>

      {/* اسم المتجر الكامل - كبير وواضح */}
      <div className="mt-2 flex flex-col items-center">
        <span
          className={`font-bold ${sizes.fullName} leading-tight`}
          style={{
            fontFamily: "'Amiri', serif",
            color: '#C9A84C',
            letterSpacing: '0.03em',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.4), 0 0 12px rgba(201, 168, 76, 0.5)',
            fontWeight: 700,
            WebkitTextStroke: '0.4px rgba(244, 228, 166, 0.4)',
          }}
        >
          {storeName}
        </span>

        {/* LAMSA */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-4 h-[1px] bg-[#C9A84C]" />
          <span
            className={`${sizes.subtext} text-[#C9A84C] tracking-[0.3em] font-bold`}
            style={{ fontFamily: "'Reem Kufi', sans-serif" }}
          >
            LAMSA
          </span>
          <span className="w-4 h-[1px] bg-[#C9A84C]" />
        </div>
      </div>

      {size === 'lg' && (
        <p
          className="mt-3 text-sm text-[#6b5a4a] tracking-widest"
          style={{ fontFamily: "'Amiri', serif", fontStyle: 'italic' }}
        >
          متجر {storeName} يرحب بكم
        </p>
      )}
    </div>
  );
}
