import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSmallBusinessOpen, setIsSmallBusinessOpen] = useState(false);
  const [isAccountantsOpen, setIsAccountantsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsSmallBusinessOpen(false);
    setIsAccountantsOpen(false);
    setIsFeaturesOpen(false);
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={closeMobileMenu}>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Taxnify</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Features Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-2 ${
                isActive('/features') ? 'text-blue-600 font-medium' : ''
              }`}>
                <span>Features</span>
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pt-1">
                <div className="absolute -top-1 left-0 right-0 h-2 bg-transparent"></div>
                <div className="py-2">
                  <Link href="/features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    All Features
                  </Link>
                  <Link href="/features/accounting" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Accounting & Finance
                  </Link>
                  <Link href="/features/compliance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Compliance & VAT
                  </Link>
                </div>
              </div>
            </div>

            {/* Small Business Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors py-2 ${
                isActive('/small-business') ? 'text-blue-600 font-medium' : ''
              }`}>
                <span>Small Business</span>
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pt-1">
                <div className="absolute -top-1 left-0 right-0 h-2 bg-transparent"></div>
                <div className="py-2">
                  <Link href="/small-business" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    All Industries
                  </Link>
                  <Link href="/small-business/retail" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Retail & E-commerce
                  </Link>
                  <Link href="/small-business/restaurants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Restaurants & Hospitality
                  </Link>
                  <Link href="/small-business/consultants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Professional Services
                  </Link>
                  <Link href="/small-business/ngos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    NGOs & Non-Profits
                  </Link>
                </div>
              </div>
            </div>

            {/* Accountants Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors ${
                isActive('/accountants') ? 'text-blue-600 font-medium' : ''
              }`}>
                <span>Accountants</span>
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/accountants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    All Professionals
                  </Link>
                  <Link href="/accountants/tax-practitioners" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Tax Practitioners
                  </Link>
                  <Link href="/accountants/auditors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                    Auditors
                  </Link>
                </div>
              </div>
            </div>

            {/* Direct Links */}
            <Link href="/resources" className={`text-gray-700 hover:text-blue-600 transition-colors ${
              isActive('/resources') ? 'text-blue-600 font-medium' : ''
            }`}>
              Resources
            </Link>
            <Link href="/pricing" className={`text-gray-700 hover:text-blue-600 transition-colors ${
              isActive('/pricing') ? 'text-blue-600 font-medium' : ''
            }`}>
              Pricing
            </Link>
            <Link href="/contact" className={`text-gray-700 hover:text-blue-600 transition-colors ${
              isActive('/contact') ? 'text-blue-600 font-medium' : ''
            }`}>
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                Sign In
              </Button>
            </Link>
            <Link href="/trial-signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              {/* Features Mobile Dropdown */}
              <div>
                <button
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  <span>Features</span>
                  <ChevronDown size={16} className={`transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFeaturesOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link href="/features" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      All Features
                    </Link>
                    <Link href="/features/accounting" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Accounting & Finance
                    </Link>
                    <Link href="/features/compliance" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Compliance & VAT
                    </Link>
                  </div>
                )}
              </div>

              {/* Small Business Mobile Dropdown */}
              <div>
                <button
                  onClick={() => setIsSmallBusinessOpen(!isSmallBusinessOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  <span>Small Business</span>
                  <ChevronDown size={16} className={`transition-transform ${isSmallBusinessOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSmallBusinessOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link href="/small-business" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      All Industries
                    </Link>
                    <Link href="/small-business/retail" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Retail & E-commerce
                    </Link>
                    <Link href="/small-business/restaurants" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Restaurants & Hospitality
                    </Link>
                    <Link href="/small-business/consultants" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Professional Services
                    </Link>
                    <Link href="/small-business/ngos" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      NGOs & Non-Profits
                    </Link>
                  </div>
                )}
              </div>

              {/* Accountants Mobile Dropdown */}
              <div>
                <button
                  onClick={() => setIsAccountantsOpen(!isAccountantsOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  <span>Accountants</span>
                  <ChevronDown size={16} className={`transition-transform ${isAccountantsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAccountantsOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link href="/accountants" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      All Professionals
                    </Link>
                    <Link href="/accountants/tax-practitioners" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Tax Practitioners
                    </Link>
                    <Link href="/accountants/auditors" onClick={closeMobileMenu} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Auditors
                    </Link>
                  </div>
                )}
              </div>

              {/* Direct Links */}
              <Link href="/resources" onClick={closeMobileMenu} className="block text-gray-700 hover:text-blue-600 py-2">
                Resources
              </Link>
              <Link href="/pricing" onClick={closeMobileMenu} className="block text-gray-700 hover:text-blue-600 py-2">
                Pricing
              </Link>
              <Link href="/contact" onClick={closeMobileMenu} className="block text-gray-700 hover:text-blue-600 py-2">
                Contact
              </Link>

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-2">
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/trial-signup" onClick={closeMobileMenu}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}