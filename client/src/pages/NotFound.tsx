import { ArrowRight, CircleHelp, Home, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const NOT_FOUND_PATH = "/404";

export default function NotFound() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    if (window.location.pathname.replace(/\/$/, "") !== NOT_FOUND_PATH) window.location.replace(NOT_FOUND_PATH);
    return () => robots.remove();
  }, []);

  return (
    <main className="lamsa-not-found" dir="rtl">
      <div className="nf-orbit nf-orbit-one" /><div className="nf-orbit nf-orbit-two" />
      <a className="nf-brand" href="/"><span className="nf-brand-mark">ل</span><span>لمسة<small>LAMSA</small></span></a>
      <section className="nf-card">
        <span className="nf-icon"><CircleHelp size={28} strokeWidth={1.35} /></span>
        <span className="nf-kicker"><Sparkles size={13} /> يبدو أننا فقدنا الخيط</span>
        <strong className="nf-code">404</strong>
        <h1>هذه الصفحة غير موجودة</h1>
        <p>قد يكون الرابط تغيّر أو أن الصفحة لم تُضف بعد. لا بأس — نأخذك إلى اختيارات لمسة.</p>
        <button onClick={() => setLocation("/")}><Home size={16} /> العودة إلى المتجر <ArrowRight size={16} /></button>
        <span className="nf-help-link">إذا كان الرابط يفترض أن يعمل، تواصلي مع المتجر عبر الرقم المعلن عند إضافته.</span>
      </section>
      <span className="nf-footer">LAMSA · STYLE WITH A SOFTER TOUCH</span>
    </main>
  );
}
