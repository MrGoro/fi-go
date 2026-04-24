import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  /** Called with `false` when the user dismisses the dialog (close button, overlay click, Escape). */
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
}

/**
 * Lightweight overlay dialog. API mirrors base-ui/Radix/Vaul
 * (`open` / `onOpenChange`) so calling sites are consistent across
 * Dialog, Drawer, and Popover.
 */
export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  const close = () => onOpenChange(false)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
