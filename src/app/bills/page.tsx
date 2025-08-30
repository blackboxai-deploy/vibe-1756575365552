'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import BillsList from '@/components/Bills/BillsList';
import { useBills } from '@/hooks/useBills';
import { Bill } from '@/lib/billsData';

export default function BillsPage() {
  const {
    bills,
    loading,
    error,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid,
    generateNextBill
  } = useBills();

  // Wrapper functions to match the expected interface
  const handleAddBill = async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await addBill(billData);
  };

  const handleEditBill = async (billId: string, updates: Partial<Bill>) => {
    return await updateBill(billId, updates);
  };

  const handleDeleteBill = async (billId: string) => {
    await deleteBill(billId);
  };

  const handleMarkAsPaid = async (billId: string) => {
    await markAsPaid(billId);
  };

  const handleGenerateNext = async (billId: string) => {
    return await generateNextBill(billId);
  };

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to load bills</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <BillsList
        bills={bills}
        onAddBill={handleAddBill}
        onEditBill={handleEditBill}
        onDeleteBill={handleDeleteBill}
        onMarkAsPaid={handleMarkAsPaid}
        onGenerateNext={handleGenerateNext}
        isLoading={loading}
      />
    </AppLayout>
  );
}