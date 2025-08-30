'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: '📊',
    description: 'Overview and summary'
  },
  {
    name: 'Bills',
    href: '/bills',
    icon: '💳',
    description: 'Manage your bills'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
    description: 'Spending insights'
  }
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavigationContent = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex flex-col">
              <span>{item.name}</span>
              <span className="text-xs opacity-70">{item.description}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <span className="text-lg">☰</span>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="px-2 py-4">
                <h2 className="mb-4 text-lg font-semibold">Bill Manager</h2>
                <NavigationContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <span className="hidden font-bold sm:inline-block">
              Bill Manager
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="ml-8 hidden items-center space-x-6 md:flex">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2024 Bill Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Made with Next.js & shadcn/ui</span>
          </div>
        </div>
      </footer>
    </div>
  );
}