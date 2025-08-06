"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ChevronDownIcon } from '@/icons';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Thermometer,
  Cpu,
  TrendingUp,
  Shield,
  Database,
  Calendar,
  Download,
  History,
  Plus,
  CheckCircle,
  Bell,
  FileCheck,
  User,
  UserPlus,
  HardDrive
} from 'lucide-react';

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: MenuItem[];
  adminOnly?: boolean; // New field for admin-only items
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Monitoring']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const menuItems: MenuItem[] = [
    // 📊 MONITORING (Available to ALL users)
    {
      title: 'Monitoring',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { 
          title: 'Temperature Monitoring', 
          href: '/', 
          icon: <Thermometer className="h-4 w-4" /> 
        },
        {
          title: 'Alerts',
          icon: <AlertTriangle className="h-4 w-4" />,
          children: [
            { title: 'Active Alerts', href: '/alerts', icon: <Bell className="h-4 w-4" /> },
            { title: 'Alert History', href: '/alerts/history', icon: <History className="h-4 w-4" /> }
          ]
        },
        {
          title: 'Temperature Policy',
          icon: <FileCheck className="h-4 w-4" />,
          children: [
            { title: 'Current Policies', href: '/policies', icon: <FileCheck className="h-4 w-4" /> },
            { title: 'Policy History', href: '/policies/history', icon: <History className="h-4 w-4" /> }
          ]
        },
        {
          title: 'Reports',
          icon: <FileText className="h-4 w-4" />,
          children: [
            { title: 'Daily Reports', href: '/reports/daily', icon: <Calendar className="h-4 w-4" /> },
            { title: 'Compliance Reports', href: '/reports/compliance', icon: <FileCheck className="h-4 w-4" /> },
            { title: 'Report Logs', href: '/reports/logs', icon: <History className="h-4 w-4" /> }
          ]
        },
        {
          title: 'Analytics',
          icon: <TrendingUp className="h-4 w-4" />,
          children: [
            { title: 'Trends', href: '/analytics/trends', icon: <TrendingUp className="h-4 w-4" /> },
            { title: 'Metrics', href: '/analytics/metrics', icon: <BarChart3 className="h-4 w-4" /> }
          ]
        }
      ]
    },

    // 🏥 PHARMACY MANAGEMENT (Admin Only)
    {
      title: 'Pharmacy Management',
      icon: <Building2 className="h-5 w-5" />,
      adminOnly: true,
      children: [
        { title: 'All Pharmacies', href: '/admin/pharmacies', icon: <Building2 className="h-4 w-4" /> },
        { title: 'Add Pharmacy', href: '/admin/pharmacies/add', icon: <Plus className="h-4 w-4" /> },
        { title: 'Pharmacy Settings', href: '/admin/pharmacies/settings', icon: <Settings className="h-4 w-4" /> },
        { title: 'Location Management', href: '/admin/pharmacies/locations', icon: <Building2 className="h-4 w-4" /> }
      ]
    },

    // 🔌 HUB MANAGEMENT (Admin Only)
    {
      title: 'Hub Management',
      icon: <Cpu className="h-5 w-5" />,
      adminOnly: true,
      children: [
        { title: 'All Hubs & Gateways', href: '/admin/hubs', icon: <Cpu className="h-4 w-4" /> },
        { title: 'Add Hub', href: '/admin/hubs/add', icon: <Plus className="h-4 w-4" /> },
        { title: 'Hub Status', href: '/admin/hubs/status', icon: <CheckCircle className="h-4 w-4" /> },
        { title: 'Network Configuration', href: '/admin/hubs/network', icon: <Settings className="h-4 w-4" /> }
      ]
    },

    // 🌡️ SENSOR MANAGEMENT (Admin Only)
    {
      title: 'Sensor Management',
      icon: <Thermometer className="h-5 w-5" />,
      adminOnly: true,
      children: [
        { title: 'All Sensors', href: '/sensors', icon: <Thermometer className="h-4 w-4" /> },
        { title: 'Add Sensor', href: '/sensors/add', icon: <Plus className="h-4 w-4" /> },
        { title: 'Sensor Status', href: '/sensors/status', icon: <CheckCircle className="h-4 w-4" /> },
        { title: 'Sensor Assignment', href: '/admin/sensors/manage', icon: <Settings className="h-4 w-4" /> },
        { title: 'Calibration', href: '/admin/sensors/calibration', icon: <Settings className="h-4 w-4" /> }
      ]
    },

    // 👥 USER MANAGEMENT (Admin Only)
    {
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      adminOnly: true,
      children: [
        { title: 'Manage Users', href: '/admin/users/manage', icon: <Users className="h-4 w-4" /> },
        { title: 'Quick Fix User', href: '/admin/users/quick-fix', icon: <CheckCircle className="h-4 w-4" /> },
        { title: 'All Users', href: '/admin/analytics/users', icon: <Users className="h-4 w-4" /> },
        { title: 'Add User', href: '/admin/users/add', icon: <UserPlus className="h-4 w-4" /> },
        { title: 'User Roles & Permissions', href: '/admin/users/roles', icon: <Shield className="h-4 w-4" /> },
        { title: 'User Approvals', href: '/admin/user-approvals', icon: <CheckCircle className="h-4 w-4" /> },
        { title: 'Fix All Users', href: '/admin/fix-all-users', icon: <Settings className="h-4 w-4" /> },
        { title: 'System Settings', href: '/admin/settings/system', icon: <Settings className="h-4 w-4" /> }
      ]
    }
  ];

  // Filter menu items based on user role
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.role === 'ADMIN';

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // If item is admin-only and user is not admin, hide it
      if (item.adminOnly && !isAdmin) {
        return false;
      }

      // If item has children, filter them recursively
      if (item.children) {
        const originalChildren = [...item.children];
        item.children = filterMenuItems(item.children);
        
        // If all children are filtered out and this is not an admin-only parent, 
        // still show the parent but with no children
        if (item.children.length === 0) {
          // If the parent itself is admin-only, hide it completely
          if (item.adminOnly) {
            return false;
          }
          // If parent is not admin-only but all children are filtered out,
          // we might want to hide it too (optional behavior)
          // For now, let's hide parents with no visible children
          return false;
        }
      }

      return true;
    });
  };

  const filteredMenuItems = filterMenuItems([...menuItems]);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.title);
    const active = item.href ? isActive(item.href) : false;

    return (
      <li key={item.title}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
              active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </button>
        ) : (
          <Link
            href={item.href!}
            className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
              active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full dark:bg-red-900/20 dark:text-red-400">
                {item.badge}
              </span>
            )}
          </Link>
        )}
        
        {hasChildren && expanded && (
          <ul className={`mt-2 space-y-1 ${level === 0 ? 'ml-4 border-l border-gray-200 dark:border-gray-700' : 'ml-2'}`}>
            {item.children!.map((child) => (
              <div key={child.title} className={level === 0 ? 'pl-4' : 'pl-2'}>
                {renderMenuItem(child, level + 1)}
              </div>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center space-x-2">
          <Thermometer className="h-8 w-8 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-white">TempRx360</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Admin Dashboard' : 'Pharmacy User'}
            </span>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAdmin 
              ? 'bg-blue-100 dark:bg-blue-900/20' 
              : 'bg-green-100 dark:bg-green-900/20'
          }`}>
            {isAdmin ? (
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {isAdmin ? 'Admin Panel' : 'Pharmacy User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}