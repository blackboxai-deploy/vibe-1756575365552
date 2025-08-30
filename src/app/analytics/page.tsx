'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import SpendingChart from '@/components/Analytics/SpendingChart';
import CategoryBreakdown from '@/components/Analytics/CategoryBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBills } from '@/hooks/useBills';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/currencyUtils';

export default function AnalyticsPage() {
  const { bills, loading, error } = useBills();
  const analytics = useAnalytics(bills);

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to load analytics</h2>
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

  if (!loading && bills.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Analyze your spending patterns and trends
            </p>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-6">
              Add some bills and make payments to see your spending analytics
            </p>
            <a 
              href="/bills" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Add Your First Bill
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and trends
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Month Spending */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.currentMonthSpending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.spendingTrends.isIncreasing ? '↗' : '↘'} 
                {' '}{Math.abs(analytics.spendingTrends.percentageChange || 0).toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Average Monthly Spending */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
              <span className="text-2xl">📈</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.averageMonthlySpending)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on last 6 months
              </p>
            </CardContent>
          </Card>

          {/* Yearly Projection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Projection</CardTitle>
              <span className="text-2xl">🎯</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.yearlySummary.projectedYearly)}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated based on current trend
              </p>
            </CardContent>
          </Card>

          {/* Top Category */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <span className="text-2xl">🏆</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.topCategories[0]?.category ? 
                  (analytics.topCategories[0].category.charAt(0).toUpperCase() + 
                   analytics.topCategories[0].category.slice(1)) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.topCategories[0] ? 
                  formatCurrency(analytics.topCategories[0].paidAmount) : 
                  'No data'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Spending Trend Chart */}
          <SpendingChart
            data={analytics.chartData.monthlySpending}
            trend={analytics.spendingTrends}
            isLoading={loading}
          />

          {/* Category Breakdown */}
          <CategoryBreakdown
            categories={analytics.categoryBreakdown}
            isLoading={loading}
          />
        </div>

        {/* Payment Methods Analysis */}
        {analytics.paymentMethodAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {analytics.paymentMethodAnalysis.slice(0, 3).map((method) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {method.method.replace('-', ' ')}
                      </span>
                      <Badge variant="outline">
                        {method.count} payment{method.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(method.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(method.averageAmount)} per payment
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yearly Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Year to Date Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Spent:</span>
                <span className="font-semibold">
                  {formatCurrency(analytics.yearlySummary.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Monthly Average:</span>
                <span className="font-semibold">
                  {formatCurrency(analytics.yearlySummary.averageMonthly)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Months Tracked:</span>
                <span className="font-semibold">
                  {analytics.yearlySummary.monthsCompleted}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Paid:</span>
                  <span>{formatCurrency(analytics.spendingByStatus.paid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">Pending:</span>
                  <span>{formatCurrency(analytics.spendingByStatus.pending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Overdue:</span>
                  <span>{formatCurrency(analytics.spendingByStatus.overdue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}