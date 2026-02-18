'use client';

import { useMemo } from 'react';
import { useTheme } from '@/components/theme-provider';

/**
 * Returns chart colour tokens that respond to the current theme.
 * Every Recharts `stroke`, `fill`, tooltip `contentStyle` etc.
 * should reference these instead of hardcoded hex values.
 */
export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(
    () => ({
      grid: theme === 'dark' ? '#1F2833' : '#E5E7EB',
      gridFaint: theme === 'dark' ? '#1F283320' : '#E5E7EB40',
      tick: theme === 'dark' ? '#A0A0B0' : '#555570',
      legendColor: theme === 'dark' ? '#A0A0B0' : '#555570',
      tooltipStyle: {
        backgroundColor: theme === 'dark' ? '#1F2833' : '#FFFFFF',
        border: theme === 'dark'
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 8,
        fontSize: 12,
      } as React.CSSProperties,
      polarGrid: theme === 'dark' ? '#1F2833' : '#E5E7EB',
    }),
    [theme],
  );
}
