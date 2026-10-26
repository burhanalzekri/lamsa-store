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

  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  };

  // استخراج الحروف الأولى (للإنجليزية)
  const initials = storeName.split(' ').map(w => w[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center" dir="rtl">
      {/* اسم المتجر */}
      <h1
        className={`luxury-title ${sizeClasses[size]} leading-none`}
        style={{
          fontFamily: "'Reem Kufi', 'Amiri', sans-serif",
          fontWeight: 700,
          background: 'linear-gradient(135deg, #C9A84C 0%, #F4E4A6 25%, #C9A84C 50%, #A88B2E 75%, #F4E4A6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 2px 4px rgba(201,168,76,0.3)',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          letterSpacing: '0.1em',
          transform: 'perspective(500px) rotateX(5deg)',
        }}
      >
        {storeName}
      </h1>

      {/* الخط الزخرفي */}
      <div className="flex items-center gap-2 mt-2">
        <span className="w-8 h-[1px] bg-gradient-to-l from-transparent via-[#C9A84C] to-[#C9A84C]" />
        <span className="text-xs text-[#C9A84C] tracking-[0.4em] font-bold" style={{ fontFamily: "'Reem Kufi', sans-serif" }}>
          {initials}
        </span>
        <span className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-[#C9A84C]" />
      </div>

      {/* العبارة الترحيبية */}
      {size !== 'sm' && (
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
