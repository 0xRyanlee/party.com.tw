'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navigation() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: '首頁' },
    { id: 'events', label: '活動' },
    { id: 'profile', label: '我的' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="text-lg font-semibold text-text-primary">
            Party
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-surface-secondary text-text-primary text-sm">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
