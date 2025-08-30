'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bill, 
  PaymentRecord, 
  BillStatus, 
  BillCategory,
  BillSummary,
  generateId,
  createDefaultBill 
} from '@/lib/billsData';
import { BillsStorage, PaymentsStorage } from '@/lib/billsStorage';
import { isOverdue, isDueSoon, getNextDueDate } from '@/lib/dateUtils';

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bills from storage on mount
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = useCallback(() => {
    try {
      setLoading(true);
      const storedBills = BillsStorage.getBills();
      
      // Update bill statuses based on due dates
      const updatedBills = storedBills.map(bill => updateBillStatus(bill));
      setBills(updatedBills);
      setError(null);
    } catch (err) {
      setError('Failed to load bills');
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update bill status based on due date and payment history
  const updateBillStatus = (bill: Bill): Bill => {
    const totalPaid = bill.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    
    let status: BillStatus;
    if (totalPaid >= bill.amount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    } else if (isOverdue(bill.dueDate)) {
      status = 'overdue';
    } else {
      status = 'pending';
    }
    
    return { ...bill, status };
  };

  // Add a new bill
  const addBill = useCallback(async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBill: Bill = {
        ...billData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      BillsStorage.addBill(newBill);
      setBills(prev => [...prev, newBill]);
      return newBill;
    } catch (err) {
      setError('Failed to add bill');
      throw err;
    }
  }, []);

  // Update an existing bill
  const updateBill = useCallback(async (billId: string, updates: Partial<Bill>) => {
    try {
      const existingBill = bills.find(b => b.id === billId);
      if (!existingBill) {
        throw new Error('Bill not found');
      }
      
      const updatedBill = { 
        ...existingBill, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      
      BillsStorage.updateBill(updatedBill);
      setBills(prev => prev.map(bill => 
        bill.id === billId ? updateBillStatus(updatedBill) : bill
      ));
      
      return updatedBill;
    } catch (err) {
      setError('Failed to update bill');
      throw err;
    }
  }, [bills]);

  // Delete a bill
  const deleteBill = useCallback(async (billId: string) => {
    try {
      BillsStorage.deleteBill(billId);
      setBills(prev => prev.filter(bill => bill.id !== billId));
    } catch (err) {
      setError('Failed to delete bill');
      throw err;
    }
  }, []);

  // Add payment to a bill
  const addPayment = useCallback(async (billId: string, paymentData: Omit<PaymentRecord, 'id' | 'billId'>) => {
    try {
      const payment: PaymentRecord = {
        ...paymentData,
        id: generateId(),
        billId,
      };
      
      PaymentsStorage.addPayment(payment);
      
      // Update the bill with the new payment
      const bill = bills.find(b => b.id === billId);
      if (bill) {
        const updatedBill = {
          ...bill,
          paymentHistory: [...bill.paymentHistory, payment],
          updatedAt: new Date().toISOString()
        };
        
        BillsStorage.updateBill(updatedBill);
        setBills(prev => prev.map(b => 
          b.id === billId ? updateBillStatus(updatedBill) : b
        ));
      }
      
      return payment;
    } catch (err) {
      setError('Failed to add payment');
      throw err;
    }
  }, [bills]);

  // Mark bill as paid (quick action)
  const markAsPaid = useCallback(async (billId: string, paymentMethod: string = 'credit-card') => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) {
        throw new Error('Bill not found');
      }
      
      const remainingAmount = bill.amount - bill.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
      
      if (remainingAmount > 0) {
        await addPayment(billId, {
          amount: remainingAmount,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: paymentMethod as PaymentRecord['paymentMethod'],
        });
      }
    } catch (err) {
      setError('Failed to mark bill as paid');
      throw err;
    }
  }, [bills, addPayment]);

  // Generate next bill occurrence
  const generateNextBill = useCallback(async (billId: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) {
        throw new Error('Bill not found');
      }
      
      const nextDueDate = getNextDueDate(bill.dueDate, bill.frequency);
      const nextBill = {
        ...createDefaultBill(),
        name: bill.name,
        amount: bill.amount,
        category: bill.category,
        frequency: bill.frequency,
        dueDate: nextDueDate.toISOString().split('T')[0],
        notes: bill.notes,
      };
      
      return await addBill(nextBill);
    } catch (err) {
      setError('Failed to generate next bill');
      throw err;
    }
  }, [bills, addBill]);

  // Search bills
  const searchBills = useCallback((query: string): Bill[] => {
    if (!query.trim()) return bills;
    
    const lowercaseQuery = query.toLowerCase();
    return bills.filter(bill => 
      bill.name.toLowerCase().includes(lowercaseQuery) ||
      bill.category.toLowerCase().includes(lowercaseQuery) ||
      (bill.notes && bill.notes.toLowerCase().includes(lowercaseQuery))
    );
  }, [bills]);

  // Filter bills
  const filterBills = useCallback((filters: {
    status?: BillStatus[];
    category?: BillCategory[];
    dueSoon?: boolean;
    overdue?: boolean;
  }): Bill[] => {
    return bills.filter(bill => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(bill.status)) {
        return false;
      }
      
      if (filters.category && filters.category.length > 0 && !filters.category.includes(bill.category)) {
        return false;
      }
      
      if (filters.dueSoon && !isDueSoon(bill.dueDate)) {
        return false;
      }
      
      if (filters.overdue && !isOverdue(bill.dueDate)) {
        return false;
      }
      
      return true;
    });
  }, [bills]);

  // Get bill summary
  const getBillSummary = useCallback((): BillSummary => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const paidBills = bills.filter(bill => bill.status === 'paid');
    const paidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const pendingBills = bills.filter(bill => bill.status === 'pending');
    const pendingAmount = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const overdueBills = bills.filter(bill => bill.status === 'overdue');
    const overdueAmount = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    const upcomingBills = bills.filter(bill => isDueSoon(bill.dueDate) && bill.status !== 'paid');
    
    return {
      totalBills,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      upcomingCount: upcomingBills.length,
      overdueCount: overdueBills.length,
    };
  }, [bills]);

  // Get upcoming bills
  const getUpcomingBills = useCallback((days: number = 7): Bill[] => {
    return bills
      .filter(bill => isDueSoon(bill.dueDate, days) && bill.status !== 'paid')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  // Get overdue bills
  const getOverdueBills = useCallback((): Bill[] => {
    return bills
      .filter(bill => bill.status === 'overdue')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  return {
    bills,
    loading,
    error,
    addBill,
    updateBill,
    deleteBill,
    addPayment,
    markAsPaid,
    generateNextBill,
    searchBills,
    filterBills,
    getBillSummary,
    getUpcomingBills,
    getOverdueBills,
    refreshBills: loadBills,
  };
};