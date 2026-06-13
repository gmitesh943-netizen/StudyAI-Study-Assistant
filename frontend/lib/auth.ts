/** True when running without valid Clerk keys (local demo mode) */
export const DEV_BYPASS =
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    !DEV_BYPASS &&
    key.startsWith("pk_") &&
    !key.includes("demo") &&
    key.length > 20
  );
}
