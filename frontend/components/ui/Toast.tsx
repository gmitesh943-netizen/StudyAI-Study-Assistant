"use client";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg",
              toast.type === "success" && "border-green-500/30",
              toast.type === "error" && "border-red-500/30"
            )}
          >
            <Icon className={cn("h-5 w-5", toast.type === "success" ? "text-green-500" : toast.type === "error" ? "text-red-500" : "text-primary")} />
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
