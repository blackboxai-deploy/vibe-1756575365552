// Data types and interfaces for the bill management app

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  category: BillCategory;
  frequency: BillFrequency;
  status: BillStatus;
  paymentHistory: PaymentRecord[];
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paidDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type BillCategory = 
  | 'utilities'
  | 'rent'
  | 'mortgage'
  | 'insurance'
  | 'subscriptions'
  | 'internet'
  | 'phone'
  | 'food'
  | 'transportation'
  | 'healthcare'
  | 'entertainment'
  | 'other';

export type BillFrequency = 
  | 'monthly'
  | 'quarterly' 
  | 'semi-annual'
  | 'annual';

export type BillStatus = 
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'partial';

export type PaymentMethod = 
  | 'credit-card'
  | 'debit-card'
  | 'bank-transfer'
  | 'cash'
  | 'check'
  | 'digital-wallet'
  | 'auto-pay';

export interface BillSummary {
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  upcomingCount: number;
  overdueCount: number;
}

export interface CategorySummary {
  category: BillCategory;
  totalAmount: number;
  billCount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM format
  totalSpent: number;
  totalBills: number;
  categoryBreakdown: CategorySummary[];
  averagePerBill: number;
}

// Bill categories with display info
export const BILL_CATEGORIES: Record<BillCategory, { label: string; color: string }> = {
  utilities: { label: 'Utilities', color: 'bg-blue-100 text-blue-800' },
  rent: { label: 'Rent/Mortgage', color: 'bg-green-100 text-green-800' },
  mortgage: { label: 'Mortgage', color: 'bg-green-100 text-green-800' },
  insurance: { label: 'Insurance', color: 'bg-purple-100 text-purple-800' },
  subscriptions: { label: 'Subscriptions', color: 'bg-orange-100 text-orange-800' },
  internet: { label: 'Internet', color: 'bg-indigo-100 text-indigo-800' },
  phone: { label: 'Phone', color: 'bg-pink-100 text-pink-800' },
  food: { label: 'Food & Groceries', color: 'bg-yellow-100 text-yellow-800' },
  transportation: { label: 'Transportation', color: 'bg-red-100 text-red-800' },
  healthcare: { label: 'Healthcare', color: 'bg-teal-100 text-teal-800' },
  entertainment: { label: 'Entertainment', color: 'bg-violet-100 text-violet-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

// Payment methods with display info
export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string }> = {
  'credit-card': { label: 'Credit Card', icon: '💳' },
  'debit-card': { label: 'Debit Card', icon: '💳' },
  'bank-transfer': { label: 'Bank Transfer', icon: '🏦' },
  'cash': { label: 'Cash', icon: '💵' },
  'check': { label: 'Check', icon: '🏦' },
  'digital-wallet': { label: 'Digital Wallet', icon: '📱' },
  'auto-pay': { label: 'Auto Pay', icon: '🔄' }
};

// Bill status with display info
export const BILL_STATUS: Record<BillStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' },
  partial: { label: 'Partially Paid', color: 'bg-orange-100 text-orange-800 border-orange-200' }
};

// Frequency options
export const BILL_FREQUENCIES: Record<BillFrequency, { label: string; months: number }> = {
  monthly: { label: 'Monthly', months: 1 },
  quarterly: { label: 'Quarterly', months: 3 },
  'semi-annual': { label: 'Semi-Annual', months: 6 },
  annual: { label: 'Annual', months: 12 }
};

// Default bill template
export const createDefaultBill = (): Omit<Bill, 'id'> => ({
  name: '',
  amount: 0,
  dueDate: new Date().toISOString().split('T')[0],
  category: 'other',
  frequency: 'monthly',
  status: 'pending',
  paymentHistory: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};