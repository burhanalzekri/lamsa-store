import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      dir="rtl"
      position="top-center"
      closeButton
      richColors
      duration={4200}
      icons={{
        success: <CircleCheck size={19} strokeWidth={1.8} />,
        error: <CircleX size={19} strokeWidth={1.8} />,
        warning: <TriangleAlert size={19} strokeWidth={1.8} />,
        info: <Info size={19} strokeWidth={1.8} />,
        loading: <LoaderCircle size={19} className="animate-spin" />,
      }}
      className="lamsa-toaster group"
      toastOptions={{
        classNames: {
          toast: "lamsa-toast",
          title: "lamsa-toast-title",
          description: "lamsa-toast-description",
          actionButton: "lamsa-toast-action",
          cancelButton: "lamsa-toast-cancel",
          closeButton: "lamsa-toast-close",
          success: "lamsa-toast-success",
          error: "lamsa-toast-error",
          warning: "lamsa-toast-warning",
          info: "lamsa-toast-info",
          loading: "lamsa-toast-loading",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
