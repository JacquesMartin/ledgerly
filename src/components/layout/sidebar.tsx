
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Landmark,
  User,
  CreditCard,
  BookCopy,
  Bell,
  DollarSign,
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
    href: '/ledger',
    icon: BookCopy,
    label: 'Ledger',
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
    href: '/notifications',
    icon: Bell,
    label: 'Notifications',
  },
  {
    href: '/payments',
    icon: DollarSign,
    label: 'Payments',
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
  const { setOpenMobile, isMobile } = useSidebar();

  const handleMenuItemClick = () => {
    // Close mobile sidebar when a menu item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleMenuItemClick}>
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
                <Link href={item.href} onClick={handleMenuItemClick}>
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
