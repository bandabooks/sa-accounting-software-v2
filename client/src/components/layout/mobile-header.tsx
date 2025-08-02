import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileMenu from "@/components/ui/mobile-menu";
import GlobalSearch from "@/components/global-search";
import { useAuth } from "@/hooks/useAuth";
import CompanySwitcher from "./company-switcher";

export default function MobileHeader() {
  const { user } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-3">
          <MobileMenu />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Taxnify</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mobile Global Search - Show on mobile only */}
          <div className="sm:hidden">
            <GlobalSearch />
          </div>
          
          {/* Mobile Company Switcher */}
          <div className="hidden sm:block">
            <CompanySwitcher />
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <User className="h-4 w-4" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}