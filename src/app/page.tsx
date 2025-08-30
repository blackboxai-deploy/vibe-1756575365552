'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';
import UpcomingBills from '@/components/Dashboard/UpcomingBills';
import { useBills } from '@/hooks/useBills';

export default function DashboardPage() {
  const {
    bills,
    loading,
    error,
    markAsPaid,
    getBillSummary,
    getUpcomingBills,
    getOverdueBills
  } = useBills();

  const summary = getBillSummary();
  const upcomingBills = getUpcomingBills(7); // Next 7 days
  const overdueBills = getOverdueBills();

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await markAsPaid(billId);
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Get an overview of your bills and payments
          </p>
        </div>

        {/* Dashboard Overview */}
        <DashboardOverview 
          summary={summary} 
          isLoading={loading} 
        />

        {/* Upcoming Bills */}
        <div className="grid gap-6 lg:grid-cols-1">
          <UpcomingBills
            upcomingBills={upcomingBills}
            overdueBills={overdueBills}
            onMarkAsPaid={handleMarkAsPaid}
            isLoading={loading}
          />
        </div>

        {/* Quick Actions */}
        {!loading && bills.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Bill Manager!</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first bill to track your monthly expenses
            </p>
            <div className="flex justify-center gap-3">
              <a 
                href="/bills" 
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Your First Bill
              </a>
              <a 
                href="/analytics" 
                className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
              >
                View Analytics
              </a>
            </div>
          </div>
        )}

        {/* Summary Stats for existing users */}
        {!loading && bills.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="text-3xl font-bold">
                {summary.totalBills}
              </div>
              <div className="text-blue-100">Total Bills Managed</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="text-3xl font-bold">
                {summary.upcomingCount}
              </div>
              <div className="text-green-100">Upcoming This Week</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="text-3xl font-bold">
                {Math.round((summary.paidAmount / (summary.totalAmount || 1)) * 100)}%
              </div>
              <div className="text-purple-100">Payment Completion</div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}