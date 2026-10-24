import { useEffect } from "react";
import { toast } from "sonner";

/** Show a branded, human-readable notification for errors outside form/query handlers. */
export default function GlobalFeedback() {
  useEffect(() => {
    const onError = () => {
      toast.error("تعذر إكمال العملية", {
        description: "حدث خطأ غير متوقع. حاولي مرة أخرى، وإذا استمر الخطأ تواصلي مع دعم المتجر.",
        id: "lamsa-global-error",
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      toast.error("لم تكتمل العملية", {
        description: "تحققي من الاتصال ثم أعيدي المحاولة. لم يتم اعتماد أي تغيير غير مؤكد.",
        id: "lamsa-global-rejection",
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
