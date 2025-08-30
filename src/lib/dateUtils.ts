// Date utility functions for the bill management app

import { BillFrequency } from './billsData';

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = { month: 'short', day: 'numeric' };
      break;
    case 'medium':
      options = { month: 'short', day: 'numeric', year: 'numeric' };
      break;
    case 'long':
      options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      break;
    default:
      options = { month: 'short', day: 'numeric', year: 'numeric' };
  }
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Get relative date string (e.g., "3 days ago", "in 5 days")
 */
export const getRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 1) {
    return `in ${diffDays} days`;
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDate: string | Date): boolean => {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Check if a date is due soon (within next 7 days)
 */
export const isDueSoon = (dueDate: string | Date, days: number = 7): boolean => {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  today.setHours(0, 0, 0, 0);
  futureDate.setHours(23, 59, 59, 999);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj >= today && dateObj <= futureDate;
};

/**
 * Get days until due date (negative if overdue)
 */
export const getDaysUntilDue = (dueDate: string | Date): number => {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dateObj.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate next due date based on frequency
 */
export const getNextDueDate = (lastDueDate: string | Date, frequency: BillFrequency): Date => {
  const dateObj = typeof lastDueDate === 'string' ? new Date(lastDueDate) : lastDueDate;
  const nextDate = new Date(dateObj);
  
  switch (frequency) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'semi-annual':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

/**
 * Get current month in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Get month name from YYYY-MM format
 */
export const getMonthName = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Get start and end dates of current month
 */
export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Get start and end dates of a specific month
 */
export const getMonthRange = (yearMonth: string): { start: string; end: string } => {
  const [year, month] = yearMonth.split('-');
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

/**
 * Get last N months in YYYY-MM format
 */
export const getLastNMonths = (n: number): string[] => {
  const months: string[] = [];
  const now = new Date();
  
  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months;
};

/**
 * Convert date to input format (YYYY-MM-DD)
 */
export const toInputDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Check if date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get date range for filtering bills
 */
export const getDateRangeFilter = (filter: 'today' | 'week' | 'month' | 'year'): { start: string; end: string } => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  
  switch (filter) {
    case 'today':
      break;
    case 'week':
      start.setDate(today.getDate() - 7);
      break;
    case 'month':
      start.setDate(today.getDate() - 30);
      break;
    case 'year':
      start.setFullYear(today.getFullYear() - 1);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};