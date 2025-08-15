import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  notificationCount?: number;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  notificationCount = 0,
  onSearchClick,
  onNotificationClick,
  onProfileClick
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden relative z-30">
      {/* Left section - Menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="mobile-tap-area p-2"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </Button>

      {/* Center section - Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      {/* Right section - Action buttons */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="mobile-tap-area p-2"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
        )}

        {showNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="mobile-tap-area p-2 relative"
            aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount})` : ''}`}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        )}

        {showProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="mobile-tap-area p-2"
            aria-label="Profile menu"
          >
            <User className="h-5 w-5 text-gray-600" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;