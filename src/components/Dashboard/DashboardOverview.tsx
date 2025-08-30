'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BillSummary } from '@/lib/billsData';
import { formatCurrency, calculatePercentage } from '@/lib/currencyUtils';

interface DashboardOverviewProps {
  summary: BillSummary;
  isLoading?: boolean;
}

export default function DashboardOverview({ summary, isLoading }: DashboardOverviewProps) {
  const paidPercentage = summary.totalAmount > 0 
    ? calculatePercentage(summary.paidAmount, summary.totalAmount)
    : 0;

  const pendingPercentage = summary.totalAmount > 0 
    ? calculatePercentage(summary.pendingAmount, summary.totalAmount)
    : 0;

  const overduePercentage = summary.totalAmount > 0 
    ? calculatePercentage(summary.overdueAmount, summary.totalAmount)
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded mb-1"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Bills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <span className="text-2xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBills}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalAmount)} total value
            </p>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidPercentage}% of total bills
            </p>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPercentage}% of total bills
            </p>
          </CardContent>
        </Card>

        {/* Overdue Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <span className="text-2xl">🚨</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overdueCount} overdue bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Payment Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Paid Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Paid</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(summary.paidAmount)}
                </span>
              </div>
              <Progress 
                value={paidPercentage} 
                className="h-2"
              />
            </div>

            {/* Pending Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-600">Pending</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(summary.pendingAmount)}
                </span>
              </div>
              <Progress 
                value={pendingPercentage} 
                className="h-2"
              />
            </div>

            {/* Overdue Progress */}
            {summary.overdueAmount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Overdue</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(summary.overdueAmount)}
                  </span>
                </div>
                <Progress 
                  value={overduePercentage} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Upcoming Bills</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {summary.upcomingCount} due soon
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overdue Bills</span>
              {summary.overdueCount > 0 ? (
                <Badge variant="destructive">
                  {summary.overdueCount} overdue
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  All up to date
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Bill</span>
              <span className="text-sm font-medium">
                {summary.totalBills > 0 
                  ? formatCurrency(summary.totalAmount / summary.totalBills)
                  : formatCurrency(0)
                }
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Rate</span>
              <span className="text-sm font-medium text-green-600">
                {paidPercentage}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(summary.overdueCount > 0 || summary.upcomingCount > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800">Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.overdueCount > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <span>🚨</span>
                  <span className="text-sm">
                    You have {summary.overdueCount} overdue bill{summary.overdueCount > 1 ? 's' : ''} 
                    totaling {formatCurrency(summary.overdueAmount)}
                  </span>
                </div>
              )}
              {summary.upcomingCount > 0 && (
                <div className="flex items-center gap-2 text-blue-700">
                  <span>📅</span>
                  <span className="text-sm">
                    {summary.upcomingCount} bill{summary.upcomingCount > 1 ? 's' : ''} 
                    due in the next 7 days
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}