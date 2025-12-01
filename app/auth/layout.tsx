import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Miran Army to save your favorite finds",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clean layout without navbar/footer for auth pages
  return <>{children}</>;
}
