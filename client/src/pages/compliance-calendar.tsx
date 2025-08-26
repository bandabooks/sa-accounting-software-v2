import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

// Event interface for type safety
interface ComplianceEvent {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'scheduled' | 'pending' | 'overdue';
  type: 'SARS' | 'CIPC' | 'Labour';
  client?: string; // Optional client field
}

// Real compliance events will be loaded from API - no mock data
const events: ComplianceEvent[] = [];

export default function ComplianceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDate = (day: number): ComplianceEvent[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event: ComplianceEvent) => event.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const eventsForDay = getEventsForDate(day);
      days.push(
        <div key={day} className="p-2 h-24 border border-gray-200 hover:bg-gray-50">
          <div className="font-medium text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {eventsForDay.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                title={`${event.title}${event.client ? ` - ${event.client}` : ''}`}
              >
                {event.title}
              </div>
            ))}
            {eventsForDay.length > 2 && (
              <div className="text-xs text-gray-500">
                +{eventsForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Calendar</h1>
          <p className="text-gray-600 mt-1">
            View all compliance deadlines and scheduled activities
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length > 0 ? (
                events.map((event: ComplianceEvent) => (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge className={getStatusColor(event.status)} variant="secondary">
                        {event.status}
                      </Badge>
                    </div>
                    {event.client && <p className="text-xs text-gray-600 mb-1">{event.client}</p>}
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Scheduled</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't scheduled any compliance events yet.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-medium">0 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">0 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due This Week</span>
                <span className="font-medium text-orange-600">0 events</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}