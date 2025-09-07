import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Building2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Paperclip,
  UserCheck,
  FolderOpen,
  CheckSquare
} from 'lucide-react';

interface DueFiling {
  id: number;
  service: 'VAT201' | 'EMP201' | 'CIPC' | 'PROV_TAX';
  entity: string;
  period: string;
  dueDate: string;
  daysUntilDue: number;
  assignee: string;
  status: 'due' | 'upcoming' | 'overdue' | 'draft';
  hasDocuments: boolean;
  client: string;
}

export default function PracticeDashboard() {
  const [location, setLocation] = useLocation();

  // Due Filings filters and selection
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [filingStatusFilter, setFilingStatusFilter] = useState('all');
  const [selectedFilings, setSelectedFilings] = useState<number[]>([]);

  // Fetch due filings
  const { data: dueFilings = [] } = useQuery({
    queryKey: ['/api/practice/due-filings'],
    queryFn: async () => {
      return [
        {
          id: 1,
          service: 'VAT201',
          entity: 'Acme Construction (Pty) Ltd',
          period: 'Feb 2024',
          dueDate: '2024-03-07',
          daysUntilDue: 5,
          assignee: 'Current User',
          status: 'due',
          hasDocuments: true,
          client: 'Acme Construction'
        },
        {
          id: 2,
          service: 'EMP201',
          entity: 'Green Valley Restaurant CC',
          period: 'Jan 2024',
          dueDate: '2024-02-07',
          daysUntilDue: -15,
          assignee: 'Current User',
          status: 'overdue',
          hasDocuments: false,
          client: 'Green Valley'
        },
        {
          id: 3,
          service: 'PROV_TAX',
          entity: 'Tech Solutions SA',
          period: 'Feb 2024',
          dueDate: '2024-02-28',
          daysUntilDue: -3,
          assignee: 'Team Member',
          status: 'overdue',
          hasDocuments: false,
          client: 'Tech Solutions'
        }
      ] as DueFiling[];
    }
  });

  // Filter due filings
  const filteredFilings = dueFilings.filter(filing => {
    const matchesAssignee = assigneeFilter === 'all' || 
      (assigneeFilter === 'me' && filing.assignee.includes('Current User')) ||
      (assigneeFilter === 'team' && !filing.assignee.includes('Current User'));
    const matchesService = serviceFilter === 'all' || filing.service === serviceFilter;
    const matchesStatus = filingStatusFilter === 'all' || filing.status === filingStatusFilter;
    return matchesAssignee && matchesService && matchesStatus;
  });

  // Metrics
  const totalClients = 6;
  const onboardingClients = 0;
  const pendingTasks = 0;
  const urgentTasks = 2;

  // Check if there are upcoming deadlines
  const upcomingDeadlines = dueFilings.filter(f => f.status === 'upcoming').length > 0;

  return (
    <div className="space-y-6" data-testid="practice-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice Management</h1>
          <p className="text-gray-600">Centralized South African compliance tracking for SARS, CIPC, and Labour requirements</p>
        </div>
        
        <div className="flex gap-3">
          <Button data-testid="button-new-client" onClick={() => setLocation('/customers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
          <Button variant="outline" data-testid="button-new-task" onClick={() => setLocation('/tasks')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* KPI Cards - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setLocation('/customers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-normal text-gray-900">{totalClients}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setLocation('/onboarding')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarding</p>
                <p className="text-2xl font-normal text-gray-900">{onboardingClients}</p>
                <p className="text-sm text-gray-500">In progress</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setLocation('/tasks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-normal text-gray-900">{pendingTasks}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
              <Clock className="h-8 w-8 text-amber-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 cursor-pointer hover:bg-rose-100 transition-colors" onClick={() => setLocation('/tasks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Tasks</p>
                <p className="text-2xl font-normal text-gray-900">{urgentTasks}</p>
                <p className="text-sm text-gray-500">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Compliance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge 
              className="bg-amber-100 text-amber-700 px-3 py-1 cursor-pointer hover:bg-amber-200 transition-colors" 
              onClick={() => setLocation('/vat-management')}
            >
              <span className="font-medium">Due</span> VAT Return (VAT201) · Due 25 Mar · <span className="font-medium">5d</span>
            </Badge>
            <Badge 
              className="bg-blue-100 text-blue-700 px-3 py-1 cursor-pointer hover:bg-blue-200 transition-colors" 
              onClick={() => setLocation('/emp201')}
            >
              <span className="font-medium">Upcoming</span> EMP201 Filing · Due 7 Apr · <span className="font-medium">upcoming</span>
            </Badge>
            <Badge 
              className="bg-rose-100 text-rose-700 px-3 py-1 cursor-pointer hover:bg-rose-200 transition-colors" 
              onClick={() => setLocation('/accountants/tax-practitioners')}
            >
              <span className="font-medium">Overdue</span> Provisional Tax · Due 28 Feb · <span className="font-medium">overdue 3d</span>
            </Badge>
          </div>
          {!upcomingDeadlines && (
            <p className="text-gray-500 text-sm mt-2">No deadlines in the next 14 days.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Due Filings Command Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Due Filings</CardTitle>
            <div className="text-sm text-gray-500">{filteredFilings.length} items</div>
          </div>
          
          {/* Filter Bar - NEW ADDITION */}
          <div className="flex flex-wrap gap-2 pt-4 border-t bg-gray-50 -mx-6 px-6 py-3 mt-4">
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-32" data-testid="select-assignee-filter">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-32" data-testid="select-service-filter">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="VAT201">VAT</SelectItem>
                <SelectItem value="EMP201">EMP</SelectItem>
                <SelectItem value="CIPC">CIPC</SelectItem>
                <SelectItem value="PROV_TAX">Prov Tax</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filingStatusFilter} onValueChange={setFilingStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-filing-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Bulk Actions - NEW ADDITION */}
            {selectedFilings.length > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" data-testid="button-assign-bulk">
                  <UserCheck className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                <Button size="sm" variant="outline" data-testid="button-request-docs-bulk">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Request Docs
                </Button>
                <Button size="sm" variant="outline" data-testid="button-mark-ready-bulk">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Mark Ready
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredFilings.map((filing) => (
              <div key={filing.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                {/* Checkbox - NEW ADDITION */}
                <input
                  type="checkbox"
                  checked={selectedFilings.includes(filing.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilings([...selectedFilings, filing.id]);
                    } else {
                      setSelectedFilings(selectedFilings.filter(id => id !== filing.id));
                    }
                  }}
                  className="rounded"
                  data-testid={`checkbox-filing-${filing.id}`}
                />
                
                <div className="flex items-center gap-3 flex-1">
                  <Badge 
                    className={`
                      ${filing.service === 'VAT201' ? 'bg-blue-100 text-blue-700' : ''}
                      ${filing.service === 'EMP201' ? 'bg-green-100 text-green-700' : ''}
                      ${filing.service === 'CIPC' ? 'bg-purple-100 text-purple-700' : ''}
                      ${filing.service === 'PROV_TAX' ? 'bg-orange-100 text-orange-700' : ''}
                    `}
                  >
                    {filing.service}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{filing.entity}</div>
                    <div className="text-sm text-gray-500">{filing.period}</div>
                  </div>
                  
                  {/* Enhanced row info - ENRICHED */}
                  <div className="text-sm text-gray-600">
                    Due {filing.dueDate}
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    filing.daysUntilDue < 0 ? 'text-rose-700' : 
                    filing.daysUntilDue <= 7 ? 'text-amber-700' : 'text-gray-600'
                  }`}>
                    {filing.daysUntilDue < 0 ? `overdue ${Math.abs(filing.daysUntilDue)}d` : `${filing.daysUntilDue}d`}
                  </div>
                  
                  <div className="text-sm text-gray-600 w-20">
                    {filing.assignee.replace('Current User', 'Me')}
                  </div>
                  
                  <Badge className={`
                    ${filing.status === 'overdue' ? 'bg-rose-100 text-rose-700' : ''}
                    ${filing.status === 'due' ? 'bg-amber-100 text-amber-700' : ''}
                    ${filing.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : ''}
                    ${filing.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {filing.status}
                  </Badge>
                  
                  {/* Document indicator - NEW ADDITION */}
                  {filing.hasDocuments && (
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  data-testid={`button-file-${filing.id}`}
                  aria-label={`File ${filing.service} ${filing.period} for ${filing.client}`}
                  onClick={() => {
                    if (filing.service === 'VAT201') {
                      setLocation('/vat-management');
                    } else if (filing.service === 'EMP201') {
                      setLocation('/emp201');
                    } else if (filing.service === 'CIPC') {
                      setLocation('/cipc-compliance');
                    } else if (filing.service === 'PROV_TAX') {
                      setLocation('/accountants/tax-practitioners');
                    }
                  }}
                >
                  File
                </Button>
              </div>
            ))}
            
            {filteredFilings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No filings match your current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setLocation('/vat-management')}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">SARS Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">Tax, VAT, PAYE eFiling</p>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setLocation('/cipc-compliance')}>
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">CIPC Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">Annual Returns · Changes</p>
            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setLocation('/labour-compliance')}>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Labour Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">UIF, SDL, COIDA</p>
            <Badge className="bg-purple-100 text-purple-700">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Balances - SINGLE BLOCK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Accounts Receivable</span>
                <span className="font-semibold text-gray-900">R 19,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accounts Payable</span>
                <span className="font-semibold text-gray-900">R 8,200</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Net Position</span>
                <span className="font-semibold text-emerald-700">R 11,300</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => setLocation('/reports/aging')}>AR aging</Button>
                <span className="text-gray-400">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" onClick={() => setLocation('/reports/aging')}>AP aging</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Tasks - GROUPED BY DATE */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Tasks</CardTitle>
              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600" onClick={() => setLocation('/tasks')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Today</div>
              <div className="ml-4 text-sm text-gray-600">
                VAT201 Return - Think MyBiz Accountants
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">Done</Badge>
              </div>
              
              <div className="text-sm font-medium text-gray-700">This Week</div>
              <div className="ml-4 text-sm text-gray-600">
                Annual Financial Statements - John Smith
                <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">In Review</Badge>
              </div>
              
              <div className="text-sm font-medium text-gray-700">Later</div>
              <div className="ml-4 text-sm text-gray-500">No upcoming tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}