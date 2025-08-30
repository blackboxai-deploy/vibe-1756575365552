'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currencyUtils';

interface MonthlyData {
  month: string;
  amount: number;
  bills: number;
}

interface SpendingTrend {
  change: number;
  percentageChange: number;
  isIncreasing: boolean;
}

interface SpendingChartProps {
  data: MonthlyData[];
  trend: SpendingTrend;
  isLoading?: boolean;
}

export default function SpendingChart({ data, trend, isLoading }: SpendingChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-muted animate-pulse rounded"></div>
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 w-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trend</CardTitle>
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

  // Calculate max value for scaling
  const maxAmount = Math.max(...data.map(d => d.amount));
  const maxHeight = 200; // pixels

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Monthly Spending Trend</CardTitle>
        <Badge 
          variant={trend.isIncreasing ? "destructive" : "default"}
          className={trend.isIncreasing ? "" : "bg-green-100 text-green-800 border-green-200"}
        >
          {trend.isIncreasing ? "↗" : "↘"} {Math.abs(trend.percentageChange).toFixed(1)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div className="relative">
            <div className="flex items-end justify-between gap-2 h-64 px-2">
              {data.map((item, index) => {
                const height = maxAmount > 0 ? (item.amount / maxAmount) * maxHeight : 0;
                const isCurrentMonth = index === 0; // Assuming first item is current month
                
                return (
                  <div key={item.month} className="flex flex-col items-center flex-1 group">
                    {/* Bar */}
                    <div className="relative w-full flex items-end justify-center mb-2">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                          isCurrentMonth 
                            ? 'bg-primary' 
                            : trend.isIncreasing 
                            ? 'bg-red-200' 
                            : 'bg-green-200'
                        }`}
                        style={{ height: `${height}px` }}
                      >
                        {/* Value tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className="text-xs text-center text-muted-foreground font-medium">
                      {item.month.slice(0, 3)}
                    </div>
                    
                    {/* Bills count */}
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {item.bills} bill{item.bills !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Current Month</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${trend.isIncreasing ? 'bg-red-200' : 'bg-green-200'}`}></div>
              <span>Previous Months</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(data[0]?.amount || 0)}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0) / data.length)}
              </div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Trend Analysis: </span>
              {trend.isIncreasing ? (
                <span className="text-red-600">
                  Spending increased by {formatCurrency(Math.abs(trend.change))} ({Math.abs(trend.percentageChange).toFixed(1)}%) from last month.
                </span>
              ) : trend.change === 0 ? (
                <span className="text-muted-foreground">
                  Spending remained the same as last month.
                </span>
              ) : (
                <span className="text-green-600">
                  Spending decreased by {formatCurrency(Math.abs(trend.change))} ({Math.abs(trend.percentageChange).toFixed(1)}%) from last month.
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}