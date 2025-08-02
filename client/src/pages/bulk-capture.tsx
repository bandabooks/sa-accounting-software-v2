import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, DollarSign } from "lucide-react";

export default function BulkCapture() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Capture</h1>
        <p className="text-gray-600 dark:text-gray-300">Upload and process multiple transactions at once</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload CSV, Excel, or PDF files to automatically extract transaction data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <Input type="file" multiple accept=".csv,.xlsx,.pdf" className="max-w-sm mx-auto" />
              </div>
              <Button className="w-full">Process Files</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Manual Bulk Entry
              </CardTitle>
              <CardDescription>
                Enter multiple transactions manually in a batch format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input id="batch-name" placeholder="Enter batch identifier" />
                </div>
                <div>
                  <Label htmlFor="transaction-count">Number of Transactions</Label>
                  <Input id="transaction-count" type="number" placeholder="10" />
                </div>
              </div>
              <Button className="w-full">Start Manual Entry</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}