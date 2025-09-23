
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Landmark,
  User,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/apply',
    icon: Send,
    label: 'Apply for Loan',
  },
  {
    href: '/creditors',
    icon: Users,
    label: 'Creditors',
  },
  {
    href: '/loan-requests',
    icon: FileText,
    label: 'Loan Requests',
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profile',
  },
  {
    href: '/billing',
    icon: CreditCard,
    label: 'Billing',
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Landmark className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden">
            Ledgerly
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                  className: 'bg-primary text-primary-foreground',
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add user profile here in footer if preferred */}
      </SidebarFooter>
    </Sidebar>
  );
}
