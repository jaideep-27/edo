'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, GitCompareArrows, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Experiments', href: '/dashboard/experiments', icon: FlaskConical },
  { label: 'Compare', href: '/dashboard/compare', icon: GitCompareArrows },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-panel border-r border-border-glass flex flex-col z-40">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
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
  );
}
