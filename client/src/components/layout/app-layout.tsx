import { ReactNode, useState, useEffect } from "react";
import CollapsibleSidebar from "./collapsible-sidebar";
import Header from "./header";
import { MobileHeader } from "../mobile/mobile-header";
import { MobileSidebar } from "../mobile/mobile-sidebar";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    // Auto-collapse for bulk-capture page by default
    if (saved === null && window.location.pathname === '/bulk-capture') {
      return true;
    }
    return saved === 'true';
  });
  const [location] = useLocation();

  // Auto-collapse sidebar on bulk-capture page
  useEffect(() => {
    if (location === '/bulk-capture') {
      setIsSidebarCollapsed(true);
    }
  }, [location]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
      <div className={`desktop-sidebar hidden lg:block transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-72'}`}>
        <CollapsibleSidebar isCollapsed={isSidebarCollapsed} />
        {/* Sidebar Toggle Button */}
        <Button
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
          className={`fixed z-50 top-20 transition-all duration-300 bg-white shadow-md hover:shadow-lg ${
            isSidebarCollapsed ? 'left-12' : 'left-64'
          }`}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
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
        <CollapsibleSidebar />
      </MobileSidebar>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Page Content */}
        <div className={`main-content p-4 lg:p-6 pt-16 lg:pt-24 ${location === '/dashboard' || location === '/' ? 'dashboard-page' : ''} ${
          location === '/bulk-capture' ? 'max-w-full' : ''
        }`}>
          {children}
        </div>
      </main>
    </div>
  );
}
