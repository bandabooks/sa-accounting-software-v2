import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Users, Clock, CheckCircle, AlertCircle, Eye, Edit3, Send, TrendingUp, BarChart3, Calendar, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface ContractTemplate {
  id: number;
  name: string;
  version: number;
  bodyMd: string;
  fields: string[];
  servicePackage: string;
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  id: number;
  templateId: number;
  clientId: number;
  status: string;
  expiresAt?: string;
  currentVersion: number;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  issued: "bg-blue-100 text-blue-800 border-blue-200", 
  signed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  expired: "bg-red-100 text-red-800 border-red-200"
};

const statusIcons = {
  draft: Edit3,
  issued: Send,
  signed: Users,
  active: CheckCircle,
  completed: CheckCircle,
  expired: AlertCircle
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ContractsNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("contracts");

  // Fetch contracts
  const { data: contractsResponse = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts", selectedStatus === "all" ? undefined : selectedStatus],
    queryFn: () => apiRequest(`/api/contracts${selectedStatus !== "all" ? `?status=${selectedStatus}` : ""}`),
  });

  const contracts = Array.isArray(contractsResponse) ? contractsResponse : [];

  // Fetch templates
  const { data: templatesResponse = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/contracts/templates"],
    queryFn: () => apiRequest("/api/contracts/templates"),
  });

  const templates = Array.isArray(templatesResponse) ? templatesResponse : [];

  // Filter contracts by search term
  const filteredContracts = contracts.filter((contract: Contract) =>
    contract.id?.toString().includes(searchTerm)
  );

  // Status statistics for dashboard cards
  const statusStats = [
    {
      title: "Active",
      count: contracts.filter((c: Contract) => c.status === "active").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Expired", 
      count: contracts.filter((c: Contract) => c.status === "expired").length,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "About to Expire",
      count: contracts.filter((c: Contract) => {
        if (!c.expiresAt) return false;
        const expiry = new Date(c.expiresAt);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiry <= thirtyDaysFromNow && expiry > new Date();
      }).length,
      icon: Clock,
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    },
    {
      title: "Recently Added",
      count: contracts.filter((c: Contract) => {
        const created = new Date(c.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return created >= sevenDaysAgo;
      }).length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Final",
      count: contracts.filter((c: Contract) => c.status === "completed").length,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Contract types data for charts
  const contractTypeData = [
    { name: "Engagement Letters", value: 30, amount: 821600 },
    { name: "VAT Practitioner", value: 20, amount: 450000 },
    { name: "Tax Compliance", value: 15, amount: 380000 },
    { name: "Annual Financials", value: 10, amount: 290000 },
    { name: "Advisory Services", value: 8, amount: 150000 },
    { name: "Payroll Services", value: 7, amount: 120000 }
  ];

  const monthlyData = [
    { month: "Jan", contracts: 12, value: 234000 },
    { month: "Feb", contracts: 15, value: 280000 },
    { month: "Mar", contracts: 18, value: 350000 },
    { month: "Apr", contracts: 14, value: 290000 },
    { month: "May", contracts: 20, value: 410000 },
    { month: "Jun", contracts: 16, value: 320000 }
  ];

  const handleCreateContract = () => {
    // Navigate to create contract page immediately without delay
    navigate("/contracts/create");
  };

  const DashboardCard = ({ title, count, icon: Icon, color, bgColor }: any) => (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{count}</p>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ContractRow = ({ contract, index }: { contract: Contract; index: number }) => {
    const StatusIcon = statusIcons[contract.status as keyof typeof statusIcons] || FileText;
    
    return (
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">{contract.id}</TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">Engagement Letter for Monthly Bookkeeping</span>
            <span className="text-sm text-gray-500">HLOTSE FREIGHT AND PROJECTS</span>
          </div>
        </TableCell>
        <TableCell>HLOTSE FREIGHT AND PROJECTS</TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">Engagement Letters</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">R21,600.00</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-sm">01-03-2024</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-sm">28-02-2025</span>
          </div>
        </TableCell>
        <TableCell>Project</TableCell>
        <TableCell>
          <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            Signed
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">
            Manage engagement letters and professional agreements
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleCreateContract} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusStats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Contracts by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contractTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Values Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Contracts Value by Type (ZAR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contractTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                data-testid="input-search-contracts"
              />
            </div>
            <div className="flex gap-3">
              <Select value="25">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Contracts Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Contract Type</TableHead>
                  <TableHead className="font-semibold">Contract Value</TableHead>
                  <TableHead className="font-semibold">Start Date</TableHead>
                  <TableHead className="font-semibold">End Date</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Signature</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredContracts.length > 0 ? (
                  filteredContracts.map((contract: Contract, index: number) => (
                    <ContractRow key={contract.id} contract={contract} index={index} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No contracts found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Create your first engagement letter to get started
                        </p>
                        <Button onClick={handleCreateContract}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Contract
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}