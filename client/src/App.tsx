import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import InvoiceCreate from "@/pages/invoice-create";
import InvoiceDetail from "@/pages/invoice-detail";
import Customers from "@/pages/customers";
import CustomerCreate from "@/pages/customer-create";
import CustomerDetail from "@/pages/customer-detail";
import CustomerPortal from "@/pages/customer-portal";
import Estimates from "@/pages/estimates";
import EstimateCreate from "@/pages/estimate-create";
import EstimateDetail from "@/pages/estimate-detail";
import Reports from "@/pages/reports";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoices/new" component={InvoiceCreate} />
      <Route path="/invoices/:id" component={InvoiceDetail} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/new" component={CustomerCreate} />
      <Route path="/customers/:id" component={CustomerDetail} />
      <Route path="/portal" component={CustomerPortal} />
      <Route path="/estimates" component={Estimates} />
      <Route path="/estimates/new" component={EstimateCreate} />
      <Route path="/estimates/:id" component={EstimateDetail} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
