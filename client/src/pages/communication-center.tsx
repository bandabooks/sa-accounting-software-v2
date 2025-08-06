import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Mail, MessageCircle, Phone, Send, Eye, Calendar,
  Users, Filter, Search, Plus, Settings, Archive,
  CheckCircle, Clock, AlertCircle, Trash2, Edit,
  Smartphone, Video, FileText, Image, Paperclip
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils-invoice";
import { useToast } from "@/hooks/use-toast";

interface Communication {
  id: number;
  customerId: number;
  customerName: string;
  channel: string;
  direction: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  channel: string;
  subject: string;
  content: string;
  usageCount: number;
}

const COMMUNICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-blue-100 text-blue-800' },
  { value: 'sms', label: 'SMS', icon: MessageCircle, color: 'bg-green-100 text-green-800' },
  { value: 'phone', label: 'Phone', icon: Phone, color: 'bg-purple-100 text-purple-800' },
  { value: 'whatsapp', label: 'WhatsApp', icon: Smartphone, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'meeting', label: 'Meeting', icon: Video, color: 'bg-orange-100 text-orange-800' }
];

const COMMUNICATION_STATUS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'opened', label: 'Opened', color: 'bg-purple-100 text-purple-800', icon: Eye },
  { value: 'clicked', label: 'Clicked', color: 'bg-orange-100 text-orange-800', icon: Eye },
  { value: 'replied', label: 'Replied', color: 'bg-emerald-100 text-emerald-800', icon: MessageCircle },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle }
];

export default function CommunicationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["/api/communications"],
    queryFn: () => apiRequest("/api/communications", "GET").then(res => res.json())
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/communication-templates"],
    queryFn: () => apiRequest("/api/communication-templates", "GET").then(res => res.json())
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/communications/stats"],
    queryFn: () => apiRequest("/api/communications/stats", "GET").then(res => res.json())
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => apiRequest("/api/customers", "GET").then(res => res.json())
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/communications", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      setIsComposeOpen(false);
      toast({
        title: "Message Sent",
        description: "Your communication has been sent successfully.",
      });
    }
  });

  const filteredCommunications = communications.filter((comm: Communication) => {
    const matchesSearch = comm.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = !channelFilter || comm.channel === channelFilter;
    const matchesStatus = !statusFilter || comm.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getChannelInfo = (channel: string) => 
    COMMUNICATION_CHANNELS.find(c => c.value === channel) || COMMUNICATION_CHANNELS[0];

  const getStatusInfo = (status: string) =>
    COMMUNICATION_STATUS.find(s => s.value === status) || COMMUNICATION_STATUS[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white/60 rounded-xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Communication Center</h1>
                    <p className="text-white/80 text-lg">Unified multi-channel customer communication hub</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setIsComposeOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </div>

        {/* Communication Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {COMMUNICATION_CHANNELS.map((channel) => {
            const channelCount = stats?.[channel.value] || 0;
            const Icon = channel.icon;
            
            return (
              <Card key={channel.value} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <Badge className={channel.color}>{channel.label}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{channelCount}</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Channels</SelectItem>
                  {COMMUNICATION_CHANNELS.map(channel => (
                    <SelectItem key={channel.value} value={channel.value}>
                      <channel.icon className="w-4 h-4 mr-2 inline" />
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {COMMUNICATION_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <status.icon className="w-4 h-4 mr-2 inline" />
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredCommunications.map((comm: Communication) => {
                const channelInfo = getChannelInfo(comm.channel);
                const statusInfo = getStatusInfo(comm.status);
                const ChannelIcon = channelInfo.icon;
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={comm.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://avatar.vercel.sh/${comm.customerName}`} />
                          <AvatarFallback>{comm.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{comm.customerName}</p>
                              <p className="text-sm text-gray-600">{comm.subject}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={channelInfo.color}>
                                <ChannelIcon className="w-3 h-3 mr-1" />
                                {channelInfo.label}
                              </Badge>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{comm.content}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Sent: {formatDate(comm.sentAt)}</span>
                            {comm.openedAt && <span>Opened: {formatDate(comm.openedAt)}</span>}
                            {comm.clickedAt && <span>Clicked: {formatDate(comm.clickedAt)}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication Templates</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: Template) => {
                const channelInfo = getChannelInfo(template.channel);
                const ChannelIcon = channelInfo.icon;
                
                return (
                  <Card key={template.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={channelInfo.color}>
                          <ChannelIcon className="w-3 h-3 mr-1" />
                          {channelInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-sm">{template.subject}</p>
                          <p className="text-sm text-gray-600 line-clamp-3 mt-1">{template.content}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Used {template.usageCount} times
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm"
                                    onClick={() => setSelectedTemplate(template)}>
                              <Send className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-600" />
                    Delivery Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">96.5%</div>
                  <p className="text-sm text-gray-600">↗ 2.3% from last month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    Open Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">34.7%</div>
                  <p className="text-sm text-gray-600">↗ 1.8% from last month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Response Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">12.4%</div>
                  <p className="text-sm text-gray-600">↗ 0.9% from last month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Avg Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-2">4.2h</div>
                  <p className="text-sm text-gray-600">↘ 0.8h from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Compose Dialog */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNICATION_CHANNELS.map(channel => (
                        <SelectItem key={channel.value} value={channel.value}>
                          <channel.icon className="w-4 h-4 mr-2 inline" />
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Enter subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Type your message..." rows={6} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}