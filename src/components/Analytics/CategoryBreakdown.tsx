'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CategorySummary, BILL_CATEGORIES } from '@/lib/billsData';
import { formatCurrency, calculatePercentage } from '@/lib/currencyUtils';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
  isLoading?: boolean;
}

export default function CategoryBreakdown({ categories, isLoading }: CategoryBreakdownProps) {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.paidAmount, 0);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-2 bg-muted animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0 || totalSpent === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-muted-foreground">No spending data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort categories by spending amount (descending)
  const sortedCategories = [...categories]
    .filter(cat => cat.paidAmount > 0)
    .sort((a, b) => b.paidAmount - a.paidAmount)
    .slice(0, 8); // Show top 8 categories

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Spending by Category</span>
          <Badge variant="outline">
            {formatCurrency(totalSpent)} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Category List */}
          <div className="space-y-3">
            {sortedCategories.map((category) => {
              const categoryInfo = BILL_CATEGORIES[category.category];
              const percentage = calculatePercentage(category.paidAmount, totalSpent);

              return (
                <div key={category.category} className="space-y-2">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {category.billCount} bill{category.billCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(category.paidAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage}% of total
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-2" />
                    
                    {/* Additional Info */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        Avg: {formatCurrency(category.billCount > 0 ? category.paidAmount / category.billCount : 0)} per bill
                      </div>
                      {category.pendingAmount > 0 && (
                        <div className="text-yellow-600">
                          {formatCurrency(category.pendingAmount)} pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="pt-4 border-t space-y-3">
            {/* Top Category */}
            {sortedCategories.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Highest Spending:</span>
                <span className="font-medium">
                  {BILL_CATEGORIES[sortedCategories[0].category].label}
                </span>
              </div>
            )}

            {/* Category Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Categories:</span>
              <span className="font-medium">{sortedCategories.length}</span>
            </div>

            {/* Average per Category */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average per Category:</span>
              <span className="font-medium">
                {formatCurrency(sortedCategories.length > 0 ? totalSpent / sortedCategories.length : 0)}
              </span>
            </div>
          </div>

          {/* Pie Chart Representation (Simple) */}
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Distribution</div>
            <div className="flex h-4 rounded-full overflow-hidden">
              {sortedCategories.map((category, index) => {
                const percentage = calculatePercentage(category.paidAmount, totalSpent);
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                  'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-gray-500'
                ];
                
                return (
                  <div
                    key={category.category}
                    className={`${colors[index % colors.length]} transition-all duration-300 hover:opacity-80`}
                    style={{ width: `${percentage}%` }}
                    title={`${BILL_CATEGORIES[category.category].label}: ${percentage}%`}
                  />
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {sortedCategories.slice(0, 4).map((category, index) => {
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'
                ];
                const percentage = calculatePercentage(category.paidAmount, totalSpent);
                
                return (
                  <div key={category.category} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${colors[index]} flex-shrink-0`}></div>
                    <span className="truncate">
                      {BILL_CATEGORIES[category.category].label} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {sortedCategories.length > 0 && (
            <div className="pt-4 border-t bg-muted/50 p-3 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">💡 Insight: </span>
                Your highest spending category is{' '}
                <span className="font-medium">
                  {BILL_CATEGORIES[sortedCategories[0].category].label}
                </span>
                {' '}at {formatCurrency(sortedCategories[0].paidAmount)} (
                {calculatePercentage(sortedCategories[0].paidAmount, totalSpent)}% of total spending).
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}