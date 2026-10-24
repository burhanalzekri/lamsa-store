import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[Lamsa UI] Unhandled render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="lamsa-error-page" dir="rtl">
          <section className="lamsa-error-card">
            <span className="lamsa-error-icon"><AlertTriangle size={25} /></span>
            <span className="lamsa-error-kicker">لمسة · سنعود حالًا</span>
            <h1>واجهتنا مشكلة غير متوقعة</h1>
            <p>تعطّل عرض هذه الصفحة مؤقتًا. لم نعرض تفاصيل تقنية أو معلوماتك الشخصية. أعيدي المحاولة أو عودي إلى المتجر.</p>
            <div className="lamsa-error-actions"><button onClick={() => window.location.reload()}><RotateCcw size={16} /> إعادة المحاولة</button><a href="/"><ArrowRight size={16} /> العودة للمتجر</a></div>
            <small>رقم التشخيص: {this.state.error?.name || "UI_ERROR"}</small>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
