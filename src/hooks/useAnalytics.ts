'use client';

import { useMemo } from 'react';
import { 
  Bill, 
  CategorySummary, 
  MonthlyAnalytics,
  BillCategory 
} from '@/lib/billsData';
import { PaymentsStorage } from '@/lib/billsStorage';
import { 
  getCurrentMonth, 
  getLastNMonths, 
  getMonthRange,
  getMonthName 
} from '@/lib/dateUtils';
import { calculateTotal, calculateAverage } from '@/lib/currencyUtils';

export const useAnalytics = (bills: Bill[]) => {
  // Get current month spending
  const currentMonthSpending = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const { start, end } = getMonthRange(currentMonth);
    
    const payments = PaymentsStorage.getPaymentsByDateRange(start, end);
    return calculateTotal(payments.map(p => p.amount));
  }, []);

  // Get category breakdown for current month
  const categoryBreakdown = useMemo((): CategorySummary[] => {
    const currentMonth = getCurrentMonth();
    const { start, end } = getMonthRange(currentMonth);
    const payments = PaymentsStorage.getPaymentsByDateRange(start, end);
    
    const categoryMap = new Map<BillCategory, CategorySummary>();
    
    // Initialize categories
    bills.forEach(bill => {
      if (!categoryMap.has(bill.category)) {
        categoryMap.set(bill.category, {
          category: bill.category,
          totalAmount: 0,
          billCount: 0,
          paidAmount: 0,
          pendingAmount: 0
        });
      }
    });
    
    // Calculate category totals
    bills.forEach(bill => {
      const summary = categoryMap.get(bill.category)!;
      summary.totalAmount += bill.amount;
      summary.billCount += 1;
      
      // Calculate paid amount for this category in current month
      const billPayments = payments.filter(p => p.billId === bill.id);
      const paidInMonth = calculateTotal(billPayments.map(p => p.amount));
      summary.paidAmount += paidInMonth;
      
      // Pending amount is difference between total and paid
      const totalPaid = calculateTotal(bill.paymentHistory.map(p => p.amount));
      if (totalPaid < bill.amount) {
        summary.pendingAmount += (bill.amount - totalPaid);
      }
    });
    
    return Array.from(categoryMap.values())
      .filter(cat => cat.billCount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [bills]);

  // Get monthly trends (last 6 months)
  const monthlyTrends = useMemo((): MonthlyAnalytics[] => {
    const months = getLastNMonths(6);
    
    return months.map(month => {
      const { start, end } = getMonthRange(month);
      const payments = PaymentsStorage.getPaymentsByDateRange(start, end);
      
      const totalSpent = calculateTotal(payments.map(p => p.amount));
      const totalBills = new Set(payments.map(p => p.billId)).size;
      const averagePerBill = totalBills > 0 ? totalSpent / totalBills : 0;
      
      // Category breakdown for this month
      const monthCategoryMap = new Map<BillCategory, number>();
      
      payments.forEach(payment => {
        const bill = bills.find(b => b.id === payment.billId);
        if (bill) {
          const current = monthCategoryMap.get(bill.category) || 0;
          monthCategoryMap.set(bill.category, current + payment.amount);
        }
      });
      
      const categoryBreakdown: CategorySummary[] = Array.from(monthCategoryMap.entries())
        .map(([category, amount]) => ({
          category,
          totalAmount: amount,
          billCount: payments.filter(p => {
            const bill = bills.find(b => b.id === p.billId);
            return bill?.category === category;
          }).length,
          paidAmount: amount,
          pendingAmount: 0
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);
      
      return {
        month,
        totalSpent,
        totalBills,
        categoryBreakdown,
        averagePerBill
      };
    }).reverse(); // Most recent first
  }, [bills]);

  // Calculate spending trends
  const spendingTrends = useMemo(() => {
    if (monthlyTrends.length < 2) return { 
      change: 0, 
      percentageChange: 0, 
      isIncreasing: false 
    };
    
    const current = monthlyTrends[0].totalSpent;
    const previous = monthlyTrends[1].totalSpent;
    const change = current - previous;
    const percentageChange = previous > 0 ? (change / previous) * 100 : 0;
    
    return {
      change,
      percentageChange,
      isIncreasing: change > 0
    };
  }, [monthlyTrends]);

  // Get top spending categories
  const topCategories = useMemo(() => {
    return categoryBreakdown
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        percentage: categoryBreakdown.reduce((sum, c) => sum + c.paidAmount, 0) > 0 
          ? Math.round((cat.paidAmount / categoryBreakdown.reduce((sum, c) => sum + c.paidAmount, 0)) * 100)
          : 0
      }));
  }, [categoryBreakdown]);

  // Calculate average monthly spending
  const averageMonthlySpending = useMemo(() => {
    const amounts = monthlyTrends.map(m => m.totalSpent);
    return calculateAverage(amounts);
  }, [monthlyTrends]);

  // Get spending by status
  const spendingByStatus = useMemo(() => {
    const paid = bills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const pending = bills
      .filter(bill => bill.status === 'pending' || bill.status === 'partial')
      .reduce((sum, bill) => {
        const totalPaid = calculateTotal(bill.paymentHistory.map(p => p.amount));
        return sum + (bill.amount - totalPaid);
      }, 0);
    
    const overdue = bills
      .filter(bill => bill.status === 'overdue')
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    return { paid, pending, overdue };
  }, [bills]);

  // Get payment method analysis
  const paymentMethodAnalysis = useMemo(() => {
    const payments = PaymentsStorage.getPayments();
    const methodMap = new Map<string, { count: number; totalAmount: number }>();
    
    payments.forEach(payment => {
      const current = methodMap.get(payment.paymentMethod) || { count: 0, totalAmount: 0 };
      methodMap.set(payment.paymentMethod, {
        count: current.count + 1,
        totalAmount: current.totalAmount + payment.amount
      });
    });
    
    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        ...data,
        averageAmount: data.totalAmount / data.count
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, []);

  // Get yearly summary
  const yearlySummary = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    const yearPayments = PaymentsStorage.getPaymentsByDateRange(startDate, endDate);
    const totalSpent = calculateTotal(yearPayments.map(p => p.amount));
    
    const monthlyAverages = monthlyTrends
      .filter(m => m.month.startsWith(currentYear.toString()))
      .map(m => m.totalSpent);
    
    const averageMonthly = calculateAverage(monthlyAverages);
    const projectedYearly = averageMonthly * 12;
    
    return {
      totalSpent,
      averageMonthly,
      projectedYearly,
      monthsCompleted: monthlyAverages.length
    };
  }, [monthlyTrends]);

  // Format data for charts
  const chartData = useMemo(() => {
    return {
      monthlySpending: monthlyTrends.map(m => ({
        month: getMonthName(m.month),
        amount: m.totalSpent,
        bills: m.totalBills
      })),
      categoryPie: topCategories.map(cat => ({
        name: cat.category,
        value: cat.paidAmount,
        percentage: cat.percentage
      })),
      statusBreakdown: [
        { name: 'Paid', value: spendingByStatus.paid, color: '#10b981' },
        { name: 'Pending', value: spendingByStatus.pending, color: '#f59e0b' },
        { name: 'Overdue', value: spendingByStatus.overdue, color: '#ef4444' }
      ]
    };
  }, [monthlyTrends, topCategories, spendingByStatus]);

  return {
    currentMonthSpending,
    categoryBreakdown,
    monthlyTrends,
    spendingTrends,
    topCategories,
    averageMonthlySpending,
    spendingByStatus,
    paymentMethodAnalysis,
    yearlySummary,
    chartData
  };
};