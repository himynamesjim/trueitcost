import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate hourly cost from annual revenue and employee count
 * Assumes 2080 working hours per year per employee
 */
export function calculateHourlyCost(annualRevenue: number, employeeCount: number): number {
  const workingHoursPerYear = 2080;
  const totalWorkingHours = workingHoursPerYear * employeeCount;
  return annualRevenue / totalWorkingHours;
}

/**
 * Get risk level label from score
 */
export function getRiskLabel(score: number): string {
  if (score >= 8) return 'Critical';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  if (score >= 2) return 'Low';
  return 'Minimal';
}

/**
 * Get risk color class from score
 */
export function getRiskColor(score: number): string {
  if (score >= 8) return 'text-red-600';
  if (score >= 6) return 'text-orange-500';
  if (score >= 4) return 'text-yellow-500';
  if (score >= 2) return 'text-blue-500';
  return 'text-green-500';
}

/**
 * Get risk background color class from score
 */
export function getRiskBgColor(score: number): string {
  if (score >= 8) return 'bg-red-100';
  if (score >= 6) return 'bg-orange-100';
  if (score >= 4) return 'bg-yellow-100';
  if (score >= 2) return 'bg-blue-100';
  return 'bg-green-100';
}
