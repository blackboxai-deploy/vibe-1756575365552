'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Bill, 
  BILL_CATEGORIES, 
  BILL_STATUS, 
  BILL_FREQUENCIES 
} from '@/lib/billsData';
import { formatCurrency } from '@/lib/currencyUtils';
import { formatDate, getDaysUntilDue, isOverdue } from '@/lib/dateUtils';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onMarkAsPaid: (billId: string) => void;
  onGenerateNext: (billId: string) => void;
}

export default function BillCard({ 
  bill, 
  onEdit, 
  onDelete, 
  onMarkAsPaid, 
  onGenerateNext 
}: BillCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const daysUntilDue = getDaysUntilDue(bill.dueDate);
  const isOverdueNow = isOverdue(bill.dueDate);
  const categoryInfo = BILL_CATEGORIES[bill.category];
  const statusInfo = BILL_STATUS[bill.status];
  const frequencyInfo = BILL_FREQUENCIES[bill.frequency];

  // Calculate remaining amount for partial payments
  const totalPaid = bill.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = bill.amount - totalPaid;

  // Card border color based on status and due date
  const getCardBorderClass = () => {
    if (bill.status === 'paid') return 'border-green-200';
    if (isOverdueNow) return 'border-red-300';
    if (daysUntilDue <= 3 && daysUntilDue >= 0) return 'border-yellow-300';
    return 'border-border';
  };

  // Card background color based on status
  const getCardBgClass = () => {
    if (bill.status === 'paid') return 'bg-green-50';
    if (isOverdueNow) return 'bg-red-50';
    if (daysUntilDue <= 3 && daysUntilDue >= 0) return 'bg-yellow-50';
    return 'bg-card';
  };

  return (
    <React.Fragment>
      <Card className={`${getCardBorderClass()} ${getCardBgClass()} transition-colors hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{bill.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={categoryInfo.color}>
                  {categoryInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {frequencyInfo.label}
                </Badge>
              </div>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <span className="text-lg">⋮</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(bill)}>
                  ✏️ Edit
                </DropdownMenuItem>
                {bill.status !== 'paid' && (
                  <DropdownMenuItem onClick={() => onMarkAsPaid(bill.id)}>
                    ✅ Mark as Paid
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onGenerateNext(bill.id)}>
                  🔄 Generate Next
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  🗑️ Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Amount and Status */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(bill.amount)}
                </div>
                {bill.status === 'partial' && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(remainingAmount)} remaining
                  </div>
                )}
              </div>
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>

            {/* Due Date Information */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">
                  {formatDate(bill.dueDate, 'medium')}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={
                  isOverdueNow 
                    ? 'text-red-600 font-medium'
                    : daysUntilDue <= 3 && daysUntilDue >= 0
                    ? 'text-yellow-600 font-medium'
                    : bill.status === 'paid'
                    ? 'text-green-600 font-medium'
                    : 'text-muted-foreground'
                }>
                  {bill.status === 'paid' 
                    ? 'Paid'
                    : isOverdueNow 
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : daysUntilDue === 0
                    ? 'Due today'
                    : daysUntilDue === 1
                    ? 'Due tomorrow'
                    : `Due in ${daysUntilDue} days`
                  }
                </span>
              </div>
            </div>

            {/* Payment History */}
            {bill.paymentHistory.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Recent Payments:</div>
                <div className="space-y-1">
                  {bill.paymentHistory.slice(-2).map((payment) => (
                    <div key={payment.id} className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(payment.paidDate, 'short')}</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                  {bill.paymentHistory.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{bill.paymentHistory.length - 2} more payments
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {bill.notes && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Notes:</div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded text-xs">
                  {bill.notes}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {bill.status !== 'paid' && (
              <div className="pt-2">
                <Button 
                  onClick={() => onMarkAsPaid(bill.id)}
                  className="w-full"
                  variant={isOverdueNow ? "destructive" : "default"}
                  size="sm"
                >
                  {bill.status === 'partial' ? 'Pay Remaining' : 'Mark as Paid'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bill.name}"? This action cannot be undone and will remove all payment history associated with this bill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(bill.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
}