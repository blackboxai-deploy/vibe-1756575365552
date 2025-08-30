// Currency formatting utilities for the bill management app

/**
 * Format amount as currency
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format amount as compact currency (e.g., $1.2K, $1.5M)
 */
export const formatCompactCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  if (amount >= 1000000) {
    return formatCurrency(amount / 1000000, currency, locale).replace(/\.00$/, '') + 'M';
  } else if (amount >= 1000) {
    return formatCurrency(amount / 1000, currency, locale).replace(/\.00$/, '') + 'K';
  } else {
    return formatCurrency(amount, currency, locale);
  }
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and spaces
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (amount: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
};

/**
 * Format percentage
 */
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Calculate total from array of amounts
 */
export const calculateTotal = (amounts: number[]): number => {
  return amounts.reduce((total, amount) => total + amount, 0);
};

/**
 * Calculate average from array of amounts
 */
export const calculateAverage = (amounts: number[]): number => {
  if (amounts.length === 0) return 0;
  return calculateTotal(amounts) / amounts.length;
};

/**
 * Round to nearest cent
 */
export const roundToCents = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

/**
 * Check if amount is valid
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Convert string to valid amount
 */
export const toValidAmount = (value: string | number): number => {
  if (typeof value === 'number') {
    return isValidAmount(value) ? roundToCents(value) : 0;
  }
  
  const parsed = parseCurrency(value);
  return isValidAmount(parsed) ? roundToCents(parsed) : 0;
};

/**
 * Format amount difference (with + or - sign)
 */
export const formatAmountDifference = (
  current: number, 
  previous: number, 
  currency: string = 'USD'
): { formatted: string; isPositive: boolean; percentage: number } => {
  const difference = current - previous;
  const isPositive = difference >= 0;
  const percentage = previous !== 0 ? (difference / previous) * 100 : 0;
  
  const sign = isPositive ? '+' : '';
  const formatted = `${sign}${formatCurrency(Math.abs(difference), currency)}`;
  
  return {
    formatted,
    isPositive,
    percentage
  };
};

/**
 * Get color class for amount status
 */
export const getAmountColorClass = (amount: number, threshold: number = 0): string => {
  if (amount > threshold) {
    return 'text-red-600'; // Over budget/high amount
  } else if (amount === threshold) {
    return 'text-yellow-600'; // At threshold
  } else {
    return 'text-green-600'; // Under budget/good
  }
};

/**
 * Format budget status
 */
export const formatBudgetStatus = (
  spent: number, 
  budget: number, 
  currency: string = 'USD'
): {
  formatted: string;
  percentage: number;
  status: 'under' | 'at' | 'over';
  colorClass: string;
} => {
  const percentage = calculatePercentage(spent, budget);
  let status: 'under' | 'at' | 'over';
  let colorClass: string;
  
  if (spent < budget) {
    status = 'under';
    colorClass = 'text-green-600';
  } else if (spent === budget) {
    status = 'at';
    colorClass = 'text-yellow-600';
  } else {
    status = 'over';
    colorClass = 'text-red-600';
  }
  
  const remaining = budget - spent;
  const formatted = remaining >= 0 
    ? `${formatCurrency(remaining, currency)} remaining`
    : `${formatCurrency(Math.abs(remaining), currency)} over budget`;
  
  return {
    formatted,
    percentage,
    status,
    colorClass
  };
};