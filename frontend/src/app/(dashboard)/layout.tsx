'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FloatingTimer } from '@/components/layout/FloatingTimer';
import { SplashLoader } from '@/components/ui/SplashLoader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <SplashLoader message="Welcome back" loading={loading} />;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <FloatingTimer />
      </div>
    </div>
  );
}
