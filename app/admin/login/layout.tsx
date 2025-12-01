export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout removes the navbar and footer for the login page
  return <>{children}</>;
}
