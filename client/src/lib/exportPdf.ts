/**
 * EDO-Cloud Scheduler — PDF Report Generator
 *
 * Generates a professional, multi-page PDF report from experiment + result data.
 * Uses jsPDF + jspdf-autotable for tables, and raw canvas drawing for charts.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Experiment } from '@/types/experiment';
import type { ExperimentResult } from '@/types/result';
import { ALGORITHMS } from '@/lib/constants';

/* ────────────────────────────────────────── *
 *  Color palette (hex)                       *
 * ────────────────────────────────────────── */
const C = {
  canvas: '#0B0C10',
  panel: '#1F2833',
  panelLight: '#2A3442',
  cyan: '#66FCF1',
  magenta: '#FF2A6D',
  amber: '#FFC857',
  purple: '#6C3CE1',
  green: '#4ADE80',
  textPrimary: '#EAEAF0',
  textSecondary: '#A0A0B0',
  textTertiary: '#666680',
  white: '#FFFFFF',
  border: '#333355',
};

/** Convert hex "#RRGGBB" → [r, g, b] */
function hex(c: string): [number, number, number] {
  const v = c.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** Format a number to a reasonable precision */
function fmt(n: number | undefined, decimals = 4): string {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

/** Draw a rounded rect (filled) */
function roundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillColor: string,
) {
  doc.setFillColor(...hex(fillColor));
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

/** Draw a section title with a colored left accent */
function sectionTitle(doc: jsPDF, y: number, text: string, accentColor: string = C.cyan): number {
  // Accent bar
  doc.setFillColor(...hex(accentColor));
  doc.rect(15, y, 3, 8, 'F');
  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...hex(C.textPrimary));
  doc.text(text, 22, y + 6);
  return y + 14;
}

/** Check if we need a new page, and if so add one with the dark background */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    // Dark background
    doc.setFillColor(...hex(C.canvas));
    doc.rect(0, 0, 210, 297, 'F');
    return 15;
  }
  return y;
}

/* ═══════════════════════════════════════════
 *  MAIN EXPORT FUNCTION
 * ═══════════════════════════════════════════ */
export function exportExperimentPdf(experiment: Experiment, result: ExperimentResult) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;

  // ─── PAGE 1: Cover / Title ───
  doc.setFillColor(...hex(C.canvas));
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Top accent line
  doc.setFillColor(...hex(C.cyan));
  doc.rect(0, 0, pageWidth, 2, 'F');

  // Logo / Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hex(C.cyan));
  doc.text('EDO-CLOUD SCHEDULER', 15, 18);

  // Decorative line
  doc.setDrawColor(...hex(C.border));
  doc.setLineWidth(0.3);
  doc.line(15, 22, pageWidth - 15, 22);

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...hex(C.white));
  doc.text('Experiment Report', 15, 42);

  // Experiment name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...hex(C.cyan));
  doc.text(experiment.name, 15, 54);

  // Meta info row
  const algoInfo = ALGORITHMS.find((a) => a.id === experiment.algorithm);
  doc.setFontSize(10);
  doc.setTextColor(...hex(C.textSecondary));
  const metaLine = `Algorithm: ${algoInfo?.name ?? experiment.algorithm}  •  Status: ${experiment.status.toUpperCase()}  •  ${new Date(experiment.createdAt).toLocaleString()}`;
  doc.text(metaLine, 15, 64);

  // Execution time
  doc.setFontSize(9);
  doc.setTextColor(...hex(C.textTertiary));
  doc.text(`Execution time: ${(result.executionTime / 1000).toFixed(3)}s  •  Result ID: ${result._id}`, 15, 72);

  let y = 84;

  // ─── KEY METRICS CARDS ───
  y = sectionTitle(doc, y, 'Key Metrics');

  const metrics = [
    { label: 'Makespan', value: fmt(result.makespan), unit: 'ms', color: C.cyan },
    { label: 'Energy', value: fmt(result.energy), unit: 'J', color: C.magenta },
    { label: 'Reliability', value: fmt(result.reliability), unit: '', color: C.amber },
    { label: 'Utilization', value: fmt(result.resourceUtilization), unit: '%', color: C.purple },
  ];

  const cardW = 42;
  const cardH = 26;
  const gap = 3;
  const startX = 15;

  metrics.forEach((m, i) => {
    const cx = startX + i * (cardW + gap);
    roundedRect(doc, cx, y, cardW, cardH, 3, C.panel);
    // Top accent
    doc.setFillColor(...hex(m.color));
    doc.rect(cx, y, cardW, 1.5, 'F');
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...hex(C.textTertiary));
    doc.text(m.label, cx + 4, y + 8);
    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...hex(m.color));
    doc.text(m.value, cx + 4, y + 18);
    // Unit
    if (m.unit) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...hex(C.textSecondary));
      const vw = doc.getTextWidth(m.value);
      doc.text(` ${m.unit}`, cx + 4 + vw + 1, y + 18);
    }
  });

  y += cardH + 10;

  // ─── EXPERIMENT CONFIGURATION ───
  y = sectionTitle(doc, y, 'Experiment Configuration');

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    theme: 'plain',
    styles: {
      fillColor: hex(C.panel),
      textColor: hex(C.textSecondary),
      fontSize: 9,
      cellPadding: 3,
      lineColor: hex(C.border),
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: hex(C.panelLight),
      textColor: hex(C.cyan),
      fontStyle: 'bold',
      fontSize: 9,
    },
    head: [['Parameter', 'Value']],
    body: [
      ['Algorithm', algoInfo?.name ?? experiment.algorithm],
      ['Task Count', String(experiment.workloadConfig?.taskCount ?? '—')],
      ['VM Count', String(experiment.vmConfig?.vmCount ?? '—')],
      ['Population Size', String(experiment.hyperparameters?.populationSize ?? '—')],
      ['Max Iterations', String(experiment.hyperparameters?.maxIterations ?? '—')],
      ['Seed', String(experiment.hyperparameters?.seed ?? 'Random')],
      ['Weight — Makespan', String(experiment.hyperparameters?.weights?.makespan ?? '—')],
      ['Weight — Energy', String(experiment.hyperparameters?.weights?.energy ?? '—')],
      ['Weight — Reliability', String(experiment.hyperparameters?.weights?.reliability ?? '—')],
      ['Execution Time', `${(result.executionTime / 1000).toFixed(3)}s`],
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── CONVERGENCE CHART (drawn with lines) ───
  if (result.convergenceData?.length > 1) {
    y = ensureSpace(doc, y, 90);
    y = sectionTitle(doc, y, 'Convergence Curve');

    const chartX = 25;
    const chartY = y + 2;
    const chartW = 160;
    const chartH = 65;

    // Background
    roundedRect(doc, 15, chartY - 2, pageWidth - 30, chartH + 12, 3, C.panel);

    // Axes
    doc.setDrawColor(...hex(C.border));
    doc.setLineWidth(0.3);
    doc.line(chartX, chartY, chartX, chartY + chartH); // Y axis
    doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH); // X axis

    // Grid lines (horizontal)
    doc.setDrawColor(...hex(C.border));
    doc.setLineWidth(0.1);
    for (let g = 1; g <= 4; g++) {
      const gy = chartY + (chartH * g) / 5;
      doc.line(chartX, gy, chartX + chartW, gy);
    }

    // Data
    const data = result.convergenceData;
    const fitnessVals = data.map((d) => d.fitness);
    const minF = Math.min(...fitnessVals);
    const maxF = Math.max(...fitnessVals);
    const range = maxF - minF || 1;

    // Plot points
    const points: [number, number][] = data.map((d, i) => {
      const px = chartX + (i / (data.length - 1)) * chartW;
      const py = chartY + chartH - ((d.fitness - minF) / range) * (chartH - 5);
      return [px, py];
    });

    // Draw the convergence line
    doc.setDrawColor(...hex(C.cyan));
    doc.setLineWidth(0.7);
    for (let i = 1; i < points.length; i++) {
      doc.line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
    }

    // Draw small dots at sampled points
    const dotStep = Math.max(1, Math.floor(points.length / 20));
    doc.setFillColor(...hex(C.cyan));
    for (let i = 0; i < points.length; i += dotStep) {
      doc.circle(points[i][0], points[i][1], 0.6, 'F');
    }
    // Always dot the last point
    doc.circle(points[points.length - 1][0], points[points.length - 1][1], 0.6, 'F');

    // Axis labels
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...hex(C.textTertiary));
    doc.text('0', chartX - 2, chartY + chartH + 3, { align: 'right' });
    doc.text(String(data.length - 1), chartX + chartW, chartY + chartH + 3, { align: 'center' });
    doc.text(fmt(maxF, 2), chartX - 2, chartY + 3, { align: 'right' });
    doc.text(fmt(minF, 2), chartX - 2, chartY + chartH - 1, { align: 'right' });

    // Axis titles
    doc.setFontSize(8);
    doc.setTextColor(...hex(C.textSecondary));
    doc.text('Iteration', chartX + chartW / 2, chartY + chartH + 8, { align: 'center' });

    // Rotated Y-axis label
    doc.text('Fitness', chartX - 12, chartY + chartH / 2, { angle: 90, align: 'center' });

    // Start / End annotations
    doc.setFontSize(7);
    doc.setTextColor(...hex(C.green));
    doc.text(`Start: ${fmt(fitnessVals[0], 4)}`, chartX + 3, chartY + 4);
    doc.setTextColor(...hex(C.cyan));
    doc.text(`Final: ${fmt(fitnessVals[fitnessVals.length - 1], 4)}`, chartX + chartW - 3, chartY + 4, { align: 'right' });

    y = chartY + chartH + 16;
  }

  // ─── CONVERGENCE DATA TABLE (summary) ───
  if (result.convergenceData?.length > 0) {
    y = ensureSpace(doc, y, 50);
    y = sectionTitle(doc, y, 'Convergence Data (Sampled)');

    // Sample at most 15 rows evenly spaced
    const data = result.convergenceData;
    const sampleCount = Math.min(15, data.length);
    const step = Math.max(1, Math.floor(data.length / sampleCount));
    const sampled = [];
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    // Always include last
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      theme: 'plain',
      styles: {
        fillColor: hex(C.panel),
        textColor: hex(C.textSecondary),
        fontSize: 8,
        cellPadding: 2,
        lineColor: hex(C.border),
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: hex(C.panelLight),
        textColor: hex(C.cyan),
        fontStyle: 'bold',
        fontSize: 8,
      },
      head: [['Iteration', 'Fitness', 'Makespan', 'Energy']],
      body: sampled.map((d) => [
        String(d.iteration),
        fmt(d.fitness),
        d.makespan != null ? fmt(d.makespan) : '—',
        d.energy != null ? fmt(d.energy) : '—',
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── TASK SCHEDULE TABLE ───
  if (result.schedule?.length > 0) {
    y = ensureSpace(doc, y, 50);
    y = sectionTitle(doc, y, 'Task Schedule');

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      theme: 'plain',
      styles: {
        fillColor: hex(C.panel),
        textColor: hex(C.textSecondary),
        fontSize: 8,
        cellPadding: 2,
        lineColor: hex(C.border),
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: hex(C.panelLight),
        textColor: hex(C.cyan),
        fontStyle: 'bold',
        fontSize: 8,
      },
      head: [['Task ID', 'VM ID', 'Start Time', 'End Time', 'Duration']],
      body: result.schedule.map((s) => [
        String(s.taskId),
        String(s.vmId),
        s.startTime != null ? fmt(s.startTime, 2) : '—',
        s.endTime != null ? fmt(s.endTime, 2) : '—',
        s.startTime != null && s.endTime != null ? fmt(s.endTime - s.startTime, 2) : '—',
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── VM LOAD DISTRIBUTION ───
  if (result.schedule?.length > 0) {
    y = ensureSpace(doc, y, 60);
    y = sectionTitle(doc, y, 'VM Load Distribution');

    const vmMap: Record<number, number> = {};
    result.schedule.forEach((s) => {
      vmMap[s.vmId] = (vmMap[s.vmId] || 0) + 1;
    });
    const vms = Object.entries(vmMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([vm, count]) => ({ vm: Number(vm), count }));

    const barColors = [C.cyan, C.magenta, C.amber, C.purple, C.green, '#F472B6', '#38BDF8', '#A78BFA'];
    const barChartX = 30;
    const barChartY = y + 2;
    const barChartW = 150;
    const barChartH = 40;
    const maxCount = Math.max(...vms.map((v) => v.count));

    roundedRect(doc, 15, barChartY - 2, pageWidth - 30, barChartH + 14, 3, C.panel);

    // Bars
    const barW = Math.min(18, (barChartW - vms.length * 3) / vms.length);
    const totalBarsW = vms.length * barW + (vms.length - 1) * 3;
    const bStartX = barChartX + (barChartW - totalBarsW) / 2;

    vms.forEach((v, i) => {
      const bx = bStartX + i * (barW + 3);
      const bh = (v.count / maxCount) * (barChartH - 8);
      const by = barChartY + barChartH - bh - 2;
      const color = barColors[i % barColors.length];
      roundedRect(doc, bx, by, barW, bh, 2, color);

      // Count label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...hex(C.white));
      doc.text(String(v.count), bx + barW / 2, by - 2, { align: 'center' });

      // VM label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...hex(C.textTertiary));
      doc.text(`VM ${v.vm}`, bx + barW / 2, barChartY + barChartH + 4, { align: 'center' });
    });

    // Y-axis label
    doc.setFontSize(7);
    doc.setTextColor(...hex(C.textSecondary));
    doc.text('Tasks', barChartX - 8, barChartY + barChartH / 2, { angle: 90, align: 'center' });

    y = barChartY + barChartH + 14;
  }

  // ─── PARETO FRONT ───
  if (result.paretoPoints?.length > 0) {
    y = ensureSpace(doc, y, 80);
    y = sectionTitle(doc, y, 'Pareto Front (Makespan vs Energy)');

    const pX = 30;
    const pY = y + 2;
    const pW = 140;
    const pH = 55;

    roundedRect(doc, 15, pY - 2, pageWidth - 30, pH + 16, 3, C.panel);

    // Axes
    doc.setDrawColor(...hex(C.border));
    doc.setLineWidth(0.3);
    doc.line(pX, pY, pX, pY + pH);
    doc.line(pX, pY + pH, pX + pW, pY + pH);

    // Data ranges
    const msVals = result.paretoPoints.map((p) => p.makespan);
    const enVals = result.paretoPoints.map((p) => p.energy);
    const msMin = Math.min(...msVals);
    const msMax = Math.max(...msVals);
    const enMin = Math.min(...enVals);
    const enMax = Math.max(...enVals);
    const msRange = msMax - msMin || 1;
    const enRange = enMax - enMin || 1;

    // Plot points
    result.paretoPoints.forEach((p, i) => {
      const px = pX + ((p.makespan - msMin) / msRange) * (pW - 10) + 5;
      const py = pY + pH - ((p.energy - enMin) / enRange) * (pH - 10) - 5;
      const color = i === 0 ? C.cyan : C.magenta;
      doc.setFillColor(...hex(color));
      doc.circle(px, py, 1.5, 'F');
    });

    // Axis labels
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...hex(C.textTertiary));
    doc.text(fmt(msMin, 1), pX, pY + pH + 4, { align: 'center' });
    doc.text(fmt(msMax, 1), pX + pW, pY + pH + 4, { align: 'center' });
    doc.text(fmt(enMin, 1), pX - 2, pY + pH - 1, { align: 'right' });
    doc.text(fmt(enMax, 1), pX - 2, pY + 5, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(...hex(C.textSecondary));
    doc.text('Makespan (ms)', pX + pW / 2, pY + pH + 9, { align: 'center' });
    doc.text('Energy (J)', pX - 12, pY + pH / 2, { angle: 90, align: 'center' });

    y = pY + pH + 16;
  }

  // ─── PARETO TABLE ───
  if (result.paretoPoints?.length > 0) {
    y = ensureSpace(doc, y, 40);
    y = sectionTitle(doc, y, 'Pareto Points');

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      theme: 'plain',
      styles: {
        fillColor: hex(C.panel),
        textColor: hex(C.textSecondary),
        fontSize: 8,
        cellPadding: 2,
        lineColor: hex(C.border),
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: hex(C.panelLight),
        textColor: hex(C.cyan),
        fontStyle: 'bold',
        fontSize: 8,
      },
      head: [['#', 'Makespan (ms)', 'Energy (J)', 'Reliability']],
      body: result.paretoPoints.map((p, i) => [
        String(i + 1),
        fmt(p.makespan),
        fmt(p.energy),
        fmt(p.reliability),
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── WORKLOAD CONFIGURATION DETAILS ───
  if (experiment.workloadConfig?.tasks?.length > 0) {
    y = ensureSpace(doc, y, 50);
    y = sectionTitle(doc, y, 'Workload Configuration (Tasks)');

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      theme: 'plain',
      styles: {
        fillColor: hex(C.panel),
        textColor: hex(C.textSecondary),
        fontSize: 8,
        cellPadding: 2,
        lineColor: hex(C.border),
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: hex(C.panelLight),
        textColor: hex(C.cyan),
        fontStyle: 'bold',
        fontSize: 8,
      },
      head: [['Task #', 'Size (MI)', 'CPU (cores)', 'Memory (MB)']],
      body: experiment.workloadConfig.tasks.map((t, i) => [
        String(i),
        String(t.size),
        String(t.cpu),
        String(t.memory),
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── VM CONFIGURATION DETAILS ───
  if (experiment.vmConfig?.vms?.length > 0) {
    y = ensureSpace(doc, y, 50);
    y = sectionTitle(doc, y, 'VM Configuration');

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      theme: 'plain',
      styles: {
        fillColor: hex(C.panel),
        textColor: hex(C.textSecondary),
        fontSize: 8,
        cellPadding: 2,
        lineColor: hex(C.border),
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: hex(C.panelLight),
        textColor: hex(C.cyan),
        fontStyle: 'bold',
        fontSize: 8,
      },
      head: [['VM #', 'MIPS', 'RAM (MB)', 'Bandwidth (Mbps)', 'Storage (GB)']],
      body: experiment.vmConfig.vms.map((v, i) => [
        String(i),
        String(v.mips),
        String(v.ram),
        String(v.bw),
        v.storage != null ? String(v.storage) : '—',
      ]),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── RAW LOGS (if any) ───
  if (result.rawLogs) {
    y = ensureSpace(doc, y, 40);
    y = sectionTitle(doc, y, 'Execution Logs');

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...hex(C.textTertiary));

    const logLines = result.rawLogs.split('\n');
    const maxLogLines = 80; // cap to avoid too many pages
    const lines = logLines.slice(0, maxLogLines);
    for (const line of lines) {
      y = ensureSpace(doc, y, 5);
      // Truncate long lines
      const truncated = line.length > 120 ? line.slice(0, 120) + '…' : line;
      doc.text(truncated, 17, y);
      y += 3.2;
    }
    if (logLines.length > maxLogLines) {
      doc.setTextColor(...hex(C.textSecondary));
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text(`... ${logLines.length - maxLogLines} more lines truncated`, 17, y);
      y += 5;
    }
    y += 5;
  }

  // ─── FOOTER on every page ───
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Bottom accent line
    doc.setFillColor(...hex(C.cyan));
    doc.rect(0, 295, pageWidth, 2, 'F');

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...hex(C.textTertiary));
    doc.text(
      `EDO-Cloud Scheduler  •  Generated ${new Date().toLocaleString()}`,
      15,
      292,
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - 15, 292, { align: 'right' });
  }

  // ─── SAVE ───
  const safeName = experiment.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  doc.save(`EDO_Report_${safeName}.pdf`);
}
