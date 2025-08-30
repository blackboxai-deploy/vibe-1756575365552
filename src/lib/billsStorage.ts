// Local storage utilities for bill management

import { Bill, PaymentRecord } from './billsData';

const BILLS_STORAGE_KEY = 'monthly-bills-app-bills';
const PAYMENTS_STORAGE_KEY = 'monthly-bills-app-payments';

// Bills storage operations
export class BillsStorage {
  // Get all bills from localStorage
  static getBills(): Bill[] {
    try {
      const billsJson = localStorage.getItem(BILLS_STORAGE_KEY);
      return billsJson ? JSON.parse(billsJson) : [];
    } catch (error) {
      console.error('Error loading bills from storage:', error);
      return [];
    }
  }

  // Save bills to localStorage
  static saveBills(bills: Bill[]): void {
    try {
      localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
    } catch (error) {
      console.error('Error saving bills to storage:', error);
      throw new Error('Failed to save bills. Storage might be full.');
    }
  }

  // Add a new bill
  static addBill(bill: Bill): void {
    const bills = this.getBills();
    bills.push(bill);
    this.saveBills(bills);
  }

  // Update an existing bill
  static updateBill(updatedBill: Bill): void {
    const bills = this.getBills();
    const index = bills.findIndex(bill => bill.id === updatedBill.id);
    if (index !== -1) {
      bills[index] = { ...updatedBill, updatedAt: new Date().toISOString() };
      this.saveBills(bills);
    } else {
      throw new Error('Bill not found');
    }
  }

  // Delete a bill
  static deleteBill(billId: string): void {
    const bills = this.getBills();
    const filteredBills = bills.filter(bill => bill.id !== billId);
    this.saveBills(filteredBills);
    
    // Also remove associated payment records
    PaymentsStorage.deletePaymentsByBillId(billId);
  }

  // Get bill by ID
  static getBillById(billId: string): Bill | undefined {
    const bills = this.getBills();
    return bills.find(bill => bill.id === billId);
  }

  // Search bills by name or category
  static searchBills(query: string): Bill[] {
    const bills = this.getBills();
    const lowercaseQuery = query.toLowerCase();
    return bills.filter(bill => 
      bill.name.toLowerCase().includes(lowercaseQuery) ||
      bill.category.toLowerCase().includes(lowercaseQuery) ||
      (bill.notes && bill.notes.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// Payment records storage operations
export class PaymentsStorage {
  // Get all payment records from localStorage
  static getPayments(): PaymentRecord[] {
    try {
      const paymentsJson = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      return paymentsJson ? JSON.parse(paymentsJson) : [];
    } catch (error) {
      console.error('Error loading payments from storage:', error);
      return [];
    }
  }

  // Save payment records to localStorage
  static savePayments(payments: PaymentRecord[]): void {
    try {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments to storage:', error);
      throw new Error('Failed to save payments. Storage might be full.');
    }
  }

  // Add a new payment record
  static addPayment(payment: PaymentRecord): void {
    const payments = this.getPayments();
    payments.push(payment);
    this.savePayments(payments);

    // Update the associated bill's payment history
    const bill = BillsStorage.getBillById(payment.billId);
    if (bill) {
      bill.paymentHistory.push(payment);
      BillsStorage.updateBill(bill);
    }
  }

  // Get payments for a specific bill
  static getPaymentsByBillId(billId: string): PaymentRecord[] {
    const payments = this.getPayments();
    return payments.filter(payment => payment.billId === billId);
  }

  // Delete all payments for a specific bill
  static deletePaymentsByBillId(billId: string): void {
    const payments = this.getPayments();
    const filteredPayments = payments.filter(payment => payment.billId !== billId);
    this.savePayments(filteredPayments);
  }

  // Get payments within a date range
  static getPaymentsByDateRange(startDate: string, endDate: string): PaymentRecord[] {
    const payments = this.getPayments();
    return payments.filter(payment => {
      const paymentDate = payment.paidDate;
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }
}

// Data backup and restore utilities
export class DataBackup {
  // Export all data as JSON
  static exportData(): string {
    const bills = BillsStorage.getBills();
    const payments = PaymentsStorage.getPayments();
    
    const exportData = {
      bills,
      payments,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import data from JSON
  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.bills || !Array.isArray(data.bills)) {
        return { success: false, message: 'Invalid data format: missing bills array' };
      }
      
      if (!data.payments || !Array.isArray(data.payments)) {
        return { success: false, message: 'Invalid data format: missing payments array' };
      }

      // Backup existing data before import
      const existingBills = BillsStorage.getBills();
      const existingPayments = PaymentsStorage.getPayments();

      try {
        // Import new data
        BillsStorage.saveBills(data.bills);
        PaymentsStorage.savePayments(data.payments);
        
        return { 
          success: true, 
          message: `Successfully imported ${data.bills.length} bills and ${data.payments.length} payments` 
        };
      } catch (error) {
        // Restore backup if import fails
        BillsStorage.saveBills(existingBills);
        PaymentsStorage.savePayments(existingPayments);
        
        return { 
          success: false, 
          message: 'Failed to import data. Original data has been restored.' 
        };
      }
    } catch (error) {
      return { success: false, message: 'Invalid JSON format' };
    }
  }

  // Clear all data
  static clearAllData(): void {
    localStorage.removeItem(BILLS_STORAGE_KEY);
    localStorage.removeItem(PAYMENTS_STORAGE_KEY);
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; total: number; available: number } {
    try {
      const bills = localStorage.getItem(BILLS_STORAGE_KEY) || '';
      const payments = localStorage.getItem(PAYMENTS_STORAGE_KEY) || '';
      const used = (bills.length + payments.length) * 2; // Rough estimate in bytes
      const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
      
      return {
        used,
        total,
        available: total - used
      };
    } catch (error) {
      return { used: 0, total: 5 * 1024 * 1024, available: 5 * 1024 * 1024 };
    }
  }
}