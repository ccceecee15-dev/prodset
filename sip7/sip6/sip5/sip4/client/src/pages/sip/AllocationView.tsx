import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Layers, ChevronRight, Search, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const MERCH_AREAS = ["All", "Main Floor", "Section A", "Section B"];
const PLANNING_GROUPS = ["All", "Group A", "Group B", "Group C"];
const SUB_PLANNING_GROUPS = ["All", "Sub Group 1", "Sub Group 2", "Sub Group 3"];
const VENDORS = ["All", "Vendor A", "Vendor B", "Vendor C", "Vendor D"];
const SUB_CATEGORIES = ["All", "Fresh Food", "Grocery", "Beverages", "Snacks", "Dairy"];

const PRODUCT_NAMES = [
  "Travel Neck Pillow", "Leather Journal A5", "Premium Ballpoint Pen Set", "Wireless Earbuds Case",
  "Passport Holder Premium", "Desktop Organizer Wood", "Charging Cable 3-Pack", "Novelty Mug Gift",
  "Pocket Calculator Solar", "Hand Sanitizer Travel", "Magnetic Bookmark Set", "USB Flash Drive 64GB",
  "Reading Glasses Case", "Compact Mirror LED", "Reusable Water Bottle", "Desk Lamp USB",
  "Fabric Notebook Cover", "Phone Stand Adjustable", "Card Wallet RFID", "Travel Adapter Universal",
  "Mechanical Pencil Set", "Screen Cleaner Kit", "Luggage Tag Set", "Tablet Sleeve 10in",
  "Fountain Pen Classic", "Cable Organizer Pouch", "Travel Sewing Kit", "Mini Stapler Set",
  "Desk Calendar 2026", "Sticky Notes Cube"
];

const FRESH_PRODUCT_NAMES = [
  "Organic Whole Milk 2L", "Fresh Sliced Bread Sourdough", "Free Range Eggs 12pk",
  "Greek Yoghurt Natural 500g", "Baby Spinach Leaves 120g", "Cheddar Cheese Block 500g",
  "Chicken Breast Fillet 500g", "Atlantic Salmon Portion 300g", "Fresh Orange Juice 1L",
  "Avocado Hass Each", "Cherry Tomatoes Punnet 250g", "Strawberries Punnet 250g",
  "Butter Unsalted 250g", "Cream Cheese 250g", "Diced Pumpkin 400g",
  "Mixed Salad Leaves 100g", "Carrot Batons 200g", "Hummus Classic 200g",
  "Mushrooms Button 200g", "Broccoli Florets 300g", "Fresh Pasta Penne 300g",
  "Semi-Skimmed Milk 1L", "Smoked Salmon 100g", "Cottage Cheese 250g",
  "Fresh Pineapple Sliced 400g", "Mango Cheeks 2pk", "Blueberries Punnet 125g",
  "Shredded Coleslaw Mix 300g", "Cucumber Continental Each", "Red Capsicum Each"
];

function rnd(min: number, max: number, dp = 0): number {
  const v = Math.random() * (max - min) + min;
  return dp ? +v.toFixed(dp) : Math.floor(v);
}

const generateMockData = () => {
  const vendorPatterns: Record<string, { safetyBase: number; forecastBase: number }> = {
    "Vendor A": { safetyBase: 2.0, forecastBase: 4500 },
    "Vendor B": { safetyBase: 2.5, forecastBase: 3200 },
    "Vendor C": { safetyBase: 1.5, forecastBase: 6800 },
    "Vendor D": { safetyBase: 2.0, forecastBase: 5100 }
  };

  return Array.from({ length: 30 }, (_, i) => {
    const vendor = VENDORS[Math.floor(i / 8) % 4 + 1];
    const pattern = vendorPatterns[vendor];

    const safetyStockWks = Math.ceil(pattern.safetyBase + (Math.random() * 0.8 - 0.4));
    const totalForecast = Math.floor(pattern.forecastBase + (Math.random() * 2000 - 1000));

    const statusRoll = Math.random();
    let status: string;
    let minWks: number;
    let riskStores: number;
    let projectedClosing: number;
    let allocDsd: number;

    if (statusRoll < 0.5) {
      status = "OK";
      minWks = parseFloat((safetyStockWks + 0.5 + Math.random() * 1.5).toFixed(1));
      riskStores = Math.floor(Math.random() * 4);
      projectedClosing = Math.floor(totalForecast * (0.35 + Math.random() * 0.25));
      allocDsd = Math.floor(totalForecast * (0.05 + Math.random() * 0.05));
    } else if (statusRoll < 0.8) {
      status = "At Risk";
      minWks = parseFloat((safetyStockWks - 0.3 + Math.random() * 0.6).toFixed(1));
      riskStores = Math.floor(4 + Math.random() * 5);
      projectedClosing = Math.floor(totalForecast * (0.12 + Math.random() * 0.10));
      allocDsd = Math.floor(totalForecast * (0.10 + Math.random() * 0.08));
    } else {
      status = "Critical";
      minWks = parseFloat((safetyStockWks - 0.8 - Math.random() * 0.5).toFixed(1));
      riskStores = Math.floor(9 + Math.random() * 12);
      projectedClosing = Math.floor(totalForecast * (0.02 + Math.random() * 0.06));
      allocDsd = Math.floor(totalForecast * (0.12 + Math.random() * 0.08));
    }

    minWks = Math.max(0.8, minWks);

    // SIP Fresh metrics — 14-day DSD flow
    const freshDailyRate = rnd(80, 600);
    const fresh14DayForecast = freshDailyRate * 14;
    const freshCurrentStock = rnd(200, 3000);
    const freshSafetyStock = Math.round(freshDailyRate * 3); // 3-day safety buffer
    const freshRequiredStock = fresh14DayForecast + freshSafetyStock;
    const freshDeficit = freshRequiredStock - freshCurrentStock;
    const freshDsdOrderQty = freshDeficit > 0 ? Math.ceil(freshDeficit / 6) * 6 : 0;
    const freshDosRemaining = freshCurrentStock > 0 ? parseFloat((freshCurrentStock / freshDailyRate).toFixed(1)) : 0;
    const freshStatusRoll = Math.random();
    const freshStatus = freshStatusRoll < 0.45 ? "OK" : freshStatusRoll < 0.75 ? "At Risk" : "Critical";

    return {
      id: i + 1,
      skuId: `SKU${10000 + i}`,
      description: PRODUCT_NAMES[i],
      vendor,
      safetyStockWks,
      totalForecast,
      projectedClosing,
      allocDsd,
      minWks,
      riskStores,
      status,
      // fresh columns
      fresh14DayForecast,
      freshCurrentStock,
      freshRequiredStock,
      freshDeficit,
      freshDsdOrderQty,
      freshDosRemaining,
      freshDailyRate,
      freshStatus,
    };
  });
};

const generateFreshData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const vendor = VENDORS[Math.floor(i / 8) % 4 + 1];
    const safetyStockWks = parseFloat((1.0 + Math.random() * 0.5).toFixed(1));
    const totalForecast = rnd(800, 3500);
    const statusRoll = Math.random();
    let status: string;
    let minWks: number;
    let riskStores: number;
    let projectedClosing: number;
    let allocDsd: number;

    if (statusRoll < 0.45) {
      status = "OK";
      minWks = parseFloat((safetyStockWks + 0.3 + Math.random() * 0.8).toFixed(1));
      riskStores = Math.floor(Math.random() * 3);
      projectedClosing = Math.floor(totalForecast * (0.25 + Math.random() * 0.2));
      allocDsd = Math.floor(totalForecast * (0.7 + Math.random() * 0.25));
    } else if (statusRoll < 0.75) {
      status = "At Risk";
      minWks = parseFloat((safetyStockWks - 0.2 + Math.random() * 0.4).toFixed(1));
      riskStores = Math.floor(3 + Math.random() * 6);
      projectedClosing = Math.floor(totalForecast * (0.08 + Math.random() * 0.08));
      allocDsd = Math.floor(totalForecast * (0.60 + Math.random() * 0.20));
    } else {
      status = "Critical";
      minWks = parseFloat((safetyStockWks - 0.6 - Math.random() * 0.4).toFixed(1));
      riskStores = Math.floor(8 + Math.random() * 14);
      projectedClosing = Math.floor(totalForecast * (0.01 + Math.random() * 0.04));
      allocDsd = Math.floor(totalForecast * (0.50 + Math.random() * 0.20));
    }

    minWks = Math.max(0.5, minWks);

    const freshDailyRate = rnd(120, 800);
    const fresh14DayForecast = freshDailyRate * 14;
    const freshCurrentStock = rnd(150, 2000);
    const freshSafetyStock = Math.round(freshDailyRate * 2);
    const freshRequiredStock = fresh14DayForecast + freshSafetyStock;
    const freshDeficit = freshRequiredStock - freshCurrentStock;
    const freshDsdOrderQty = freshDeficit > 0 ? Math.ceil(freshDeficit / 6) * 6 : 0;
    const freshDosRemaining = freshCurrentStock > 0 ? parseFloat((freshCurrentStock / freshDailyRate).toFixed(1)) : 0;
    const freshStatusRoll = Math.random();
    const freshStatus = freshStatusRoll < 0.4 ? "OK" : freshStatusRoll < 0.72 ? "At Risk" : "Critical";

    return {
      id: i + 1,
      skuId: `FRESH${10000 + i}`,
      description: FRESH_PRODUCT_NAMES[i],
      vendor,
      safetyStockWks,
      totalForecast,
      projectedClosing,
      allocDsd,
      minWks,
      riskStores,
      status,
      fresh14DayForecast,
      freshCurrentStock,
      freshRequiredStock,
      freshDeficit,
      freshDsdOrderQty,
      freshDosRemaining,
      freshDailyRate,
      freshStatus,
    };
  });
};

const STANDARD_DATA = generateMockData();
const FRESH_DATA = generateFreshData();

export default function AllocationView() {
  const [, setLocation] = useLocation();
  const [searchSku, setSearchSku] = useState("");
  const [merchArea, setMerchArea] = useState("all");
  const [planningGroup, setPlanningGroup] = useState("all");
  const [subPlanningGroup, setSubPlanningGroup] = useState("all");
  const [vendor, setVendor] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

  const isFreshFood = subCategory === "fresh-food";

  const activeData = isFreshFood ? FRESH_DATA : STANDARD_DATA;

  const filteredData = useMemo(() => {
    return activeData.filter(row => {
      if (searchSku && !row.skuId.toLowerCase().includes(searchSku.toLowerCase()) &&
          !row.description.toLowerCase().includes(searchSku.toLowerCase())) return false;
      return true;
    });
  }, [activeData, searchSku]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "OK": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "At Risk": "bg-amber-100 text-amber-700 border-amber-200",
      "Critical": "bg-red-100 text-red-700 border-red-200"
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] font-medium", styles[status])}>
        {status}
      </Badge>
    );
  };

  const TableHeader = ({ children, className = "", colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) => (
    <th
      colSpan={colSpan}
      className={cn(
        "px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-center",
        className
      )}
    >
      {children}
    </th>
  );

  const FreshGroupHeader = ({ children, colSpan }: { children?: React.ReactNode; colSpan?: number }) => (
    <th
      colSpan={colSpan}
      className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-center"
    >
      {children}
    </th>
  );

  const FreshColHeader = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
    <th className={cn(
      "px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 text-center",
      className
    )}>
      {children}
    </th>
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search SKU..."
              value={searchSku}
              onChange={(e) => setSearchSku(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => {
            setMerchArea("all");
            setPlanningGroup("all");
            setSubPlanningGroup("all");
            setVendor("all");
            setSubCategory("all");
          }}
          fields={[
            { id: "merch-area", label: "Merch Area", value: merchArea, onChange: setMerchArea, options: MERCH_AREAS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "planning-group", label: "Planning Group", value: planningGroup, onChange: setPlanningGroup, options: PLANNING_GROUPS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "sub-planning-group", label: "Sub Planning Group", value: subPlanningGroup, onChange: setSubPlanningGroup, options: SUB_PLANNING_GROUPS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "vendor", label: "Vendor", value: vendor, onChange: setVendor, options: VENDORS.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
            { id: "sub-category", label: "Sub Category", value: subCategory, onChange: setSubCategory, options: SUB_CATEGORIES.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c })) },
          ]}
        />

        {isFreshFood && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <Leaf className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Fresh Food mode active — SIP Fresh columns show 14-day DSD forecast. All quantities calculated on the DSD flow.</span>
          </div>
        )}

        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  isFreshFood ? "bg-emerald-600/10 text-emerald-600" : "bg-blue-600/10 text-blue-600"
                )}>
                  {isFreshFood ? <Leaf className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Allocation View</CardTitle>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                    {isFreshFood ? "SKU-Level Inventory · Fresh Food · DSD Flow" : "SKU-Level Inventory"}
                  </p>
                </div>
              </div>
              {isFreshFood && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] font-bold h-5 px-2 border">
                  FRESH FOOD
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  {/* Group header row — only shown when Fresh Food is active */}
                  {isFreshFood && (
                    <tr>
                      <TableHeader colSpan={10}>SIP Metrics</TableHeader>
                      <FreshGroupHeader colSpan={7}>
                        <span className="flex items-center justify-center gap-1.5">
                          <Leaf className="h-3 w-3" />
                          SIP Fresh · 14-Day DSD
                        </span>
                      </FreshGroupHeader>
                      <TableHeader colSpan={1}></TableHeader>
                    </tr>
                  )}
                  <tr>
                    <TableHeader className="w-[100px]">SKU ID</TableHeader>
                    <TableHeader className="w-[180px]">Description</TableHeader>
                    <TableHeader className="w-[100px]">Vendor</TableHeader>
                    <TableHeader className="w-[100px]">Safety Stock (wks)</TableHeader>
                    <TableHeader className="w-[100px]">Total Forecast</TableHeader>
                    <TableHeader className="w-[100px]">Proj. Closing</TableHeader>
                    <TableHeader className="w-[80px]">Alloc / DSD</TableHeader>
                    <TableHeader className="w-[70px]">Min Wks</TableHeader>
                    <TableHeader className="w-[80px]">Risk Stores</TableHeader>
                    <TableHeader className="w-[90px]">Status</TableHeader>
                    {isFreshFood && (
                      <>
                        <FreshColHeader className="w-[110px]">14 Day Forecast</FreshColHeader>
                        <FreshColHeader className="w-[100px]">Current Stock</FreshColHeader>
                        <FreshColHeader className="w-[100px]">Required Stock</FreshColHeader>
                        <FreshColHeader className="w-[90px]">Deficit</FreshColHeader>
                        <FreshColHeader className="w-[110px]">DSD Order Qty</FreshColHeader>
                        <FreshColHeader className="w-[90px]">DOS Remaining</FreshColHeader>
                        <FreshColHeader className="w-[90px]">Fresh Status</FreshColHeader>
                      </>
                    )}
                    <TableHeader className="w-[50px]"></TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="h-10 transition-colors hover:bg-slate-50/50">
                      <td className="px-2 py-2 text-[11px] font-medium border border-slate-100 text-center text-blue-600">{row.skuId}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-left truncate max-w-[180px] text-slate-700">{row.description}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center text-slate-600">{row.vendor}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">
                        {row.safetyStockWks}
                      </td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.totalForecast.toLocaleString()}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.projectedClosing.toLocaleString()}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">
                        {row.allocDsd.toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.minWks}</td>
                      <td className="px-2 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.riskStores}</td>
                      <td className="px-2 py-2 border border-slate-100 text-center">{getStatusBadge(row.status)}</td>

                      {isFreshFood && (
                        <>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums text-emerald-700 font-medium bg-emerald-50/30 dark:bg-emerald-950/10">
                            {row.fresh14DayForecast.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums text-slate-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                            {row.freshCurrentStock.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums text-slate-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                            {row.freshRequiredStock.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums bg-emerald-50/30 dark:bg-emerald-950/10">
                            <span className={cn(
                              "font-bold tabular-nums",
                              row.freshDeficit > 500 ? "text-red-600" : row.freshDeficit > 100 ? "text-orange-500" : "text-slate-400"
                            )}>
                              {row.freshDeficit.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums bg-emerald-50/30 dark:bg-emerald-950/10">
                            {row.freshDsdOrderQty > 0
                              ? <span className="font-bold text-emerald-700">{row.freshDsdOrderQty.toLocaleString()}</span>
                              : <span className="text-slate-400">—</span>
                            }
                          </td>
                          <td className="px-2 py-2 text-[11px] border border-emerald-100 dark:border-emerald-900/40 text-center tabular-nums bg-emerald-50/30 dark:bg-emerald-950/10">
                            <span className={cn(
                              "tabular-nums font-medium",
                              row.freshDosRemaining < 3 ? "text-red-600 font-bold" : row.freshDosRemaining < 7 ? "text-orange-500" : "text-slate-600"
                            )}>
                              {row.freshDosRemaining}d
                            </span>
                            {row.freshDosRemaining < 3 && (
                              <span className="ml-1 text-[9px] font-bold bg-red-100 text-red-700 rounded px-1 py-px">Urgent</span>
                            )}
                          </td>
                          <td className="px-2 py-2 border border-emerald-100 dark:border-emerald-900/40 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                            {getStatusBadge(row.freshStatus)}
                          </td>
                        </>
                      )}

                      <td className="px-2 py-2 border border-slate-100 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setLocation(`/sip/allocation/${row.skuId}`)}
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
