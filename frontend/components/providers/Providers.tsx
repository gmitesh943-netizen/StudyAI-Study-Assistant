"use client";

import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/Toast";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
