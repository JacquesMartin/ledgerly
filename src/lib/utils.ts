import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserPreferences } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: UserPreferences['currency']) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency,
  });
}
