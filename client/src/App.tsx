import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import MarketplaceOrders from "./pages/MarketplaceOrders";
import DriverNetworkAdmin from "./pages/DriverNetworkAdmin";
import PaymentCheckout from "./pages/PaymentCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/client" component={ClientDashboard} />
      <Route path="/dashboard/driver" component={DriverDashboard} />
      <Route path="/marketplace" component={MarketplaceOrders} />
      <Route path="/admin/driver-network" component={DriverNetworkAdmin} />
      <Route path="/payment/checkout/:orderId" component={PaymentCheckout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
