import { Shield, Award, CheckCircle, Building, Users, TrendingUp } from "lucide-react";

interface ProfessionalBadgeProps {
  icon: "shield" | "award" | "check" | "building" | "users" | "trending";
  title: string;
  description: string;
  className?: string;
}

const iconMap = {
  shield: Shield,
  award: Award,
  check: CheckCircle,
  building: Building,
  users: Users,
  trending: TrendingUp,
};

export function ProfessionalBadge({ icon, title, description, className = "" }: ProfessionalBadgeProps) {
  const IconComponent = iconMap[icon];
  
  return (
    <div className={`flex items-start space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 ${className}`}>
      <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-lg">
        <IconComponent className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <p className="text-blue-100/80 text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}