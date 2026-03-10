import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TradeEntry {
  id: string;
  date: string; // ISO string
  result: 'win' | 'loss' | 'breakeven';
  execution?: 'good' | 'bad';
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  risk?: string;
  items: ChecklistItem[];
  type?: 'A+' | 'A' | 'B' | 'C' | 'Core';
}

export interface AnalysisReport {
  id: string;
  pair: string;
  images: string[];
  bias: 'bullish' | 'bearish' | null;
  quality: 'good' | 'risky' | null;
  text: string;
  createdAt: string; // ISO string
}
