import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  compact?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  children,
  className = '',
  headerAction,
  compact = false
}) => {
  return (
    <Card className={`${className} ${compact ? 'p-3 lg:p-6' : ''}`}>
      {title && (
        <CardHeader className={compact ? 'pb-3 px-0' : ''}>
          <div className="flex items-center justify-between">
            <CardTitle className={`${compact ? 'text-base lg:text-lg' : ''}`}>
              {title}
            </CardTitle>
            {headerAction && (
              <div className="flex items-center gap-2">
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? 'px-0 pb-0' : ''}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ResponsiveCard;