'use client';

import { Cloud, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface DashboardNavbarProps {
  onMenuToggle?: () => void;
}

export function DashboardNavbar({ onMenuToggle }: DashboardNavbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 flex items-center justify-between px-4 md:px-6 border-b border-border-glass">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-neon-cyan" />
          <span className="font-heading font-bold text-lg text-text-primary">
            EDO-Cloud
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
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
