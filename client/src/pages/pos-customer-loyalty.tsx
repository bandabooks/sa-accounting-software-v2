import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Star, TrendingUp, Plus, Search } from "lucide-react";

export default function POSCustomerLoyalty() {
  const [searchTerm, setSearchTerm] = useState("");

  const loyalCustomers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      points: 1250,
      tier: "Gold",
      totalSpent: 15600,
      visits: 45,
      lastVisit: "2024-01-15"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@example.com",
      points: 850,
      tier: "Silver",
      totalSpent: 8900,
      visits: 28,
      lastVisit: "2024-01-12"
    }
  ];

  const loyaltyPrograms = [
    {
      id: 1,
      name: "Points Reward",
      description: "Earn 1 point per R10 spent",
      active: true,
      members: 234
    },
    {
      id: 2,
      name: "VIP Tier System",
      description: "Bronze, Silver, Gold tiers with benefits",
      active: true,
      members: 156
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Loyalty</h1>
          <p className="text-muted-foreground">
            Manage loyalty programs and customer rewards
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">390</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R24,500</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Loyal Customers</TabsTrigger>
          <TabsTrigger value="programs">Loyalty Programs</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyal Customers</CardTitle>
              <CardDescription>
                Manage and track your most loyal customers
              </CardDescription>
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyalCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={customer.tier === "Gold" ? "default" : "secondary"}>
                        {customer.tier}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{customer.points} points</p>
                        <p className="text-sm text-muted-foreground">
                          R{customer.totalSpent.toLocaleString()} spent
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Programs</CardTitle>
              <CardDescription>
                Configure and manage your loyalty programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={program.active ? "default" : "secondary"}>
                        {program.active ? "Active" : "Inactive"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {program.members} members
                      </p>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rewards Catalog</CardTitle>
              <CardDescription>
                Manage available rewards and their point values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No rewards configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first reward to get started
                </p>
                <Button>Add Reward</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}