export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-blue-600/20 to-transparent blur-3xl animate-gradient" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-tl from-blue-800/20 to-transparent blur-3xl animate-gradient" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl animate-float" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
