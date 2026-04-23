import { useToast } from '@/hooks/use-toast';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center p-4 pointer-events-none gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300",
            "bg-white/80 backdrop-blur-xl border border-white/20",
            toast.variant === 'destructive' && "bg-red-50/90 border-red-200/50 text-red-900",
            toast.variant === 'success' && "bg-green-50/90 border-green-200/50 text-green-900"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.variant === 'destructive' ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : toast.variant === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Info className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>}
            {toast.description && (
              <p className={cn(
                "text-xs mt-1 opacity-80 leading-snug",
                toast.variant === 'destructive' ? "text-red-800/80" : "text-muted-foreground"
              )}>
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4 opacity-40" />
          </button>
        </div>
      ))}
    </div>
  );
}
