'use client';

import { Cloud, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function DashboardNavbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 flex items-center justify-between px-6 border-b border-border-glass">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Cloud className="h-6 w-6 text-neon-cyan" />
        <span className="font-heading font-bold text-lg text-text-primary">
          EDO-Cloud
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-text-secondary hidden md:block">
              {user.name}
            </span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </nav>
  );
}
