// /components/public-header-client.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, LogIn, Settings } from 'lucide-react';
import { useAuth } from './auth-provider';
import type { NavItem } from '@/lib/types';

interface AuthControlsProps {
  navigation: NavItem[];
}

export const AuthControls: React.FC<AuthControlsProps> = ({ navigation }) => {
  const { isAuth, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div className="h-8 w-20 animate-pulse bg-muted rounded-md"></div>;

  const navItems = [
    ...navigation,
    isAuth
      ? { label: 'Analytics', href: '/analytics', icon: Settings }
      : { label: 'Login', href: '/account-settings', icon: LogIn },
    isAuth
      ? { label: 'Account Settings', href: '/account-settings', icon: Settings }
      : null,
  ].filter((item): item is NavItem & { icon?: React.ElementType } => item !== null);

  return (
    <div className="flex items-center space-x-4">
      {/* Desktop */}
      <nav className="hidden lg:flex items-center space-x-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            {item.icon && <item.icon className="w-4 h-4" />}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile */}
      <div className="lg:hidden">
        <button onClick={() => setIsOpen(true)} className="p-2 border rounded-md">
          <Menu className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg p-8 flex flex-col space-y-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
            <button onClick={() => setIsOpen(false)} className="mt-4 self-end text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}
      </div>
    </div>
  );
};
