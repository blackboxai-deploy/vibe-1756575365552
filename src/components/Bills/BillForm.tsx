'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Bill, 
  BillCategory, 
  BillFrequency,
  BILL_CATEGORIES,
  BILL_FREQUENCIES,
  createDefaultBill 
} from '@/lib/billsData';
import { toInputDate } from '@/lib/dateUtils';
import { toValidAmount } from '@/lib/currencyUtils';

interface BillFormProps {
  bill?: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Bill | void>;
  isLoading?: boolean;
}

export default function BillForm({ 
  bill, 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: BillFormProps) {
  const [formData, setFormData] = useState(createDefaultBill());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when bill prop changes
  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount,
        dueDate: toInputDate(bill.dueDate),
        category: bill.category,
        frequency: bill.frequency,
        status: bill.status,
        paymentHistory: bill.paymentHistory,
        notes: bill.notes || '',
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt
      });
    } else {
      setFormData(createDefaultBill());
    }
    setErrors({});
  }, [bill, isOpen]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle amount change with validation
  const handleAmountChange = (value: string) => {
    const numericValue = toValidAmount(value);
    handleInputChange('amount', numericValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {bill ? 'Edit Bill' : 'Add New Bill'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Bill Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Electric Bill, Rent, Netflix"
              disabled={isSubmitting || isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting || isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value: BillCategory) => handleInputChange('category', value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(BILL_CATEGORIES) as [BillCategory, { label: string; color: string }][]).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select 
              value={formData.frequency} 
              onValueChange={(value: BillFrequency) => handleInputChange('frequency', value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(BILL_FREQUENCIES) as [BillFrequency, { label: string; months: number }][]).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-sm text-red-600">{errors.frequency}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this bill..."
              rows={3}
              disabled={isSubmitting || isLoading}
            />
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                {bill ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              bill ? 'Update Bill' : 'Add Bill'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}