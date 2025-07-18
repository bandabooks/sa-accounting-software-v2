import { Check, Plus, FileText } from "lucide-react";

const mockActivities = [
  {
    id: 1,
    type: "payment",
    message: "Invoice INV-2024-001 was marked as paid by Sekele Holding",
    timestamp: "2 hours ago",
    icon: Check,
    iconBg: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    id: 2,
    type: "customer",
    message: "New customer Think Tax Accountants was added to the system",
    timestamp: "5 hours ago",
    icon: Plus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    id: 3,
    type: "estimate",
    message: "Estimate EST-2024-015 was sent to TNT Liquor Distribution",
    timestamp: "1 day ago",
    icon: FileText,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600"
  }
];

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={activity.iconColor} size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
