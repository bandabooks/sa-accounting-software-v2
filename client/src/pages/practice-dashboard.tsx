import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Paperclip,
  UserCheck,
  FolderOpen,
  CheckSquare,
  Calendar,
  ExternalLink
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
  // Due Filings filters
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
          service: 'CIPC',
          entity: 'Tech Solutions SA',
          period: 'Annual Return 2024',
          dueDate: '2024-04-30',
          daysUntilDue: 45,
          assignee: 'Team Member',
          status: 'upcoming',
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

  // Due filings metrics
  const overdueFilings = dueFilings.filter(f => f.status === 'overdue').length;
  const dueSoonFilings = dueFilings.filter(f => f.status === 'due').length;
  const totalClients = 6;
  const onboardingClients = 0;

  return (
    <div className="space-y-6" data-testid="practice-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice Management</h1>
          <p className="text-gray-600">Centralized South African compliance tracking for SARS, CIPC, and Labour requirements</p>
        </div>
        
        <div className="flex gap-3">
          <Button data-testid="button-new-client">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
          <Button variant="outline" data-testid="button-new-task">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline" data-testid="button-request-docs">
            <FolderOpen className="h-4 w-4 mr-2" />
            Request Docs
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
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

        <Card>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-normal text-gray-900">{dueSoonFilings}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
              <Clock className="h-8 w-8 text-amber-700" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Tasks</p>
                <p className="text-2xl font-normal text-gray-900">{overdueFilings}</p>
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
            <Badge className="bg-amber-100 text-amber-700 px-3 py-1">
              VAT Return (VAT201) · Due 25 Mar · <span className="font-medium">5d</span>
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
              EMP201 Filing · Due 7 Apr · <span className="font-medium">upcoming</span>
            </Badge>
            <Badge className="bg-rose-100 text-rose-700 px-3 py-1">
              Provisional Tax · Due 28 Feb · <span className="font-medium">overdue 3d</span>
            </Badge>
            <Badge className="bg-green-100 text-green-700 px-3 py-1">
              CIPC Filing · Due 30 Apr · <span className="font-medium">upcoming</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Due Filings Command Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Due Filings</CardTitle>
            <div className="text-sm text-gray-500">{filteredFilings.length} items</div>
          </div>
          
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
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
                
                <div className="flex items-center gap-2 flex-1">
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
                  
                  <div className="text-sm text-gray-600">
                    Due {filing.dueDate} 
                    <span className={`ml-1 font-medium ${
                      filing.daysUntilDue < 0 ? 'text-rose-700' : 
                      filing.daysUntilDue <= 7 ? 'text-amber-700' : 'text-gray-600'
                    }`}>
                      ({filing.daysUntilDue < 0 ? `overdue ${Math.abs(filing.daysUntilDue)}d` : `${filing.daysUntilDue}d`})
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 w-24">
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
                  
                  {filing.hasDocuments && (
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  data-testid={`button-file-${filing.id}`}
                  aria-label={`File ${filing.service} ${filing.period} for ${filing.client}`}
                >
                  <FileText className="h-4 w-4 mr-1" />
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
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">SARS Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">Tax, VAT, PAYE eFiling</p>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">CIPC Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">Annual Returns · Changes</p>
            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Labour Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">UIF, SDL, COIDA</p>
            <Badge className="bg-purple-100 text-purple-700">Active</Badge>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <span className="font-semibold text-green-600">R 11,300</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">AR aging</Button>
                <span className="text-gray-400">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">AP aging</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Today</div>
              <div className="ml-4 text-sm text-gray-600">
                VAT201 Return - Think MyBiz Accountants
                <Badge className="ml-2 bg-green-100 text-green-700">Done</Badge>
              </div>
              
              <div className="text-sm font-medium text-gray-700">This Week</div>
              <div className="ml-4 text-sm text-gray-600">
                Annual Financial Statements - John Smith
                <Badge className="ml-2 bg-blue-100 text-blue-700">In Review</Badge>
              </div>
              
              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">View all</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Manage Clients</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="text-sm">View Calendar</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FolderOpen className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Document Library</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Compliance Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}