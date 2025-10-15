'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  User,
  LogOut,
  Settings,
  BarChart3,
  Target,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { GlobalSearch } from '@/components/search/GlobalSearch';

interface NavigationProps {
  showNav?: boolean;
}

export function Navigation({ showNav = true }: NavigationProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!showNav) return null;

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      roles: ['user', 'manager', 'admin'],
    },
    {
      href: '/pov',
      label: 'Projects',
      icon: Target,
      roles: ['user', 'manager', 'admin'],
    },
    {
      href: '/trr',
      label: 'TRRs',
      icon: CheckCircle2,
      roles: ['user', 'manager', 'admin'],
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredLinks = navLinks.filter((link) =>
    link.roles.includes(user?.role || 'user')
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Cortex DC
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-orange-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <GlobalSearch />

            {/* Desktop User Menu */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          Your Profile
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Settings
                        </Link>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                {showMobileMenu ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive
                      ? 'bg-orange-50 border-l-4 border-orange-500 text-orange-700'
                      : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                Your Profile
              </Link>

              <Link
                href="/settings"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setShowMobileMenu(false)}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400" />
                Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
