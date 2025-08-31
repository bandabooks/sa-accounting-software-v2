import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  CheckSquare, 
  Menu 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/invoices", label: "Sales", icon: FileText },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
];

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`mobile-bottom-nav-item ${active ? "active" : ""}`}
            aria-label={item.label}
          >
            <Icon size={22} className={active ? "text-primary" : ""} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      <button
        onClick={onMenuClick}
        className="mobile-bottom-nav-item"
        aria-label="Menu"
      >
        <Menu size={22} />
        <span>Menu</span>
      </button>
    </nav>
  );
}