import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook, Send, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function About() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    toast.success("تم إرسال رسالتك! سنتواصل معك قريباً.");
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline"><ArrowRight size={20}/> العودة للرئيسية</button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* من نحن */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-[#482d39]/10 rounded-full flex items-center justify-center mb-6">
              <Info className="text-[#482d39]" size={32}/>
            </div>
            <h1 className="text-2xl font-bold text-[#34212a] mb-4">من نحن</h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              لمسة هي متجر أزياء عربي يهدف إلى تقديم قطع يومية مختارة بعناية للباحثات عن إطلالة عصرية بسعر واضح.
            </p>
            <p className="text-gray-600 leading-relaxed">
              نؤمن أن القطعة الجميلة هي التي تمنحك مساحة لتكوني أنتِ. لذلك نختار كل قطعة بعناية، ونعرض السعر والمقاسات والتوفر بشفافية كاملة.
            </p>
          </div>

          {/* اتصل بنا */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#34212a] mb-6">اتصل بنا</h2>
            
            <div className="space-y-4 mb-6 text-gray-600">
              <div className="flex items-center gap-3"><Phone className="text-[#d93844]" size={20}/> <a href="tel:+967775799926" dir="ltr" className="hover:text-[#d93844] font-bold">+967 775 799 926</a></div>
              <div className="flex items-center gap-3"><Mail className="text-[#d93844]" size={20}/> <a href="mailto:burhanalzekri77@gmail.com" className="hover:text-[#d93844] font-bold">burhanalzekri77@gmail.com</a></div>
              <div className="flex items-center gap-3"><MapPin className="text-[#d93844]" size={20}/> <span>اليمن - تعز</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="اسمك" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-lg text-sm" />
              <input required type="email" placeholder="بريدك الإلكتروني" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border p-3 rounded-lg text-sm" dir="ltr" />
              <textarea required placeholder="رسالتك..." value={form.message} onChange={e=>setForm({...form, message: e.target.value})} className="w-full border p-3 rounded-lg text-sm" rows={3}></textarea>
              <button type="submit" className="w-full bg-[#482d39] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2"><Send size={16}/> إرسال الرسالة</button>
            </form>
          </div>
        </div>

        {/* تابعينا */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h3 className="font-bold text-[#34212a] mb-4">تابعينا على</h3>
          <div className="flex justify-center gap-4">
            <a href="#" className="w-12 h-12 bg-[#482d39]/10 rounded-full flex items-center justify-center text-[#482d39] hover:bg-[#482d39] hover:text-white transition"><Instagram size={24}/></a>
            <a href="#" className="w-12 h-12 bg-[#482d39]/10 rounded-full flex items-center justify-center text-[#482d39] hover:bg-[#482d39] hover:text-white transition"><Facebook size={24}/></a>
          </div>
        </div>
      </div>
    </div>
  );
}
