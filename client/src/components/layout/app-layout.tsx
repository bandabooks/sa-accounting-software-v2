import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { MobileHeader } from "../mobile/mobile-header";
import { MobileSidebar } from "../mobile/mobile-sidebar";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    if (location.includes('/dashboard')) return 'Dashboard';
    if (location.includes('/banking')) return 'Banking';
    if (location.includes('/invoices')) return 'Invoices';
    if (location.includes('/customers')) return 'Customers';
    if (location.includes('/estimates')) return 'Estimates';
    if (location.includes('/expenses')) return 'Expenses';
    if (location.includes('/suppliers')) return 'Suppliers';
    if (location.includes('/settings')) return 'Settings';
    return 'Taxnify';
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title={getPageTitle()}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        showSearch={false}
        showNotifications={true}
        showProfile={true}
        notificationCount={3}
        onSearchClick={() => {/* TODO: Implement search */}}
        onNotificationClick={() => {/* TODO: Implement notifications */}}
        onProfileClick={() => {/* TODO: Implement profile menu */}}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleMobileSidebarClose}
      >
        <Sidebar />
      </MobileSidebar>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Page Content */}
        <div className="main-content p-4 lg:p-6 pt-16 lg:pt-24">
          {children}
        </div>
      </main>
    </div>
  );
}
