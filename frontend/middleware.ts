import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

let clerkHandler: any = null;

export default function middleware(req: any, event: any) {
  if (isDevBypass) {
    return NextResponse.next();
  }

  if (!clerkHandler) {
    const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
    clerkHandler = clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    });
  }

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
