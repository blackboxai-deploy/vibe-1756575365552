'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillCard from './BillCard';
import BillForm from './BillForm';
import { 
  Bill, 
  BillStatus, 
  BillCategory,
  BILL_CATEGORIES, 
  BILL_STATUS 
} from '@/lib/billsData';

interface BillsListProps {
  bills: Bill[];
  onAddBill: (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Bill>;
  onEditBill: (billId: string, updates: Partial<Bill>) => Promise<Bill>;
  onDeleteBill: (billId: string) => Promise<void>;
  onMarkAsPaid: (billId: string) => Promise<void>;
  onGenerateNext: (billId: string) => Promise<Bill>;
  isLoading?: boolean;
}

export default function BillsList({
  bills,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onMarkAsPaid,
  onGenerateNext,
  isLoading
}: BillsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'name'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort bills
  const filteredAndSortedBills = useMemo(() => {
    let filtered = bills;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bill => 
        bill.name.toLowerCase().includes(query) ||
        bill.category.toLowerCase().includes(query) ||
        (bill.notes && bill.notes.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bill => bill.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(bill => bill.status === selectedStatus);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [bills, searchQuery, selectedCategory, selectedStatus, sortBy, sortDirection]);

  // Group bills by status for tabs
  const billsByStatus = useMemo(() => {
    return {
      all: filteredAndSortedBills,
      pending: filteredAndSortedBills.filter(bill => bill.status === 'pending'),
      paid: filteredAndSortedBills.filter(bill => bill.status === 'paid'),
      overdue: filteredAndSortedBills.filter(bill => bill.status === 'overdue'),
      partial: filteredAndSortedBills.filter(bill => bill.status === 'partial')
    };
  }, [filteredAndSortedBills]);

  // Handle edit bill
  const handleEditBill = async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBill) {
      await onEditBill(editingBill.id, billData);
      setEditingBill(null);
    }
  };

  // Toggle sort direction
  const handleSort = (field: 'dueDate' | 'amount' | 'name') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('dueDate');
    setSortDirection('asc');
  };

  const BillsGrid = ({ bills: billsToShow }: { bills: Bill[] }) => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      );
    }

    if (billsToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No bills found</h3>
          <p className="text-muted-foreground mb-4">
            {bills.length === 0 
              ? "Get started by adding your first bill."
              : "Try adjusting your filters or search terms."
            }
          </p>
          {bills.length === 0 && (
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Bill
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {billsToShow.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onEdit={setEditingBill}
            onDelete={onDeleteBill}
            onMarkAsPaid={onMarkAsPaid}
            onGenerateNext={onGenerateNext}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bills Management</h1>
          <p className="text-muted-foreground">
            Manage your monthly bills and track payments
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Add New Bill
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search bills by name, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={(value: BillCategory | 'all') => setSelectedCategory(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(Object.entries(BILL_CATEGORIES) as [BillCategory, { label: string; color: string }][]).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={(value: BillStatus | 'all') => setSelectedStatus(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.entries(BILL_STATUS) as [BillStatus, { label: string; color: string }][]).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort and Clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              {[
                { key: 'dueDate', label: 'Due Date' },
                { key: 'amount', label: 'Amount' },
                { key: 'name', label: 'Name' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort(key as 'dueDate' | 'amount' | 'name')}
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {filteredAndSortedBills.length !== bills.length && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedBills.length} of {bills.length} bills
        </div>
      )}

      {/* Bills Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Bills
            <Badge variant="secondary" className="ml-2">
              {billsByStatus.all.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {billsByStatus.pending.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge variant="destructive" className="ml-2">
              {billsByStatus.overdue.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid
            <Badge variant="secondary" className="ml-2">
              {billsByStatus.paid.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <BillsGrid bills={billsByStatus.all} />
        </TabsContent>
        
        <TabsContent value="pending">
          <BillsGrid bills={billsByStatus.pending} />
        </TabsContent>
        
        <TabsContent value="overdue">
          <BillsGrid bills={billsByStatus.overdue} />
        </TabsContent>
        
        <TabsContent value="paid">
          <BillsGrid bills={billsByStatus.paid} />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Bill Forms */}
      <BillForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={onAddBill}
        isLoading={isLoading}
      />

      <BillForm
        bill={editingBill}
        isOpen={!!editingBill}
        onClose={() => setEditingBill(null)}
        onSubmit={handleEditBill}
        isLoading={isLoading}
      />
    </div>
  );
}