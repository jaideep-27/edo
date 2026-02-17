'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const Icon = ({ type }: { type: ToastType }) => {
    if (type === 'success') return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />;
    if (type === 'error') return <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />;
    return <Info className="h-4 w-4 text-cyan-400 shrink-0" />;
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-up shadow-xl border border-border-glass"
          >
            <Icon type={t.type} />
            <span className="text-sm text-text-primary flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
