'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, GitCompareArrows, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Experiments', href: '/dashboard/experiments', icon: FlaskConical },
  { label: 'Compare', href: '/dashboard/compare', icon: GitCompareArrows },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-canvas/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 w-64 bg-panel border-r border-border-glass flex flex-col z-50 transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 lg:pt-4">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-neon-cyan-dim text-neon-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-overlay'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border-glass">
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-text-tertiary">EDO-Cloud Scheduler</p>
            <p className="text-xs text-text-tertiary mt-0.5">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
