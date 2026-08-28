import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import AllocationView from "@/pages/sip/AllocationView";
import ManageEventUplift from "@/pages/sip/ManageEventUplift";
import GenerateForecast from "@/pages/sip/GenerateForecast";
import VendorView from "@/pages/sip/VendorView";
import SkuDetail from "@/pages/sip/SkuDetail";
import DetermineGradingSize from "@/pages/rap/DetermineGradingSize";
import GradeStore from "@/pages/rap/GradeStore";
import RangeStyleNew from "@/pages/rap/RangeStyleNew";
import StyleAnalysis from "@/pages/reports/StyleAnalysis";
import ExitPlanning from "@/pages/reports/ExitPlanning";
import InventoryAging from "@/pages/reports/InventoryAging";
import SIPPlanning from "@/pages/reports/SIPPlanning";
import CreatePO from "@/pages/reports/CreatePO";
import StyleStores from "@/pages/reports/StyleStores";
import StoreSkus from "@/pages/reports/StoreSkus";
import WarehouseSkus from "@/pages/reports/WarehouseSkus";
import SIPPlanningEnhanced from "@/pages/reports/SIPPlanningEnhanced";
import CreatePOEnhanced from "@/pages/reports/CreatePOEnhanced";
import StyleExceptionManagement from "@/pages/rap/StyleExceptionManagement";
import DetermineFacingsPresentation from "@/pages/rap/DetermineFacingsPresentation";
import NotFound from "@/pages/not-found";
import PlaceholderPage from "@/pages/PlaceholderPage";
import ProductSetupWizard from "@/pages/product-setup/ProductSetupWizard";
import ManageExistingStyles from "@/pages/product-setup/ManageExistingStyles";
import ProductSetupDrafts from "@/pages/product-setup/ProductSetupDrafts";
import ProductSetupLegacyWizard from "@/pages/product-setup/ProductSetupLegacyWizard";
import ProductSetupLegacyDrafts from "@/pages/product-setup/ProductSetupLegacyDrafts";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/product-setup" />
      </Route>
      <Route path="/sip/allocation" component={AllocationView} />
      <Route path="/sip/allocation/:skuId" component={SkuDetail} />
      <Route path="/sip/event-uplift" component={ManageEventUplift} />
      <Route path="/sip/forecast" component={GenerateForecast} />
      <Route path="/sip/vendor" component={VendorView} />
      <Route path="/sip/rules">{() => <PlaceholderPage title="SIP Rules" />}</Route>
      
      <Route path="/rap/grading-size" component={DetermineGradingSize} />
      <Route path="/rap/grade-store" component={GradeStore} />
      <Route path="/rap/range-style-new" component={RangeStyleNew} />
      <Route path="/rap/style-exceptions" component={StyleExceptionManagement} />
      <Route path="/rap/facings-presentation" component={DetermineFacingsPresentation} />
      <Route path="/rap/rules">{() => <PlaceholderPage title="RAP Rules" />}</Route>

      <Route path="/reports/style-analysis" component={StyleAnalysis} />
      <Route path="/reports/exit-planning" component={ExitPlanning} />
      <Route path="/reports/inventory-aging" component={InventoryAging} />
      <Route path="/reports/sip-planning" component={SIPPlanning} />
      <Route path="/reports/sip-planning/style-stores" component={StyleStores} />
      <Route path="/reports/sip-planning/store-skus" component={StoreSkus} />
      <Route path="/reports/sip-planning/warehouse-skus" component={WarehouseSkus} />
      <Route path="/reports/sip-planning/create-po" component={CreatePO} />
      <Route path="/reports/sip-planning-enhanced" component={SIPPlanningEnhanced} />
      <Route path="/reports/sip-planning-enhanced/create-po" component={CreatePOEnhanced} />
      <Route path="/product-setup/drafts" component={ProductSetupDrafts} />
      <Route path="/product-setup/manage" component={ManageExistingStyles} />
      <Route path="/product-setup/edit/:styleCode" component={ProductSetupWizard} />
      <Route path="/product-setup/new" component={ProductSetupWizard} />
      <Route path="/product-setup" component={ProductSetupWizard} />
      <Route path="/product-setup-legacy/drafts" component={ProductSetupLegacyDrafts} />
      <Route path="/product-setup-legacy/edit/:styleCode" component={ProductSetupLegacyWizard} />
      <Route path="/product-setup-legacy/new" component={ProductSetupLegacyWizard} />
      <Route path="/product-setup-legacy" component={ProductSetupLegacyWizard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
