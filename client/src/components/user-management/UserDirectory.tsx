import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useSuccessModal } from "@/hooks/useSuccessModal";
import { apiRequest } from "@/lib/queryClient";
import {
  MoreHorizontal,
  Edit,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  UserX
} from "lucide-react";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

interface UserDirectoryProps {
  companyId: number;
  searchTerm?: string;
  className?: string;
}

export default function UserDirectory({ 
  companyId, 
  searchTerm = "",
  className = ""
}: UserDirectoryProps) {
  const [processingUsers, setProcessingUsers] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { showSuccess } = useSuccessModal();

  // Fetch company users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users/company', companyId],
    enabled: !!companyId
  });

  // Mock user data
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'sysadmin_7f3a2b8e',
      name: 'System Administrator',
      email: 'accounts@thinkmybiz.com',
      role: 'Super Administrator',
      isActive: true,
      lastLogin: '2025-01-26T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      permissions: ['*']
    },
    {
      id: 2,
      username: 'john.doe',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Company Administrator',
      isActive: true,
      lastLogin: '2025-01-26T09:15:00Z',
      createdAt: '2024-02-15T00:00:00Z',
      permissions: ['company:manage', 'users:create', 'invoices:*']
    },
    {
      id: 3,
      username: 'jane.smith',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'Accountant',
      isActive: true,
      lastLogin: '2025-01-25T16:45:00Z',
      createdAt: '2024-03-10T00:00:00Z',
      permissions: ['invoices:*', 'financial:view', 'reports:create']
    },
    {
      id: 4,
      username: 'bob.wilson',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'Bookkeeper',
      isActive: false,
      lastLogin: '2025-01-20T14:20:00Z',
      createdAt: '2024-04-05T00:00:00Z',
      permissions: ['invoices:create', 'expenses:create', 'banking:view']
    }
  ];

  const userData = users || mockUsers;

  // Filter users based on search term
  const filteredUsers = userData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle user status
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return apiRequest(`/api/users/${userId}/status`, {
        method: 'PATCH',
        body: { isActive }
      });
    },
    onMutate: ({ userId }) => {
      setProcessingUsers(prev => new Set(prev).add(userId));
    },
    onSuccess: (data, { userId, isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/company'] });
      const user = userData.find(u => u.id === userId);
      showSuccess(
        'User Status Updated',
        `${user?.name} has been ${isActive ? 'activated' : 'deactivated'} successfully.`
      );
    },
    onError: (error) => {
      console.error('Failed to toggle user status:', error);
    },
    onSettled: (data, error, { userId }) => {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  });

  const handleUserToggle = (userId: number, newState: boolean) => {
    toggleUserMutation.mutate({ userId, isActive: newState });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super administrator':
        return 'bg-red-100 text-red-800';
      case 'company administrator':
        return 'bg-blue-100 text-blue-800';
      case 'accountant':
        return 'bg-green-100 text-green-800';
      case 'bookkeeper':
        return 'bg-yellow-100 text-yellow-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    const now = new Date();
    const lastLogin = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={user.isActive ? 'text-green-700' : 'text-red-700'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) => handleUserToggle(user.id, checked)}
                      disabled={processingUsers.has(user.id)}
                      size="sm"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatLastLogin(user.lastLogin)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 3).map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission === '*' ? 'All' : permission.split(':')[0]}
                      </Badge>
                    ))}
                    {user.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <UserX className="h-4 w-4 mr-2" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No users found</p>
          <p className="text-muted-foreground">
            {searchTerm ? `No users match "${searchTerm}"` : 'No users have been added yet'}
          </p>
        </div>
      )}
    </div>
  );
}