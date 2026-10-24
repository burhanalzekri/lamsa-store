import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('');

  const fetchCoupons = async () => {
    const token = localStorage.getItem('lamsa_token');
    const res = await fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setCoupons(await res.json());
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const token = localStorage.getItem('lamsa_token');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: code.toUpperCase(), discountPercent: Number(percent) })
    });
    if (res.ok) {
      toast.success("تم إنشاء الكوبون");
      setCode(''); setPercent(''); fetchCoupons();
    } else {
      toast.error("فشل الإنشاء (قد يكون الكود مكرراً)");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag size={20}/> إدارة الكوبونات</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input required placeholder="كود الكوبون (مثال: LAMSA10)" value={code} onChange={e => setCode(e.target.value)} className="flex-grow border p-2 rounded-lg" />
        <input required type="number" min="1" max="100" placeholder="نسبة الخصم %" value={percent} onChange={e => setPercent(e.target.value)} className="w-32 border p-2 rounded-lg" />
        <button type="submit" className="bg-[#482d39] text-white px-4 rounded-lg font-bold flex items-center gap-1"><Plus size={16}/> إنشاء</button>
      </form>
      <div className="space-y-2">
        {coupons.map(c => (
          <div key={c.id} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50">
            <span className="font-bold text-[#482d39]">{c.code}</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">{c.discountPercent}% خصم</span>
          </div>
        ))}
      </div>
    </div>
  );
}
