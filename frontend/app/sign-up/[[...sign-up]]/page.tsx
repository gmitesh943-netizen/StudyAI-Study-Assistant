import { DEV_BYPASS } from "@/lib/auth";
import { SignUp } from "@clerk/nextjs";
import LocalAuthForm from "@/components/auth/LocalAuthForm";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function SignUpPage() {
  if (DEV_BYPASS) {
    return <LocalAuthForm mode="sign-up" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl">
        <Brain className="h-8 w-8 text-primary" />
        Study<span className="text-primary">AI</span>
      </Link>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-border rounded-2xl",
          },
        }}
      />
    </div>
  );
}
