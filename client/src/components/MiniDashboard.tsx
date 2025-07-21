import { ReactNode } from "react";

interface MiniDashboardProps {
  children: ReactNode;
  title?: string;
}

export function MiniDashboard({ children, title }: MiniDashboardProps) {
  return (
    <div className="mb-6">
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
}