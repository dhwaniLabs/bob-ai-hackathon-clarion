import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

export function getSeverityClasses(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-950/70 text-red-400 border-red-500/50';
    case 'high':
      return 'bg-amber-950/70 text-amber-400 border-amber-500/50';
    case 'medium':
      return 'bg-yellow-950/70 text-yellow-400 border-yellow-500/50';
    case 'low':
      return 'bg-blue-950/70 text-blue-400 border-blue-500/50';
    default:
      return 'bg-slate-900/70 text-slate-400 border-slate-700/50';
  }
}

export function getPriorityClasses(priority?: string): string {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/60 font-semibold';
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/60 font-semibold';
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/60';
    case 'LOW':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export function getStatusClasses(status?: string): string {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'bg-red-900/30 text-red-300 border-red-500/40';
    case 'ACTIVE':
      return 'bg-cyan-950/50 text-cyan-300 border-cyan-500/50 animate-pulse';
    case 'FALSE_POSITIVE':
      return 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40';
    case 'ESCALATED':
      return 'bg-purple-950/50 text-purple-300 border-purple-500/50';
    case 'RESOLVED':
    case 'CONTAINED':
      return 'bg-slate-800/80 text-slate-300 border-slate-700';
    default:
      return 'bg-slate-800/50 text-slate-400 border-slate-700';
  }
}

export function getRiskColor(score: number): string {
  if (score >= 85) return '#ef4444'; // Red
  if (score >= 70) return '#f59e0b'; // Amber
  if (score >= 40) return '#eab308'; // Yellow
  return '#3b82f6'; // Blue
}
