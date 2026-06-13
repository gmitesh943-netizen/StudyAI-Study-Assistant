import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ className, hover, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm",
        hover && "card-hover cursor-pointer",
        glass && "glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
