import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Settings, Activity, AlertCircle, CheckCircle, Clock, Search } from "lucide-react";

export default function PayFastPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  // Recent transactions will be loaded from API - no hardcoded demo data
  const recentTransactions: any[] = [];

  const paymentMethods = [
    { name: "Credit Card", enabled: true, fee: "2.9% + R2.50" },
    { name: "Debit Card", enabled: true, fee: "1.9% + R2.50" },
    { name: "EFT", enabled: true, fee: "R12.00" },
    { name: "Instant EFT", enabled: false, fee: "2.2% + R2.50" },
    { name: "Bitcoin", enabled: false, fee: "1.5% + R15.00" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">PayFast Payments</h1>
          <p className="text-muted-foreground">
            Manage PayFast payment gateway integration
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R12,450</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              3 pending, 2 failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R427</div>
            <p className="text-xs text-muted-foreground">
              3.4% of revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                PayFast payment transactions and their status
              </CardDescription>
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.customer}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{transaction.reference}</span>
                          <span>•</span>
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(transaction.status)}
                      <div className="text-right">
                        <p className="font-medium">R{transaction.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Payment Methods</CardTitle>
              <CardDescription>
                Configure which payment methods are available through PayFast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => {}}
                      />
                      <div>
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Processing fee: {method.fee}
                        </p>
                      </div>
                    </div>
                    <Badge variant={method.enabled ? "default" : "secondary"}>
                      {method.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  PayFast merchant settings and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant-id">Merchant ID</Label>
                  <Input
                    id="merchant-id"
                    type="text"
                    placeholder="Your PayFast Merchant ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant-key">Merchant Key</Label>
                  <Input
                    id="merchant-key"
                    type="password"
                    placeholder="Your PayFast Merchant Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Optional security passphrase"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sandbox-mode"
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="sandbox-mode">Enable Sandbox Mode</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gateway Settings</CardTitle>
                <CardDescription>
                  Payment gateway configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PayFast Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable PayFast payment processing
                    </p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-url">Return URL</Label>
                  <Input
                    id="return-url"
                    type="url"
                    defaultValue="https://yoursite.com/payment/success"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancel-url">Cancel URL</Label>
                  <Input
                    id="cancel-url"
                    type="url"
                    defaultValue="https://yoursite.com/payment/cancel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notify-url">Notify URL</Label>
                  <Input
                    id="notify-url"
                    type="url"
                    defaultValue="https://yoursite.com/api/payfast/notify"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Connection</CardTitle>
              <CardDescription>
                Verify your PayFast integration is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connection Status</p>
                  <p className="text-sm text-muted-foreground">
                    Last tested: Never
                  </p>
                </div>
                <Button variant="outline">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}