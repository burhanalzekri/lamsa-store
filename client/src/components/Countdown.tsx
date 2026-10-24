import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Countdown({ hours = 24 }: { hours?: number }) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-center gap-2 mt-4">
      <Clock size={20} className="text-red-600" />
      <span className="text-sm font-bold text-gray-700">ينتهي العرض خلال:</span>
      <span className="font-mono font-bold text-red-600 text-lg" dir="ltr">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}
