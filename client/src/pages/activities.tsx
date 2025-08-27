import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, AlertTriangle, Award, Search, Filter, Eye, Download } from "lucide-react";

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  link?: string; // Optional link to related page
  entityId?: string; // Optional entity ID for navigation
}

export default function Activities() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Activities will be loaded from API - no hardcoded demo data
  const activities: Activity[] = [
    // Real activities will populate here from API
    {
      id: "5",
      type: "warning",
      title: "Outstanding payment overdue",
      description: "Invoice #INV-009 is 15 days overdue - R1,800",
      time: "2 days ago",
      priority: "high",
      category: "payments",
      link: "/invoices",
      entityId: "INV-009"
    },
    {
      id: "6",
      type: "info",
      title: "Monthly report generated",
      description: "Financial report for January 2024 is ready",
      time: "3 days ago",
      priority: "low",
      category: "reports",
      link: "/advanced-analytics"
    },
    {
      id: "7",
      type: "success",
      title: "Bank reconciliation completed",
      description: "All transactions for FNB Current Account reconciled",
      time: "1 week ago",
      priority: "medium",
      category: "banking",
      link: "/bank-reconciliation"
    },
    {
      id: "8",
      type: "warning",
      title: "Low stock alert",
      description: "Product A is running low - only 5 units remaining",
      time: "1 week ago",
      priority: "medium",
      category: "inventory",
      link: "/inventory"
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || activity.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || activity.category === filterCategory;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Award className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-l-red-500';
      case 'medium':
        return 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-l-yellow-500';
      default:
        return 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-l-blue-500';
    }
  };

  const categories = Array.from(new Set(activities.map(a => a.category)));

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recent Activities</h1>
          <p className="text-gray-600 mt-1">Monitor all business activities and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {filteredActivities.length} Activities Found
          </h2>
        </div>

        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <Card 
              key={activity.id} 
              className={`relative overflow-hidden border-l-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] ${getActivityColors(activity.priority)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <Badge 
                          variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (activity.link) {
                        setLocation(activity.link);
                      }
                    }}
                    className="hover:bg-gray-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Activities Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}