import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, ChevronDown, HelpCircle, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "كيف يمكنني تتبع طلبي؟",
      a: "يمكنك تتبع طلبك من خلال صفحة 'تتبع الطلب'، وإدخال رقم الطلب أو رقم جوالك. ستحصل على شريط تقدم يوضح حالة الطلب (قيد الانتظار، تم الشحن، تم التوصيل)."
    },
    {
      q: "ما هي مدة التوصيل؟",
      a: "مدة التوصيل داخل صنعاء من 1 إلى 3 أيام عمل. المحافظات الأخرى من 3 إلى 7 أيام عمل. سيتم التواصل معك لتأكيد موعد التوصيل."
    },
    {
      q: "هل يمكنني إرجاع أو استبدال المنتج؟",
      a: "نعم، يمكنك طلب الاستبدال أو الإرجاع خلال 3 أيام من استلام المنتج، بشرط أن يكون المنتج بحالته الأصلية (غير مستخدم، والبطاقات معلقة). يرجى التواصل معنا عبر الواتساب."
    },
    {
      q: "ما هي طرق الدفع المتاحة؟",
      a: "حالياً نوفر خدمة 'الدفع عند الاستلام' كخيار أساسي. يمكنك الدفع نقداً عند استلام طلبك. (الدفع الإلكتروني قيد التطوير)."
    },
    {
      q: "هل توجد رسوم شحن؟",
      a: "نعم، رسوم الشحن 2,000 ر.ي لجميع المحافظات. الشحن مجاني للطلبات التي تزيد قيمتها عن 20,000 ر.ي."
    },
    {
      q: "كيف يمكنني التواصل معكم؟",
      a: "يمكنك التواصل معنا عبر الواتساب (+967775799926) أو عبر البريد الإلكتروني (burhanalzekri77@gmail.com)، أو من خلال صفحة 'اتصل بنا'."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E0] py-8" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => setLocation('/')} className="mb-6 flex items-center gap-2 text-[#482d39] font-bold hover:underline">
          <ArrowRight size={20} /> العودة للرئيسية
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#482d39]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-[#482d39]" size={32}/>
          </div>
          <h1 className="text-3xl font-bold text-[#34212a]">الأسئلة الشائعة</h1>
          <p className="text-gray-500 mt-2">كل ما تحتاجين معرفته عن التسوق من لمسة</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-4 text-right font-bold text-[#34212a] hover:bg-gray-50 transition"
              >
                {faq.q}
                <ChevronDown size={20} className={`text-[#d93844] transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* سياسة الاستبدال */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-[#34212a] mb-4 flex items-center gap-2"><RefreshCw size={24} className="text-[#d93844]"/> سياسة الاستبدال والإرجاع</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p><b className="text-[#34212a]">1. مدة الإرجاع:</b> يمكنك طلب الاستبدال أو الإرجاع خلال <b>3 أيام</b> من تاريخ الاستلام.</p>
            <p><b className="text-[#34212a]">2. حالة المنتج:</b> يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، مع البطاقات والأغلفة الأصلية.</p>
            <p><b className="text-[#34212a]">3. المنتجات غير القابلة للإرجاع:</b> المنتجات المخفضة (العروض الخاصة) والإكسسوارات الشخصية غير قابلة للإرجاع، إلا في حال وجود عيب مصنعي.</p>
            <p><b className="text-[#34212a]">4. تكاليف الشحن:</b> يتحمل العميل تكاليف شحن الإرجاع (ما لم يكن الخطأ من المتجر).</p>
            <p><b className="text-[#34212a]">5. طريقة الإرجاع:</b> يرجى التواصل معنا عبر الواتساب لتنسيق عملية الإرجاع.</p>
          </div>
        </div>

        {/* الشحن */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-[#34212a] mb-4 flex items-center gap-2"><Truck size={24} className="text-[#d93844]"/> سياسة الشحن</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p><b className="text-[#34212a]">1. رسوم الشحن:</b> 2,000 ر.ي لجميع المحافظات.</p>
            <p><b className="text-[#34212a]">2. الشحن المجاني:</b> للطلبات التي تزيد عن 20,000 ر.ي.</p>
            <p><b className="text-[#34212a]">3. مدة التوصيل:</b> صنعاء (1-3 أيام)، المحافظات الأخرى (3-7 أيام).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
