import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileHeader from "./mobile-header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 lg:ml-72">
        <Header />
        <div className="p-6 pt-24">
          {children}
        </div>
      </main>
    </div>
  );
}
