
import React from 'react';
import { Toast as ToastType } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const ToastItem: React.FC<{ toast: ToastType; onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: "border-l-4 border-l-green-500",
    error: "border-l-4 border-l-red-500",
    warning: "border-l-4 border-l-yellow-500",
    info: "border-l-4 border-l-blue-500",
  };

  return (
    <div className={cn(
      "toast-in pointer-events-auto bg-luxury-gray border border-luxury-border shadow-2xl p-4 min-w-[300px] flex items-center justify-between gap-4 rounded-md",
      borders[toast.type]
    )}>
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <p className="text-sm font-medium text-luxury-text">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="text-luxury-text-muted hover:text-luxury-text">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
