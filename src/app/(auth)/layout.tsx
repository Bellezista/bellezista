export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Bellezista
          </h1>
          <p className="mt-1 text-sm text-gold">
            El mundo de la belleza, en un solo lugar
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
