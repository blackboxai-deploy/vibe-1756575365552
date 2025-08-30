'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill, BILL_CATEGORIES, BILL_STATUS } from '@/lib/billsData';
import { formatCurrency } from '@/lib/currencyUtils';
import { formatDate, getDaysUntilDue, isOverdue } from '@/lib/dateUtils';

interface UpcomingBillsProps {
  upcomingBills: Bill[];
  overdueBills: Bill[];
  onMarkAsPaid: (billId: string) => void;
  isLoading?: boolean;
}

export default function UpcomingBills({ 
  upcomingBills, 
  overdueBills, 
  onMarkAsPaid,
  isLoading 
}: UpcomingBillsProps) {
  const allBills = [...overdueBills, ...upcomingBills].slice(0, 10); // Show max 10 bills

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted animate-pulse rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-background rounded"></div>
                  <div className="h-3 w-24 bg-background rounded"></div>
                </div>
                <div className="h-8 w-16 bg-background rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              No upcoming or overdue bills. Great job staying on top of your finances!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Bills</CardTitle>
        <Badge variant="outline">
          {allBills.length} bill{allBills.length > 1 ? 's' : ''}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allBills.map((bill) => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate);
            const isOverdueNow = isOverdue(bill.dueDate);
            const categoryInfo = BILL_CATEGORIES[bill.category];
            const statusInfo = BILL_STATUS[bill.status];

            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isOverdueNow
                    ? 'border-red-200 bg-red-50'
                    : daysUntilDue <= 3
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex-1 space-y-2">
                  {/* Bill name and category */}
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{bill.name}</h4>
                    <Badge variant="outline" className={categoryInfo.color}>
                      {categoryInfo.label}
                    </Badge>
                  </div>

                  {/* Due date and status */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Due: {formatDate(bill.dueDate, 'short')}
                    </span>
                    <span className={
                      isOverdueNow 
                        ? 'text-red-600 font-medium'
                        : daysUntilDue <= 3
                        ? 'text-yellow-600 font-medium'
                        : 'text-muted-foreground'
                    }>
                      {isOverdueNow 
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue === 0
                        ? 'Due today'
                        : daysUntilDue === 1
                        ? 'Due tomorrow'
                        : `Due in ${daysUntilDue} days`
                      }
                    </span>
                    <Badge 
                      variant="outline" 
                      className={statusInfo.color}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Amount and actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(bill.amount)}
                    </div>
                    {bill.status === 'partial' && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(
                          bill.amount - bill.paymentHistory.reduce((sum, p) => sum + p.amount, 0)
                        )} remaining
                      </div>
                    )}
                  </div>

                  {bill.status !== 'paid' && (
                    <Button
                      size="sm"
                      variant={isOverdueNow ? "destructive" : "default"}
                      onClick={() => onMarkAsPaid(bill.id)}
                      className="whitespace-nowrap"
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with additional info */}
        {(overdueBills.length > 0 || upcomingBills.length > 0) && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex gap-4">
                {overdueBills.length > 0 && (
                  <span className="text-red-600">
                    {overdueBills.length} overdue
                  </span>
                )}
                {upcomingBills.length > 0 && (
                  <span className="text-blue-600">
                    {upcomingBills.length} upcoming
                  </span>
                )}
              </div>
              <div>
                Total: {formatCurrency(
                  allBills.reduce((sum, bill) => sum + bill.amount, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}