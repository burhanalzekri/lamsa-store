import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title = "تأكيد العملية",
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: { icon: 'text-red-500', button: 'bg-red-600 hover:bg-red-700', iconBg: 'bg-red-50' },
    warning: { icon: 'text-orange-500', button: 'bg-orange-600 hover:bg-orange-700', iconBg: 'bg-orange-50' },
    info: { icon: 'text-blue-500', button: 'bg-blue-600 hover:bg-blue-700', iconBg: 'bg-blue-50' },
  };
  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* الخلفية المعتمة */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      
      {/* النافذة */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onCancel} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <div className={`w-14 h-14 rounded-full ${style.iconBg} flex items-center justify-center mb-4 mx-auto`}>
          <AlertTriangle className={style.icon} size={28} />
        </div>
        
        <h3 className="text-xl font-bold text-[#482d39] text-center mb-2">{title}</h3>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${style.button} text-white py-2.5 rounded-lg font-bold transition-colors shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
