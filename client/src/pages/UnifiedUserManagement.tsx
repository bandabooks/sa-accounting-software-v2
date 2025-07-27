import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import UnifiedUserManagement from "@/components/user-management/UnifiedUserManagement";

export default function UnifiedUserManagementPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to access user management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <UnifiedUserManagement companyId={user.companyId || 2} />
    </div>
  );
}