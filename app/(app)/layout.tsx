export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-[var(--parchment)]">
      {children}
    </main>
  );
}
