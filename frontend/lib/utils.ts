import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Empty = same origin (proxied via next.config rewrites to backend)
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
